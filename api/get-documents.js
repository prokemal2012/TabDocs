const db = require('../db');  // Adjust the path if needed
const { getCookie } = require('../utils/cookies');

module.exports = async (req, res) => {
  const userId = getCookie(req.headers.cookie, 'userId');

  if (userId) {
    const documents = await db.findDocumentsByUserId(userId);
    res.json(documents);
  } else {
    res.writeHead(302, { Location: '/login' });
    res.end();
  }
};
