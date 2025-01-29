---
sidebar_position: 1
---

# Wprowadzenie

Witaj w dokumentacji Library API! Ten system zapewnia kompleksowe rozwiązanie do zarządzania biblioteką, oferując zarówno REST API jak i GraphQL API.

## Funkcjonalności

- **Zarządzanie Książkami**
  - Dodawanie, edycja i usuwanie książek
  - Wyszukiwanie i filtrowanie książek
  - Śledzenie statusu książek (dostępne, wypożyczone, w naprawie)

- **Zarządzanie Użytkownikami**
  - Rejestracja i zarządzanie użytkownikami
  - Śledzenie historii wypożyczeń
  - Zarządzanie statusem członkostwa

- **System Wypożyczeń**
  - Wypożyczanie i zwracanie książek
  - Automatyczne śledzenie terminów zwrotu
  - Historia wypożyczeń

- **Zarządzanie Autorami**
  - Katalogowanie autorów
  - Powiązanie autorów z książkami
  - Informacje biograficzne

## Dostępne API

### REST API
REST API jest dostępne pod adresem `http://localhost:3000/api` i oferuje następujące endpointy:

- `/api/books` - zarządzanie książkami
- `/api/users` - zarządzanie użytkownikami
- `/api/authors` - zarządzanie autorami
- `/api/borrowings` - zarządzanie wypożyczeniami

Pełna dokumentacja REST API jest dostępna w [Swagger UI](http://localhost:3000/api-docs).

### GraphQL API
GraphQL API jest dostępne pod adresem `http://localhost:3000/graphql` i oferuje:

- Queries do pobierania danych
- Mutations do modyfikacji danych
- Subskrypcje do śledzenia zmian w czasie rzeczywistym

Możesz eksplorować API używając [GraphQL Playground](http://localhost:3000/graphql).

## Uruchamianie Aplikacji

1. Uruchom API:
```bash
cd library-api
npm start
```

2. Uruchom dokumentację (w osobnym terminalu):
```bash
cd library-api/my-website
npm start
```

API będzie dostępne pod adresem `http://localhost:3000`, a dokumentacja pod `http://localhost:3001`.

## Wymagania Techniczne

- Node.js v14 lub nowszy
- MongoDB v4.4 lub nowszy
- npm lub yarn
