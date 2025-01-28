const typeDefs = `#graphql
  # Enumy dla stałych wartości
  enum BookStatus {
    AVAILABLE
    BORROWED
    LOST
    MAINTENANCE
  }

  enum UserStatus {
    ACTIVE
    SUSPENDED
    BLOCKED
  }

  enum BorrowingStatus {
    ACTIVE
    RETURNED
    OVERDUE
  }

  enum SortOrder {
    ASC
    DESC
  }

  # Typy wejściowe
  input BookInput {
    title: String!
    author: String!
    isbn: String!
  }

  input BookUpdateInput {
    title: String
    author: String
    isbn: String
    status: BookStatus
  }

  input AuthorInput {
    name: String!
    nationality: String
    birthYear: Int
  }

  input UserInput {
    name: String!
    email: String!
  }

  # Typ dla paginacji
  type PaginatedBooks {
    books: [Book]!
    totalCount: Int!
    hasNextPage: Boolean!
  }

  # Custom scalars
  scalar DateTime
  scalar EmailAddress
  scalar ISBN
  scalar URL
  scalar JSON

  # Główne typy
  type Book {
    _id: ID!
    title: String!
    author: String!
    isbn: ISBN!
    status: BookStatus!
    borrowings: [Borrowing]
    createdAt: DateTime!
    updatedAt: DateTime
  }

  type Author {
    _id: ID!
    name: String!
    nationality: String
    birthYear: Int
    books: [Book]
    createdAt: DateTime!
    updatedAt: DateTime
  }

  type User {
    _id: ID!
    name: String!
    email: EmailAddress!
    membershipDate: DateTime!
    status: UserStatus!
    borrowings: [Borrowing]
    createdAt: DateTime!
    updatedAt: DateTime
  }

  type Borrowing {
    _id: ID!
    book: Book!
    user: User!
    borrowDate: DateTime!
    dueDate: DateTime!
    returnDate: DateTime
    status: BorrowingStatus!
    createdAt: DateTime!
    updatedAt: DateTime
  }

  type Query {
    books(
      title: String
      author: String
      status: BookStatus
      page: Int
      limit: Int
      sortBy: String
      sortOrder: SortOrder
    ): PaginatedBooks!
    book(id: ID!): Book
    authors: [Author]!
    author(id: ID!): Author
    users: [User]!
    user(id: ID!): User
    borrowings: [Borrowing]!
    borrowing(id: ID!): Borrowing
  }

  type Mutation {
    addBook(input: BookInput!): Book!
    updateBook(id: ID!, input: BookUpdateInput!): Book!
    deleteBook(id: ID!): Boolean!

    addAuthor(input: AuthorInput!): Author!
    
    addUser(input: UserInput!): User!

    createBorrowing(
      bookId: ID!
      userId: ID!
      dueDate: DateTime
    ): Borrowing!

    returnBook(borrowingId: ID!): Borrowing!
  }
`;

module.exports = typeDefs; 