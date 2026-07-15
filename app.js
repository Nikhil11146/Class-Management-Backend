import express from 'express';
import cors from 'cors';
import { PORT, CLIENT_URL } from './config/env.js';
import {connectDB} from "./database/mongodb.js";
import routesRouter from "./routes/routes.controller.js";
import {errorMiddleware} from "./middlewares/error.middleware.js";
import { startKeepAlive } from './services/keepAlive.js';
import {resend} from "./services/mail.services.js";

const app = express();

app.use(express.json());
app.use(cors());

app.get("/test-mail", async (req, res) => {
    try {
        const { data, error } = await resend.domains.list();
        if (error) {
            throw error;
        }
        res.send("Resend OK");
    } catch (e) {
        console.error(e);
        res.send(e.message);
    }
});

// Routes
app.use('/api/v1', routesRouter);

app.use(errorMiddleware);



app.get('/api/v1', (req, res) => {
    res.status(200).send({
        success: true,
        message: 'Welcome to Backend!',
    })
})

await connectDB();

app.listen(PORT, async () => {
    console.log(`Server started on port: ${PORT}, `);
    startKeepAlive();
})