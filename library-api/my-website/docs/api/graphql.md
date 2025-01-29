---
sidebar_position: 3
---

# GraphQL API

## Queries

### Pobieranie książek

```graphql
query GetBooks {
  books {
    id
    title
    author
    isbn
    status
  }
}
```

### Pobieranie książki po ID

```graphql
query GetBook($id: ID!) {
  book(id: $id) {
    id
    title
    author
    isbn
    status
  }
}
```

### Pobieranie wypożyczeń

```graphql
query GetBorrowings {
  borrowings {
    id
    book {
      title
      author
    }
    user {
      name
      email
    }
    borrowDate
    dueDate
    status
  }
}
```

## Mutations

### Dodawanie nowej książki

```graphql
mutation AddBook($input: BookInput!) {
  addBook(input: $input) {
    id
    title
    author
    isbn
    status
  }
}
```

Przykładowe zmienne:
```json
{
  "input": {
    "title": "Władca Pierścieni",
    "author": "J.R.R. Tolkien",
    "isbn": "9780261103252"
  }
}
```

### Tworzenie wypożyczenia

```graphql
mutation CreateBorrowing($input: BorrowingInput!) {
  createBorrowing(input: $input) {
    id
    book {
      title
    }
    user {
      name
    }
    borrowDate
    dueDate
    status
  }
}
```

Przykładowe zmienne:
```json
{
  "input": {
    "bookId": "123",
    "userId": "456"
  }
}
```

## Typy

### Book

```graphql
type Book {
  id: ID!
  title: String!
  author: String!
  isbn: String!
  status: BookStatus!
  createdAt: DateTime!
  updatedAt: DateTime!
}

enum BookStatus {
  AVAILABLE
  BORROWED
  LOST
  MAINTENANCE
}
```

### User

```graphql
type User {
  id: ID!
  name: String!
  email: String!
  status: UserStatus!
  membershipDate: DateTime!
  borrowings: [Borrowing!]
}

enum UserStatus {
  ACTIVE
  SUSPENDED
  BLOCKED
}
```

### Borrowing

```graphql
type Borrowing {
  id: ID!
  book: Book!
  user: User!
  borrowDate: DateTime!
  dueDate: DateTime!
  returnDate: DateTime
  status: BorrowingStatus!
}

enum BorrowingStatus {
  ACTIVE
  RETURNED
  OVERDUE
}
``` 