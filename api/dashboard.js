const { getCookie } = require('../utils/cookies');  // Implement this utility as needed

module.exports = async (req, res) => {
  const userId = getCookie(req.headers.cookie, 'userId');

  if (userId) {
    res.setHeader('Content-Type', 'text/html');
    res.sendFile(path.join(__dirname, '../public/dashboard.html'));
  } else {
    res.writeHead(302, { Location: '/login' });
    res.end();
  }
};
