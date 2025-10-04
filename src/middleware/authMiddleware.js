import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers['authorization'];
        
        if (!authHeader) {
            return res.status(403).json({ 
                auth: false, 
                message: 'No token provided' 
            });
        }

        // Extract token from "Bearer <token>"
        const token = authHeader.startsWith('Bearer ') 
            ? authHeader.slice(7) 
            : authHeader;

        if (!token) {
            return res.status(403).json({ 
                auth: false, 
                message: 'Invalid token format' 
            });
        }

        // Verify token
        jwt.verify(token, 'secretkey', (err, decoded) => {
            if (err) {
                return res.status(401).json({ 
                    auth: false, 
                    message: 'Invalid or expired token' 
                });
            }
            
            // Add user ID to request object
            req.userId = decoded.id;
            next();
        });
        
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({ 
            auth: false, 
            message: 'Authentication error' 
        });
    }
};

export default authMiddleware;