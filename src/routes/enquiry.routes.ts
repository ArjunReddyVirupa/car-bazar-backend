import { Router } from 'express';
import { asyncHandler } from '../utils/http.js';
import { createEnquiry } from '../controllers/enquiry.controller.js';

export const enquiryRouter = Router();
enquiryRouter.post('/', asyncHandler(createEnquiry));
