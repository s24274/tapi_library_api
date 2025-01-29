---
sidebar_position: 2
---

# REST API

## Książki

### Pobieranie listy książek

```http
GET /api/books
```

Parametry zapytania:
- `title` - filtrowanie po tytule
- `author` - filtrowanie po autorze
- `status` - filtrowanie po statusie (AVAILABLE, BORROWED, LOST, MAINTENANCE)
- `page` - numer strony (domyślnie: 1)
- `limit` - liczba wyników na stronę (domyślnie: 10)

Przykładowa odpowiedź:
```json
{
  "_embedded": {
    "books": [
      {
        "_id": "123",
        "title": "Władca Pierścieni",
        "author": "J.R.R. Tolkien",
        "isbn": "9780261103252",
        "status": "AVAILABLE",
        "_links": {
          "self": { "href": "/api/books/123" },
          "borrow": { "href": "/api/books/123/borrow", "method": "POST" }
        }
      }
    ]
  },
  "_links": {
    "self": { "href": "/api/books?page=1&limit=10" },
    "next": { "href": "/api/books?page=2&limit=10" }
  }
}
```

### Dodawanie nowej książki

```http
POST /api/books
```

Przykładowe body:
```json
{
  "title": "Władca Pierścieni",
  "author": "J.R.R. Tolkien",
  "isbn": "9780261103252"
}
```

## Użytkownicy

### Pobieranie listy użytkowników

```http
GET /api/users
```

### Dodawanie nowego użytkownika

```http
POST /api/users
```

Przykładowe body:
```json
{
  "name": "Jan Kowalski",
  "email": "jan.kowalski@example.com"
}
```

## Wypożyczenia

### Pobieranie listy wypożyczeń

```http
GET /api/borrowings
```

### Tworzenie nowego wypożyczenia

```http
POST /api/borrowings
```

Przykładowe body:
```json
{
  "bookId": "123",
  "userId": "456"
}
```

## Autorzy

### Pobieranie listy autorów

```http
GET /api/authors
```

### Dodawanie nowego autora

```http
POST /api/authors
```

Przykładowe body:
```json
{
  "name": "J.R.R. Tolkien",
  "nationality": "British",
  "birthYear": 1892
}
``` 