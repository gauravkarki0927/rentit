import express from "express"
import connectDb from "./config/db.js"
const app = express();
import dotenv from "dotenv"
import { swaggerDocs } from './config/swagger.js';
import PostRouter from "./routes/PostRoutes.js";
dotenv.config();

connectDb();

app.use(express.json());

app.use('/api/posts', PostRouter);
swaggerDocs(app);

app.listen(process.env.PORT, () => {
  console.log("The server is running on PORT:", process.env.PORT);
});
