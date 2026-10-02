import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25)
});

export async function dashboardStats(_req: Request, res: Response) {
  const [totalCars, availableCars, reservedCars, soldCars, enquiries] = await Promise.all([
    prisma.car.count(),
    prisma.car.count({ where: { status: 'AVAILABLE' } }),
    prisma.car.count({ where: { status: 'RESERVED' } }),
    prisma.car.count({ where: { status: 'SOLD' } }),
    prisma.enquiry.count()
  ]);

  res.json({
    success: true,
    data: { totalCars, availableCars, reservedCars, soldCars, enquiries }
  });
}

export async function listEnquiries(req: Request, res: Response) {
  const q = querySchema.parse(req.query);
  const skip = (q.page - 1) * q.pageSize;

  const [items, total] = await prisma.$transaction([
    prisma.enquiry.findMany({
      skip,
      take: q.pageSize,
      orderBy: { createdAt: 'desc' },
      include: { car: { select: { id: true, brand: true, model: true, variant: true, price: true } } }
    }),
    prisma.enquiry.count()
  ]);

  res.json({
    success: true,
    data: items.map((item) => ({
      ...item,
      car: item.car ? { ...item.car, price: Number(item.car.price) } : null
    })),
    meta: { page: q.page, pageSize: q.pageSize, total, totalPages: Math.ceil(total / q.pageSize) }
  });
}
