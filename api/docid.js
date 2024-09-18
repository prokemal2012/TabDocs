const db = require('../db');  // Adjust the path if needed
const { getCookie } = require('../utils/cookies');

module.exports = async (req, res) => {
  const docId = req.query.docid;
  const userId = getCookie(req.headers.cookie, 'userId');

  if (userId) {
    const doc = await db.findDocumentByDocId(docId);

    if (doc) {
      res.setHeader('Content-Type', 'text/html');
      res.sendFile(path.join(__dirname, '../public/index.html'));
    } else {
      res.status(404).send('Document not found');
    }
  } else {
    res.writeHead(302, { Location: '/login' });
    res.end();
  }
};
