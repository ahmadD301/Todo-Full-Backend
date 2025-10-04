import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db  from '../db.js';


const router = express.Router();

// In authRoute.js - update your register route:
router.post('/register', (req, res) => {
    try {
        const hashedPassword = bcrypt.hashSync(req.body.password, 8);
        const insertUser = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
        const result = insertUser.run([req.body.username, hashedPassword]);
        
        const userId = result.lastInsertRowid;
        const defaultTodos = 'Welcome to your todo list!';
        const insertTodo = db.prepare('INSERT INTO todos (user_id, task) VALUES (?, ?)');
        insertTodo.run([userId, defaultTodos]);

        const token = jwt.sign({ id: userId }, 'secretkey', { expiresIn: 86400 });
        console.log("Successfully registered user:", req.body.username); 
        
        res.json({ 
            auth: true, 
            token: token,
            message: "Registration successful"
        });
    } catch(err) {
        console.error(err);
        res.status(503).json({ 
            auth: false, 
            message: "Registration failed" 
        });
    }   
});


router.post('/login', (req, res) => {
    const { username, password } = req.body;
    try {   
        const getUser = db.prepare('SELECT * FROM users WHERE username = ?');
        const user = getUser.get([username]);
        
        if (!user) {
            return res.status(404).json({ 
                auth: false, 
                message: "User not found" 
            });
        }
        
        const passwordIsValid = bcrypt.compareSync(password, user.password);
        if (!passwordIsValid) {
            return res.status(401).json({ 
                auth: false, 
                message: "Invalid password" 
            });
        }
        
        const token = jwt.sign({ id: user.id }, 'secretkey', { expiresIn: 86400 });
        console.log("Successfully logged in user:", username); 

        res.json({ 
            auth: true, 
            token: token,
            message: "Login successful"
        });
    } catch(err) {
        console.error(err);
        res.status(503).json({ 
            auth: false, 
            message: "Server error" 
        });
    }
});

export default router;