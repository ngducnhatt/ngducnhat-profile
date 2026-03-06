import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

/**
 * Khởi tạo S3 Client tương thích với Cloudflare R2.
 */
const s3Client = new S3Client({
	region: "auto",
	endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
	credentials: {
		accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
		secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
	},
});

/**
 * Upload file lên Cloudflare R2.
 */
export async function uploadToR2(file: Buffer, fileName: string, contentType: string) {
	const bucketName = process.env.R2_BUCKET_NAME || "";
	const command = new PutObjectCommand({
		Bucket: bucketName,
		Key: fileName,
		Body: file,
		ContentType: contentType,
	});

	try {
		await s3Client.send(command);
		// Trả về URL của file (Nếu bạn dùng domain public của R2 hoặc domain riêng)
		const publicUrl = process.env.R2_PUBLIC_URL || `https://${bucketName}.r2.cloudflarestorage.com`;
		return `${publicUrl}/${fileName}`;
	} catch (error) {
		console.error("R2 Upload Error:", error);
		throw error;
	}
}

/**
 * Xóa file khỏi Cloudflare R2.
 */
export async function deleteFromR2(fileName: string) {
	const command = new DeleteObjectCommand({
		Bucket: process.env.R2_BUCKET_NAME || "",
		Key: fileName,
	});

	try {
		await s3Client.send(command);
	} catch (error) {
		console.error("R2 Delete Error:", error);
		throw error;
	}
}
