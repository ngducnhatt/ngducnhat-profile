import nodemailer from "nodemailer";

/**
 * Cấu hình Transporter để gửi email bằng Gmail SMTP.
 * Bạn cần sử dụng "App Password" (Mật khẩu ứng dụng) của Google.
 */
const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS,
	},
});

/**
 * Gửi email chứa mật khẩu mới cho người dùng bằng Nodemailer.
 */
export async function sendNewPasswordEmail(to: string, newPassword: string) {
	if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || process.env.EMAIL_USER.includes("your-email")) {
		throw new Error("Cấu hình Email chưa hoàn thiện. Vui lòng kiểm tra EMAIL_USER và EMAIL_PASS trong file .env");
	}
	try {
		const mailOptions = {
			from: `"DN App" <${process.env.EMAIL_USER}>`,
			to,
			subject: "Khôi phục mật khẩu",
			html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #333; text-align: center;">Khôi phục mật khẩu</h2>
          <p>Xin chào,</p>
          <p>Chúng tôi đã nhận được yêu cầu khôi phục mật khẩu của bạn. Hệ thống đã tạo một mật khẩu mới ngẫu nhiên cho tài khoản của bạn.</p>
          <div style="background-color: #f4f4f4; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #666;">Mật khẩu mới của bạn là:</p>
            <p style="margin: 5px 0 0; font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #000;">${newPassword}</p>
          </div>
          <p style="color: #ff3b30; font-size: 13px;"><b>Lưu ý:</b> Hãy đăng nhập và đổi mật khẩu ngay sau khi nhận được email này để đảm bảo an toàn.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #999; text-align: center;">Đây là email tự động, vui lòng không trả lời.</p>
        </div>
      `,
		};

		const info = await transporter.sendMail(mailOptions);
		return info;
	} catch (error) {
		console.error("Nodemailer Helper Error:", error);
		throw error;
	}
}
