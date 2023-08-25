const jwt = require("jsonwebtoken")
const User = require("../models/user.model")

async function authMiddleware(req, res, next) {
  const token = req.header('Authorization') ? req.header('Authorization').split('Bearer')[1] : null;
  console.log(token);

  if (!token) { 
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token.trim(), process.env.SECRET_KEY);
    console.log(process.env.SECRET_KEY);
    console.log(decoded);
    const userId = decoded.id;

    const user = await User.findById(userId).exec();
    
    if (!user) {
      console.log(user)
      return res.status(404).json({ error: 'User not found.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    return res.status(403).json({ error: 'Invalid token.' });
  }
}

module.exports = {
  authMiddleware
}