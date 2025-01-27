const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');

//  .proto file
const PROTO_PATH = path.resolve(__dirname, '../proto/library.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
const libraryProto = protoDescriptor.library;

// MongoDB connection
const MONGO_URI = 'mongodb://localhost:27017';
const DB_NAME = 'library';
let db;

// server implement 
const server = new grpc.Server();

server.addService(libraryProto.LibraryService.service, {
  // Books
  async getBooks(call, callback) {
    console.log('Received getBooks request:', call.request);
    try {
      const { titleFilter, authorFilter, statusFilter, page = 1, limit = 10, sortBy } = call.request;
      const query = {};
      
      if (titleFilter) query.title = new RegExp(titleFilter, 'i');
      if (authorFilter) query.author = new RegExp(authorFilter, 'i');
      if (statusFilter) query.status = statusFilter;

      const skip = (page - 1) * limit;
      const sort = {};
      if (sortBy) {
        const [field, order] = sortBy.split(':');
        sort[field] = order === 'desc' ? -1 : 1;
      }

      const books = await db.collection('books')
        .find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .toArray();

      const totalCount = await db.collection('books').countDocuments(query);

      callback(null, { books, totalCount });
    } catch (error) {
      console.error('Error in getBooks:', error);
      callback(error);
    }
  },

  async getBook(call, callback) {
    try {
      const book = await db.collection('books').findOne({ 
        _id: new ObjectId(call.request.id) 
      });
      callback(null, book);
    } catch (error) {
      callback(error);
    }
  },

  async createBook(call, callback) {
    try {
      // isbn exists?
      const existingBook = await db.collection('books').findOne({ 
        isbn: call.request.isbn 
      });
      
      if (existingBook) {
        callback({
          code: grpc.status.ALREADY_EXISTS,
          message: 'Book with this ISBN already exists'
        });
        return;
      }

      const result = await db.collection('books').insertOne({
        ...call.request,
        status: 'available'
      });
      const book = await db.collection('books').findOne({ 
        _id: result.insertedId 
      });
      callback(null, book);
    } catch (error) {
      console.error('Error in createBook:', error);
      callback(error);
    }
  },

  // Authors
  async getAuthors(call, callback) {
    console.log('Received getAuthors request');
    try {
      const authors = await db.collection('authors').find().toArray();
      callback(null, { authors });
    } catch (error) {
      console.error('Error in getAuthors:', error);
      callback(error);
    }
  },

  async getAuthor(call, callback) {
    console.log('Received getAuthor request:', call.request);
    try {
      const author = await db.collection('authors').findOne({ 
        _id: new ObjectId(call.request.id) 
      });
      callback(null, author);
    } catch (error) {
      console.error('Error in getAuthor:', error);
      callback(error);
    }
  },

  async createAuthor(call, callback) {
    console.log('Received createAuthor request:', call.request);
    try {
      const result = await db.collection('authors').insertOne(call.request);
      const author = await db.collection('authors').findOne({ 
        _id: result.insertedId 
      });
      callback(null, author);
    } catch (error) {
      console.error('Error in createAuthor:', error);
      callback(error);
    }
  },

  // Borrowings
  async createBorrowing(call, callback) {
    console.log('Received createBorrowing request:', call.request);
    try {
      const { bookId, userId } = call.request;
      
      // books available?
      const book = await db.collection('books').findOne({ 
        _id: new ObjectId(bookId) 
      });
      if (!book || book.status !== 'available') {
        throw new Error('Book is not available');
      }

      // borrowing created
      const borrowing = {
        bookId: new ObjectId(bookId),
        userId: new ObjectId(userId),
        borrowDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // +14 dni
        status: 'active'
      };

      const result = await db.collection('borrowings').insertOne(borrowing);
      
      // update book status
      await db.collection('books').updateOne(
        { _id: new ObjectId(bookId) },
        { $set: { status: 'borrowed' } }
      );

      const createdBorrowing = await db.collection('borrowings').findOne({ 
        _id: result.insertedId 
      });
      callback(null, createdBorrowing);
    } catch (error) {
      console.error('Error in createBorrowing:', error);
      callback(error);
    }
  },

  async returnBook(call, callback) {
    console.log('Received returnBook request:', call.request);
    try {
      const borrowing = await db.collection('borrowings').findOne({ 
        _id: new ObjectId(call.request.borrowingId) 
      });
      
      if (!borrowing || borrowing.status !== 'active') {
        throw new Error('Invalid borrowing');
      }

      // update borrowing status
      const updatedBorrowing = await db.collection('borrowings').findOneAndUpdate(
        { _id: new ObjectId(call.request.borrowingId) },
        { 
          $set: { 
            status: 'returned',
            returnDate: new Date().toISOString()
          } 
        },
        { returnDocument: 'after' }
      );

      // update book status
      await db.collection('books').updateOne(
        { _id: borrowing.bookId },
        { $set: { status: 'available' } }
      );

      callback(null, updatedBorrowing.value);
    } catch (error) {
      console.error('Error in returnBook:', error);
      callback(error);
    }
  }
});

// Start serwera
async function startServer() {
  console.log('Starting gRPC server...');
  try {
    console.log('Connecting to MongoDB...');
    const client = await MongoClient.connect(MONGO_URI);
    console.log('MongoDB connection successful');
    
    db = client.db(DB_NAME);
    console.log(`Connected to database: ${DB_NAME}`);
    
    server.bindAsync(
      '127.0.0.1:50051',
      grpc.ServerCredentials.createInsecure(),
      (error, port) => {
        if (error) {
          console.error('Failed to start gRPC server:', error);
          return;
        }
        console.log(`gRPC server running at http://127.0.0.1:${port}`);
        console.log('Server ready for requests');
      }
    );
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

startServer(); 