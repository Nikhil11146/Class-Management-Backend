import express from 'express';
import cors from 'cors';
import { PORT, CLIENT_URL } from './config/env.js';
import {connectDB} from "./database/mongodb.js";
import routesRouter from "./routes/routes.controller.js";

const app = express();

app.use(express.json());
app.use(cors());

// Routes
app.use('/api/v1', routesRouter);

app.get('/api/v1', (req, res) => {
    res.status(200).send({
        success: true,
        message: 'Welcome to Backend!',
    })
})

await connectDB();

app.listen(PORT, async () => {
    console.log(`Server started on port: ${PORT}, `);

})