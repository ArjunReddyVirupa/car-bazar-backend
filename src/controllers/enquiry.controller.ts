import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/http.js';

const schema = z.object({
  carId: z.string().cuid().optional().nullable(),
  customerName: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(7).max(30),
  message: z.string().trim().max(1000).optional().nullable()
});

export async function createEnquiry(req: Request, res: Response) {
  const input = schema.parse(req.body);
  if (input.carId) {
    const car = await prisma.car.findUnique({ where: { id: input.carId } });
    if (!car) throw new AppError(404, 'Car not found.', 'CAR_NOT_FOUND');
  }
  const enquiry = await prisma.enquiry.create({ data: input });
  res.status(201).json({ success: true, data: { id: enquiry.id, message: 'Enquiry received.' } });
}
