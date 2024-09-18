const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: process.env.POSTGRES_PASSWORD,
  port: 5432,
});

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'text/html');
    res.sendFile(path.join(__dirname, '../public/register.html'));
  } else if (req.method === 'POST') {
    const { username, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 8);

    await pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, hashedPassword]);
    res.writeHead(302, { Location: '/login' });
    res.end();
  }
};
