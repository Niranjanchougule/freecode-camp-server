const jwt = require("jsonwebtoken");

const getTokenFromHeader = (req) => {
  // Get the Authorization header from the request
  const authorizationHeader = req.header("Authorization");

  // Check if the header exists and starts with "Bearer "
  if (authorizationHeader && authorizationHeader.startsWith("Bearer ")) {
    // Extract the token by removing "Bearer " from the header
    const token = authorizationHeader.substring(7);
    return token;
  }

  // If no valid token is found, return null or handle the error accordingly
  return null;
};

function verifyToken(req, res, next) {
  const token = getTokenFromHeader(req);
  if (!token) return res.status(401).json({ error: "Access denied" });
  try {
    const decoded = jwt.verify(token, "secret-key-test");
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
}

module.exports = {
  verifyToken,
  getTokenFromHeader,
};
