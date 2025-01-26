const typeDefs = `#graphql
  type Book {
    _id: ID!
    title: String!
    author: String!
    isbn: String!
    status: String!
    borrowings: [Borrowing]
  }

  type Author {
    _id: ID!
    name: String!
    nationality: String
    birthYear: Int
    books: [Book]
  }

  type User {
    _id: ID!
    name: String!
    email: String!
    membershipDate: String!
    status: String!
    borrowings: [Borrowing]
  }

  type Borrowing {
    _id: ID!
    book: Book!
    user: User!
    borrowDate: String!
    dueDate: String!
    returnDate: String
    status: String!
  }

  type Query {
    books(
      title: String
      author: String
      status: String
      page: Int
      limit: Int
      sortBy: String
    ): [Book]
    book(id: ID!): Book
    authors: [Author]
    author(id: ID!): Author
    users: [User]
    user(id: ID!): User
    borrowings: [Borrowing]
    borrowing(id: ID!): Borrowing
  }

  type Mutation {
    addBook(
      title: String!
      author: String!
      isbn: String!
    ): Book

    updateBook(
      id: ID!
      title: String
      author: String
      isbn: String
    ): Book

    deleteBook(id: ID!): Boolean

    addAuthor(
      name: String!
      nationality: String
      birthYear: Int
    ): Author

    addUser(
      name: String!
      email: String!
    ): User

    createBorrowing(
      bookId: ID!
      userId: ID!
    ): Borrowing

    returnBook(
      borrowingId: ID!
    ): Borrowing
  }
`;

module.exports = typeDefs; 