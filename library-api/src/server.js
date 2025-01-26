const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Swagger configuration
const swaggerDocument = require('./openapi.json');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Połączenie z MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/library')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use(cors());
app.use(express.json());

// Routery dla REST API
const booksRouter = require('./routes/books');
const authorsRouter = require('./routes/authors');
const usersRouter = require('./routes/users');
const borrowingsRouter = require('./routes/borrowings');

// GraphQL setup
const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');

const setupApollo = async () => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true,
  });

  await server.start();
  
  app.use('/graphql', 
    cors(),
    express.json(),
    expressMiddleware(server)
  );
};

// Inicjalizacja GraphQL
setupApollo().then(() => {
  console.log('GraphQL server ready at /graphql');
});

// Podstawowy endpoint REST
app.get('/', (req, res) => {
  res.json({
    message: 'Library API',
    _links: {
      self: { href: '/' },
      books: { href: '/api/books' },
      authors: { href: '/api/authors' },
      users: { href: '/api/users' },
      borrowings: { href: '/api/borrowings' },
      graphql: { href: '/graphql' }
    }
  });
});

// REST endpoints
app.use('/api/books', booksRouter);
app.use('/api/authors', authorsRouter);
app.use('/api/users', usersRouter);
app.use('/api/borrowings', borrowingsRouter);

// Obsługa błędów
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Wystąpił błąd serwera',
    _links: {
      self: { href: req.originalUrl }
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`REST API available at http://localhost:${port}`);
  console.log(`GraphQL Playground available at http://localhost:${port}/graphql`);
}); 