const { Pool } = require('pg');

// PostgreSQL connection setup
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'Artude31',
  port: 5432,
});

// Function to create a new document with the creator's username and document name
async function createDocument(userId, docId, username, docName) {
  const query = 'INSERT INTO documents (user_id, doc_id, created_by, doc_name, content) VALUES ($1, $2, $3, $4, $5)';
  const values = [userId, docId, username, docName, '<p></p>'];  // Start with an empty document

  try {
    await pool.query(query, values);
  } catch (error) {
    console.error('Error creating document:', error);
    throw error;
  }
}


// Function to find all documents by userId (for dashboard preview)
async function findDocumentsByUserId(userId) {
  const query = 'SELECT doc_id, created_by, content FROM documents WHERE user_id = $1';
  const values = [userId];

  try {
    const result = await pool.query(query, values);
    return result.rows;  // Return all documents created by the user
  } catch (error) {
    console.error('Error finding documents by userId:', error);
    throw error;
  }
}

// Function to find a document by docId
async function findDocumentByDocId(docId) {
  const query = 'SELECT content FROM documents WHERE doc_id = $1';
  const values = [docId];

  try {
    const result = await pool.query(query, values);
    return result.rows[0];  // Return the document content if found
  } catch (error) {
    console.error('Error finding document by docId:', error);
    throw error;
  }
}

// Function to update document content
async function updateDocumentContent(docId, content) {
  const query = 'UPDATE documents SET content = $1 WHERE doc_id = $2';
  const values = [content, docId];

  try {
    await pool.query(query, values);
  } catch (error) {
    console.error('Error updating document content:', error);
    throw error;
  }
}

// Export the database functions
module.exports = {
  createDocument,
  findDocumentsByUserId,
  findDocumentByDocId,
  updateDocumentContent
};
