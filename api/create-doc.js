const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');  // Adjust the path if needed
const { getCookie } = require('../utils/cookies');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: process.env.POSTGRES_PASSWORD,
  port: 5432,
});

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    const docId = uuidv4();
    const userId = getCookie(req.headers.cookie, 'userId');

    const user = await pool.query('SELECT username FROM users WHERE id = $1', [userId]);
    const username = user.rows[0].username;
    const docName = 'Untitled Document';

    await db.createDocument(userId, docId, username, docName);
    res.writeHead(302, { Location: `/docid?docid=${docId}` });
    res.end();
  }
};
