const jwt = require('jsonwebtoken');
const User = require('../models/user-model')
const authenticateUser = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(400).json({ error: 'token is required' });
    }
    const tokenCode = token.replace('Bearer ', '');

    try {
        const tokenData = jwt.verify(tokenCode, process.env.JWT_SECRET);
        req.user = {
            
            userId: tokenData.userId,
            role: tokenData.role,
        };
        // console.log('Token:', tokenData);

        //console.log(`Authenticated user ID: ${req.user.userId}`)
        //console.log(`Authenticated user role: ${req.user.role}`)

        next();
    } catch (err) {
        return res.status(400).json({ error: err });
    }
};


const authenticateAdmin = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      console.log('No token provided');
      return res.status(403).json({ error: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];;
    
     if (!token) {
        console.log('No token provided');
        return res.status(403).json({ error: 'No token provided' });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      console.log('Token:', token);
      console.log('Decoded User:', decoded);
      
      if (!user || user.role !== 'Admin') {
        console.log('User Role:', user.role);

        return res.status(403).json({ error: 'Access denied' });
      }
      
      req.user = user;
      next();
    } catch (error) {
      console.log('Token verification failed:', error);
      res.status(403).json({ error: 'Invalid or expired token' });
    }
  };
  
  
  
module.exports = {authenticateUser,authenticateAdmin};


