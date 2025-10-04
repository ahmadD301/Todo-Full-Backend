import express from 'express';
import { PrismaClient } from '../generated/prisma/index.js';


const router = express.Router();
const prisma = new PrismaClient();

// Get all todos for authenticated user
router.get('/', async (req, res) => {
    try {
        const todos = await prisma.todo.findMany({
            where: { userId: req.userId }
        });
        
        res.json(todos);
    } catch (error) {
        console.error('Error fetching todos:', error);
        res.status(500).json({ 
            error: 'Failed to fetch todos' 
        });
    }
});

// Add a new todo
router.post('/',async (req, res) => {
    try {
        const { task } = req.body;
        
        if (!task || task.trim() === '') {
            return res.status(400).json({ 
                error: 'Task is required' 
            });
        }
        
        const todo = await prisma.todo.create({
            data: {
                userId: req.userId,
                task: task.trim(),
                completed: false,
            },
        });
        
       res.json({ 
            id: todo.id,  // ← Fixed: use todo.id instead of result.lastInsertRowid
            task: todo.task,
            completed: todo.completed,
            message: 'Todo added successfully'
        });
    } catch (error) {
        console.error('Error adding todo:', error);
        res.status(500).json({ 
            error: 'Failed to add todo' 
        });
    }
});

// Update a todo (mark as completed/incomplete)
router.put('/:id',async (req, res) => {
    try {
        const { id } = req.params;
        const { completed } = req.body;
        
        const updatedTodo = await prisma.todo.update({
            where: {
                id: parseInt(id),
                userId: req.userId
            },
            data: {
                completed: !!completed
            },
        });
        
        res.json(updatedTodo);
    } catch (error) {
        console.error('Error updating todo:', error);
        res.status(500).json({ 
            error: 'Failed to update todo' 
        });
    }
});

// Delete a todo
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const result = await prisma.todo.deleteMany({
            where: {
                id: parseInt(id),
                userId: userId
            },
        });
        
        if (result.count === 0) {
            return res.status(404).json({ 
                error: 'Todo not found' 
            });
        }
        
        res.json({ 
            message: 'Todo deleted successfully' 
        });
    } catch (error) {
        console.error('Error deleting todo:', error);
        res.status(500).json({ 
            error: 'Failed to delete todo' 
        });
    }
});

export default router;