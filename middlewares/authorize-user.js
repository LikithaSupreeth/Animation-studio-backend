const authorizeUser = (permittedRoles) => {
    return (req, res, next) => {
        if (permittedRoles.includes(req.user.role)) {
            next();
        } else {
            res.status(403).json({ error: 'you do not have permission to access this route' });
        }
    };
};

module.exports = authorizeUser;
