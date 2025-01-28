const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const mongoose = require('mongoose');
const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');
const bookRoutes = require('./routes/bookRoutes');

const app = express();

// Middleware
app.use(express.json());

// REST Routes
app.use('/api/books', bookRoutes);

// GraphQL Server
const server = new ApolloServer({
  typeDefs,
  resolvers
});

async function startServer() {
  await server.start();
  
  // Apply GraphQL middleware
  app.use('/graphql', expressMiddleware(server));

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
    console.log(`REST API endpoint: http://localhost:${PORT}/api/books`);
  });
}

mongoose.connect('mongodb://localhost:27017/library')
  .then(() => {
    console.log('Connected to MongoDB');
    startServer();
  })
  .catch((err) => console.error('Could not connect to MongoDB:', err)); 