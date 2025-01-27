const Book = require('../models/Book');
const Author = require('../models/Author');
const User = require('../models/User');
const Borrowing = require('../models/Borrowing');

const resolvers = {
  Query: {
    books: async (_, args) => {
      const filter = {};
      if (args.title) filter.title = { $regex: args.title, $options: 'i' };
      if (args.author) filter.author = { $regex: args.author, $options: 'i' };
      if (args.status) filter.status = args.status;

      const sort = {};
      if (args.sortBy) {
        const [field, order] = args.sortBy.split(':');
        sort[field] = order === 'desc' ? -1 : 1;
      }

      const page = args.page || 1;
      const limit = args.limit || 10;
      const skip = (page - 1) * limit;

      return await Book.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit);
    },
    book: async (_, { id }) => await Book.findById(id),
    authors: async () => await Author.find(),
    author: async (_, { id }) => await Author.findById(id),
    users: async () => await User.find(),
    user: async (_, { id }) => await User.findById(id),
    borrowings: async () => await Borrowing.find().populate('book user'),
    borrowing: async (_, { id }) => await Borrowing.findById(id).populate('book user'),
  },

  Mutation: {
    addBook: async (_, args) => {
      const book = new Book(args);
      return await book.save();
    },

    updateBook: async (_, { id, ...args }) => {
      return await Book.findByIdAndUpdate(
        id,
        args,
        { new: true, runValidators: true }
      );
    },

    deleteBook: async (_, { id }) => {
      const result = await Book.findByIdAndDelete(id);
      return !!result;
    },

    addAuthor: async (_, args) => {
      const author = new Author(args);
      return await author.save();
    },

    addUser: async (_, args) => {
      const user = new User(args);
      return await user.save();
    },

    createBorrowing: async (_, { bookId, userId }) => {
      const book = await Book.findById(bookId);
      if (!book || book.status !== 'available') {
        throw new Error('Book is not available');
      }

      const borrowing = new Borrowing({
        book: bookId,
        user: userId,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      });

      await Book.findByIdAndUpdate(bookId, { status: 'borrowed' });
      return await borrowing.save();
    },

    returnBook: async (_, { borrowingId }) => {
      const borrowing = await Borrowing.findById(borrowingId);
      if (!borrowing || borrowing.status === 'returned') {
        throw new Error('Invalid borrowing');
      }

      await Book.findByIdAndUpdate(borrowing.book, { status: 'available' });
      
      borrowing.returnDate = new Date();
      borrowing.status = 'returned';
      return await borrowing.save();
    }
  },

  // Resolvers
  Book: {
    borrowings: async (book) => await Borrowing.find({ book: book._id })
  },

  Author: {
    books: async (author) => await Book.find({ author: author.name })
  },

  User: {
    borrowings: async (user) => await Borrowing.find({ user: user._id })
  }
};

module.exports = resolvers; 