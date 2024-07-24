const jwt = require('jsonwebtoken');

const authenticateUser = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(400).json({ error: 'token is required' });
    }
    //const tokenCode = token.replace('Bearer ', '');

    try {
        const tokenData = jwt.verify(token, process.env.JWT_SECRET);
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

module.exports = authenticateUser;


