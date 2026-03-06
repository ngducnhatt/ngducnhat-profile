import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

/**
 * Khởi tạo Prisma Client để sử dụng xuyên suốt dự án.
 * Đảm bảo chỉ có một instance duy nhất được tạo trong quá trình dev (tránh rò rỉ bộ nhớ).
 */
export const prisma =
	globalForPrisma.prisma ||
	new PrismaClient({
		log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
	});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
