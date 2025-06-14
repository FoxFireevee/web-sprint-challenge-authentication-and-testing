const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET || 'shhh';

// 1- On valid token in the Authorization header, call next.
// 2- On missing token in the Authorization header,
// the response body should include a string exactly as follows: "token required".
// 3- On invalid or expired token in the Authorization header,
// the response body should include a string exactly as follows: "token invalid".
function validateToken(req, res, next) {
  const token = req.headers.authorization;

  if(!token) {
    return res.status(401).json({ message: "token required" });
  }

  jwt.verify(token, secret, (err, decodedToken) => {
    if(err) {
      return res.status(401).json({ message: "token invalid" });
    } else {
      req.decodedToken = decodedToken;
      next();
    }
  });
}

module.exports = {
  validateToken,
};