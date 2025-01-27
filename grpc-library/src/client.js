const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.resolve(__dirname, '../proto/library.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
const LibraryService = protoDescriptor.library.LibraryService;

const client = new LibraryService(
  '127.0.0.1:50051',
  grpc.credentials.createInsecure()
);

// test client
async function testClient() {
  // Dodaj książkę
  client.createBook({
    title: "Władca Pierścieni",
    author: "J.R.R. Tolkien",
    isbn: "978-0618640157"
  }, (error, book) => {
    if (error) {
      console.error(error);
      return;
    }
    console.log('Book created:', book);
  });

  // get books
  client.getBooks({
    page: 1,
    limit: 10
  }, (error, response) => {
    if (error) {
      console.error(error);
      return;
    }
    console.log('Books:', response.books);
    console.log('Total count:', response.totalCount);
  });
}

async function testAllOperations() {
  // 1. create book
  console.log('=== Test 1: Create Book ===');
  client.createBook({
    title: "Wiedźmin",
    author: "Andrzej Sapkowski",
    isbn: "978-8375780636"
  }, logResponse('Create Book'));

  // 2. get books
  console.log('\n=== Test 2: Get Books ===');
  client.getBooks({
    page: 1,
    limit: 10
  }, logResponse('Get Books'));

  // 3.search books (filter by title)
  console.log('\n=== Test 3: Search Books ===');
  client.getBooks({
    titleFilter: "Wiedźmin",
    page: 1,
    limit: 10
  }, logResponse('Search Books'));

  // 4. create autor
  console.log('\n=== Test 4: Create Author ===');
  client.createAuthor({
    name: "Andrzej Sapkowski",
    nationality: "Polish",
    birthYear: 1948
  }, logResponse('Create Author'));

  // 5. get authors
  console.log('\n=== Test 5: Get Authors ===');
  client.getAuthors({}, logResponse('Get Authors'));
}

function logResponse(operation) {
  return (error, response) => {
    if (error) {
      console.error(`Error in ${operation}:`, error);
      return;
    }
    console.log(`${operation} response:`, JSON.stringify(response, null, 2));
  };
}

//start test
testAllOperations(); 