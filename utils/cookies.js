const { parse } = require('cookie');

function getCookie(cookieHeader, name) {
  const cookies = parse(cookieHeader || '');
  return cookies[name];
}

module.exports = { getCookie };
