import express from 'express';
import db from '../db.js';

const router = express.Router();

// Get all todos for authenticated user
router.get('/', (req, res) => {
    try {
        const getTodos = db.prepare('SELECT * FROM todos WHERE user_id = ?');
        const todos = getTodos.all([req.userId]);
        
        res.json(todos);
    } catch (error) {
        console.error('Error fetching todos:', error);
        res.status(500).json({ 
            error: 'Failed to fetch todos' 
        });
    }
});

// Add a new todo
router.post('/', (req, res) => {
    try {
        const { task } = req.body;
        
        if (!task || task.trim() === '') {
            return res.status(400).json({ 
                error: 'Task is required' 
            });
        }
        
        const insertTodo = db.prepare('INSERT INTO todos (user_id, task) VALUES (?, ?)');
        const result = insertTodo.run([req.userId, task.trim()]);
        
        res.json({ 
            id: result.lastInsertRowid,
            task: task.trim(),
            completed: false,
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
router.put('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { completed } = req.body;
        
        const updateTodo = db.prepare('UPDATE todos SET completed = ? WHERE id = ? AND user_id = ?');
        const result = updateTodo.run([completed ? 1 : 0, id, req.userId]);
        
        if (result.changes === 0) {
            return res.status(404).json({ 
                error: 'Todo not found' 
            });
        }
        
        res.json({ 
            message: 'Todo updated successfully' 
        });
    } catch (error) {
        console.error('Error updating todo:', error);
        res.status(500).json({ 
            error: 'Failed to update todo' 
        });
    }
});

// Delete a todo
router.delete('/:id', (req, res) => {
    try {
        const { id } = req.params;
        
        const deleteTodo = db.prepare('DELETE FROM todos WHERE id = ? AND user_id = ?');
        const result = deleteTodo.run([id, req.userId]);
        
        if (result.changes === 0) {
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