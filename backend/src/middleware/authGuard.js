const jwt = require('jsonwebtoken');

// Check if user is logged in
const authGuard = (req, res, next) => {

    // Grab auth header from incoming request
    const auth = req.headers.authorization;

    // Check if header exists if not reeject request
    if (!auth || !auth.startsWith('Bearer ')) {
        return res
        .status(401)
        .json({
            success: false,
            error: 'No token provided'
        });
    }

    try{
        const token = auth.split(' ')[1];
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    }
    catch{
        res
        .status(401)
        .json({
            success: false,
            error: 'Invalid or expired token'
        })
    }
};

// Check if user has admin priviledges
const adminGuard = (req, res, next) => {

    // Check if they're logged in first
    authGuard(req, res, () => {
        
        // If they aren't an admin, reject, if they're one, proceed 
        if (!req.user?.is_admin) {
            return res
            .status(403)
            .json({
                success: false,
                error: 'Admin access required'
            })
        }

        next();
    });
};

module.exports = { authGuard, adminGuard };