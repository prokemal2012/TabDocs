const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const cookie = require('cookie');
const { getCookie } = require('../utils/cookies');  // You might need to implement this utility

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: process.env.POSTGRES_PASSWORD,  // Use environment variables
  port: 5432,
});

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'text/html');
    res.sendFile(path.join(__dirname, '../public/login.html'));
  } else if (req.method === 'POST') {
    const { username, password } = req.body;
    const user = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

    if (user.rows.length > 0 && bcrypt.compareSync(password, user.rows[0].password)) {
      res.setHeader('Set-Cookie', cookie.serialize('userId', user.rows[0].id, { httpOnly: true }));
      res.writeHead(302, { Location: '/dashboard' });
      res.end();
    } else {
      res.writeHead(302, { Location: '/login' });
      res.end();
    }
  }
};
