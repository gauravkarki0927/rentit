import express from "express"
import connectDb from "./config/db.js"
const app = express();
import dotenv from "dotenv"
import cors from "cors";
import { swaggerDocs } from './config/swagger.js';
import PostRouter from "./routes/PostRoutes.js";
import AuthRouter from "./routes/AuthRoutes.js";
import AdminRouter from "./routes/AdminRoutes.js";

dotenv.config();

connectDb();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
import ApplicationRouter from "./routes/ApplicationRoutes.js";
import PaymentRouter from "./routes/PaymentRoutes.js";
import ReviewRouter from "./routes/ReviewRoutes.js";

// Routes
app.use('/api/auth', AuthRouter);
app.use('/api/posts', PostRouter);
app.use('/api/admin', AdminRouter);
app.use('/api/applications', ApplicationRouter);
app.use('/api/payments', PaymentRouter);
app.use('/api/reviews', ReviewRouter);

// Static files for uploads
app.use('/uploads', express.static('uploads'));

// Swagger documentation
swaggerDocs(app);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: "Server is running" });
});

app.listen(process.env.PORT, () => {
  console.log("The server is running on PORT:", process.env.PORT);
});
