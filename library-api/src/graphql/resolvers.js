const Book = require('../models/Book');
const Author = require('../models/Author');
const User = require('../models/User');
const Borrowing = require('../models/Borrowing');
const { GraphQLScalarType, Kind } = require('graphql');

const resolvers = {
  DateTime: {
    serialize(value) {
      return value.toISOString();
    },
    parseValue(value) {
      return new Date(value);
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.STRING) {
        return new Date(ast.value);
      }
      return null;
    }
  },

  ISBN: new GraphQLScalarType({
    name: 'ISBN',
    description: 'ISBN scalar type',
    serialize(value) {
      return value.replace(/[-\s]/g, '');
    },
    parseValue(value) {
      const isbnRegex = /^(?:\d{10}|\d{13})$/;
      if (!isbnRegex.test(value.replace(/[-\s]/g, ''))) {
        throw new Error('Invalid ISBN format');
      }
      return value;
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.STRING) {
        const value = ast.value.replace(/[-\s]/g, '');
        const isbnRegex = /^(?:\d{10}|\d{13})$/;
        if (!isbnRegex.test(value)) {
          throw new Error('Invalid ISBN format');
        }
        return value;
      }
      return null;
    }
  }),

  EmailAddress: new GraphQLScalarType({
    name: 'EmailAddress',
    description: 'Email address scalar type',
    serialize(value) {
      return value;
    },
    parseValue(value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        throw new Error('Invalid email address');
      }
      return value;
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.STRING) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(ast.value)) {
          throw new Error('Invalid email address');
        }
        return ast.value;
      }
      return null;
    }
  }),

  Query: {
    books: async (_, args) => {
      const filter = {};
      if (args.title) filter.title = { $regex: args.title, $options: 'i' };
      if (args.author) filter.author = { $regex: args.author, $options: 'i' };
      if (args.status) filter.status = args.status;

      const sort = {};
      if (args.sortBy) {
        sort[args.sortBy] = args.sortOrder === 'DESC' ? -1 : 1;
      }

      const page = args.page || 1;
      const limit = args.limit || 10;
      const skip = (page - 1) * limit;

      const books = await Book.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit);

      const totalCount = await Book.countDocuments(filter);
      const hasNextPage = totalCount > skip + books.length;

      return {
        books,
        totalCount,
        hasNextPage
      };
    },
    book: async (_, { id }) => await Book.findById(id),
    authors: async () => await Author.find(),
    author: async (_, { id }) => await Author.findById(id),
    users: async () => await User.find(),
    user: async (_, { id }) => await User.findById(id),
    borrowings: async () => {
      const borrowings = await Borrowing.find()
        .populate('book')
        .populate('user');
      return borrowings;
    },
    borrowing: async (_, { id }) => {
      return await Borrowing.findById(id)
        .populate('book')
        .populate('user');
    }
  },

  Mutation: {
    addBook: async (_, { input }) => {
      const book = new Book({
        ...input,
        status: 'AVAILABLE',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return await book.save();
    },

    updateBook: async (_, { id, input }) => {
      return await Book.findByIdAndUpdate(
        id,
        {
          ...input,
          updatedAt: new Date()
        },
        { new: true, runValidators: true }
      );
    },

    deleteBook: async (_, { id }) => {
      const result = await Book.findByIdAndDelete(id);
      return !!result;
    },

    addAuthor: async (_, { input }) => {
      const author = new Author({
        ...input,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return await author.save();
    },

    addUser: async (_, { input }) => {
      const user = new User({
        ...input,
        status: 'ACTIVE',
        membershipDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return await user.save();
    },

    createBorrowing: async (_, { bookId, userId, dueDate }) => {
      const book = await Book.findById(bookId);
      if (!book || book.status !== 'AVAILABLE') {
        throw new Error('Book is not available');
      }

      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const borrowing = new Borrowing({
        book: bookId,
        user: userId,
        borrowDate: new Date(),
        dueDate: dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await Book.findByIdAndUpdate(bookId, { 
        status: 'BORROWED',
        updatedAt: new Date()
      });
      
      const savedBorrowing = await borrowing.save();
      return await Borrowing.findById(savedBorrowing._id)
        .populate('book')
        .populate('user');
    },

    returnBook: async (_, { borrowingId }) => {
      const borrowing = await Borrowing.findById(borrowingId)
        .populate('book')
        .populate('user');
        
      if (!borrowing || borrowing.status === 'RETURNED') {
        throw new Error('Invalid borrowing');
      }

      await Book.findByIdAndUpdate(borrowing.book._id, { 
        status: 'AVAILABLE',
        updatedAt: new Date()
      });
      
      borrowing.returnDate = new Date();
      borrowing.status = 'RETURNED';
      borrowing.updatedAt = new Date();
      const savedBorrowing = await borrowing.save();
      
      return await Borrowing.findById(savedBorrowing._id)
        .populate('book')
        .populate('user');
    }
  },

  Book: {
    borrowings: async (book) => {
      return await Borrowing.find({ book: book._id })
        .populate('book')
        .populate('user');
    }
  },

  Author: {
    books: async (author) => await Book.find({ author: author.name })
  },

  User: {
    borrowings: async (user) => {
      return await Borrowing.find({ user: user._id })
        .populate('book')
        .populate('user');
    }
  },

  Borrowing: {
    book: async (borrowing) => await Book.findById(borrowing.book),
    user: async (borrowing) => await User.findById(borrowing.user)
  }
};

module.exports = resolvers; 