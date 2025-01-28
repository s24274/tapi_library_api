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
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Library API',
      version: '1.0.0',
      description: 'REST API for library management system',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
  },
  apis: [
    path.join(__dirname, 'routes', '*.js'),
    path.join(__dirname, 'models', '*.js')
  ],
};

const swaggerSpec = swaggerJsdoc(options);

// Endpoint dla dokumentacji JSON
app.get('/api/openapi.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/library')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use(cors());
app.use(express.json());

// Routers for REST API
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

// Init GraphQL
setupApollo().then(() => {
  console.log('GraphQL server ready at /graphql');
});

// basic endpoint REST
app.get('/', (req, res) => {
  res.json({
    message: 'Library API',
    _links: {
      self: { href: '/' },
      books: { href: '/api/books' },
      authors: { href: '/api/authors' },
      users: { href: '/api/users' },
      borrowings: { href: '/api/borrowings' },
      graphql: { href: '/graphql' },
      documentation: {
        openapi_json: { href: '/api/openapi.json' },
        swagger_ui: { href: '/api-docs' },
        api_docs: { href: '/api/docs' }
      }
    }
  });
});

// REST endpoints
app.use('/api/books', booksRouter);
app.use('/api/authors', authorsRouter);
app.use('/api/users', usersRouter);
app.use('/api/borrowings', borrowingsRouter);

// Możesz też dodać endpoint HTML z dokumentacją
app.get('/api/docs', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Library API Documentation</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css">
        <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
      </head>
      <body>
        <div id="swagger-ui"></div>
        <script>
          window.onload = () => {
            window.ui = SwaggerUIBundle({
              url: '/api/openapi.json',
              dom_id: '#swagger-ui',
            });
          };
        </script>
      </body>
    </html>
  `);
});

// errors handling
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