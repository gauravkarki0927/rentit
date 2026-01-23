import express from "express"
import connectDb from "./config/db.js"
const app = express();
import dotenv from "dotenv"
import cors from "cors";
import { swaggerDocs } from './config/swagger.js';
import { errorMiddleware } from './middleware/errorHandler.js';
import PostRouter from "./routes/PostRoutes.js";
import AuthRouter from "./routes/AuthRoutes.js";
import AdminRouter from "./routes/AdminRoutes.js";

dotenv.config();

connectDb();

// Middleware - CORS Configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  process.env.CORS_ORIGIN,
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
import ApplicationRouter from "./routes/ApplicationRoutes.js";
import PaymentRouter from "./routes/PaymentRoutes.js";
import ReviewRouter from "./routes/ReviewRoutes.js";
import RoomPaymentRouter from "./routes/RoomPaymentRoutes.js";

// API Routes
app.use('/api/auth', AuthRouter);
app.use('/api/posts', PostRouter);
app.use('/api/admin', AdminRouter);
app.use('/api/applications', ApplicationRouter);
app.use('/api/payments', PaymentRouter);
app.use('/api/room-payments', RoomPaymentRouter);
app.use('/api/reviews', ReviewRouter);

// Static files for uploads
app.use('/uploads', express.static('uploads'));

// Swagger documentation
swaggerDocs(app);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.path,
  });
});

// Error handling middleware (must be last)
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n${'='.repeat(50)}`);
  console.log("🚀 RENTIT Server Started");
  console.log(`${'='.repeat(50)}`);
  console.log(`Server Running on: http://localhost:${PORT}`);
  console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`${'='.repeat(50)}\n`);
});
