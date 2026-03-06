import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * Seed dữ liệu ban đầu cho Database.
 * Tạo một tài khoản Admin mặc định để có thể đăng nhập.
 */
async function main() {
	const adminEmail = "admin@example.com";
	const adminPassword = "adminpassword123"; // Bạn nên đổi mật khẩu này sau khi đăng nhập

	// Kiểm tra xem admin đã tồn tại chưa
	const existingAdmin = await prisma.user.findUnique({
		where: { email: adminEmail },
	});

	if (!existingAdmin) {
		const hashedPassword = await bcrypt.hash(adminPassword, 10);
		await prisma.user.create({
			data: {
				email: adminEmail,
				username: "admin",
				password: hashedPassword,
				name: "System Admin",
				role: Role.ADMIN,
			},
		});
		console.log("✅ Created default admin user:");
		console.log(`   Email: ${adminEmail}`);
		console.log(`   Username: admin`);
		console.log(`   Password: ${adminPassword}`);
	} else {
		console.log("ℹ️ Admin user already exists.");
	}
}

main()
	.catch((e) => {
		console.error("❌ Error seeding database:", e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
