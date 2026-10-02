import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../utils/http.js';
import { dashboardStats, listEnquiries } from '../controllers/admin.controller.js';

export const adminRouter = Router();
adminRouter.use(requireAdmin);
adminRouter.get('/dashboard', asyncHandler(dashboardStats));
adminRouter.get('/enquiries', asyncHandler(listEnquiries));
