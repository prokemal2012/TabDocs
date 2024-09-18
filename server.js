const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const { Pool } = require('pg');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const db = require('./db');  // Import the db.js file

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// PostgreSQL connection setup
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'Artude31',  // Replace with your PostgreSQL password
  port: 5432,
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cookieParser());

// Authentication middleware
function isAuthenticated(req, res, next) {
  if (req.cookies.userId) {
    next();
  } else {
    res.redirect('/login');
  }
}

// Collaborators storage per document
const collaboratorsByDoc = {};

// Routes
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

  if (user.rows.length > 0 && bcrypt.compareSync(password, user.rows[0].password)) {
    res.cookie('userId', user.rows[0].id);
    res.redirect('/dashboard');
  } else {
    res.redirect('/login');
  }
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 8);

  await pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, hashedPassword]);
  res.redirect('/login');
});

app.get('/dashboard', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Route to create a new document and track the creator's username
app.post('/create-doc', isAuthenticated, async (req, res) => {
  const docId = uuidv4();
  const userId = req.cookies.userId;

  // Fetch the username of the logged-in user
  const user = await pool.query('SELECT username FROM users WHERE id = $1', [userId]);
  const username = user.rows[0].username;  // Get the username

  const docName = 'Untitled Document';  // Default document name

  // Create the document with the document name
  await db.createDocument(userId, docId, username, docName);

  // Redirect using a named query parameter
  res.redirect(`/docid?docid=${docId}`);
});

// Route to fetch documents created by the user (for dashboard previews)
app.get('/get-documents', isAuthenticated, async (req, res) => {
  const userId = req.cookies.userId;

  // Fetch all documents created by the current user
  const documents = await db.findDocumentsByUserId(userId);

  res.json(documents);  // Send the documents back as JSON
});

// Serve the document page
app.get('/docid', isAuthenticated, async (req, res) => {
  const docId = req.query.docid;  // Get the document ID from the query parameter

  // Fetch the document from the database
  const doc = await db.findDocumentByDocId(docId);  // Use db.findDocumentByDocId

  // If the document exists, load the editor
  if (doc) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } else {
    res.status(404).send('Document not found');
  }
});

// Real-time collaboration with Socket.io
io.on('connection', (socket) => {
  socket.on('joinDoc', async (docId) => {
    socket.join(docId);

    // Initialize the collaborators list for the document
    if (!collaboratorsByDoc[docId]) {
      collaboratorsByDoc[docId] = [];
    }

    // Generate a unique user identifier (e.g., initials from socket ID)
    const userId = socket.id;  // Use socket ID as a unique identifier
    const userInitial = userId.slice(0, 2).toUpperCase();  // Use the first 2 letters as initials

    // Add the user to the list of collaborators for the document
    collaboratorsByDoc[docId].push({ userId, initial: userInitial });

    // Broadcast the updated list of collaborators to all users in the document
    io.to(docId).emit('updateCollaborators', collaboratorsByDoc[docId]);

    // Fetch the document content from the database and send it to the user
    const doc = await db.findDocumentByDocId(docId);
    if (doc) {
      socket.emit('loadDoc', doc.content);  // Send only the document content
    }

    // Listen for content updates and save them
    socket.on('syncContent', async (content) => {
      await db.updateDocumentContent(docId, content);  // Save content in the database
      socket.to(docId).emit('updateDoc', content);  // Broadcast content to other users
      socket.emit('contentSaved');  // Notify the user that the content is saved
    });

    // When a user disconnects, remove them from the collaborators list
    socket.on('disconnect', () => {
      collaboratorsByDoc[docId] = collaboratorsByDoc[docId].filter(
        collaborator => collaborator.userId !== userId
      );
      io.to(docId).emit('updateCollaborators', collaboratorsByDoc[docId]);  // Broadcast updated list
    });
  });
});

// Start the server
server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
