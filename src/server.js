import express from 'express';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import authRoute from './routes/authRoute.js';
import todoRoute from './routes/todoRoute.js';
import authMiddleware from './middleware/authMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port =process.env.PORT || 3000; 


app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.use('/auth' , authRoute);
app.use('/todos',authMiddleware, todoRoute);

app.get('/', (req, res) => {     
    res.sendFile(path.join(__dirname,'public', 'index.html'));
});


app.listen(port, () => {    
    console.log(`Example app listening on port ${port}`);
});