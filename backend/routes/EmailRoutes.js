import express from 'express';
import { sendContactEmail } from '../controller/EmailController.js';

const router = express.Router();

router.post('/contact', sendContactEmail);

export default router;
