import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '../generated/prisma/index.js';


const router = express.Router();
const prisma = new PrismaClient();

// In authRoute.js - update your register route:
router.post('/register', async (req, res) => {
    try {
        const hashedPassword = bcrypt.hashSync(req.body.password, 8);
        
        const user = await prisma.user.create({
            data: {
                username: req.body.username,
                password: hashedPassword,
            },
        });

        const defaultTodos = 'Welcome to your todo list!';
        
        const todo = await prisma.todo.create({
            data: {
                userId: user.id,
                task: defaultTodos,
                completed: false,
            },
        });

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


router.post('/login',async (req, res) => {
    const { username, password } = req.body;
    try {   
        const user = await prisma.user.findUnique({
            where : { username: username }
        })
        
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