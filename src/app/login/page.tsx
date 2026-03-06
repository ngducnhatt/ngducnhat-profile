"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LucideIcon, User, Mail, Lock, Key, ArrowRight, Loader2, UserPlus } from "lucide-react";

/**
 * Trang Đăng nhập / Đăng ký / Quên mật khẩu.
 * Thiết kế theo phong cách iOS tối giản, hiện đại.
 */
export default function AuthPage() {
	const router = useRouter();
	const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
	const [isLoading, setIsLoading] = useState(false);
	const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

	// Form states
	const [formData, setFormData] = useState({
		identifier: "", // Dùng cho email hoặc username khi login
		email: "",
		username: "",
		password: "",
		confirmPassword: "",
		name: "",
	});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
		setMessage(null);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setMessage(null);

		try {
			if (mode === "login") {
				const res = await fetch("/api/auth/login", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						identifier: formData.identifier,
						password: formData.password,
					}),
				});
				const data = await res.json();
				if (res.ok) {
					setMessage({ type: "success", text: "Đăng nhập thành công!" });
					// Redirect sau 1s
					setTimeout(() => {
						router.push(data.user.role === "ADMIN" ? "/admin" : "/dashboard");
					}, 1000);
				} else {
					setMessage({ type: "error", text: data.message });
				}
			} else if (mode === "register") {
				if (formData.password !== formData.confirmPassword) {
					setMessage({ type: "error", text: "Mật khẩu xác nhận không khớp" });
					setIsLoading(false);
					return;
				}
				const res = await fetch("/api/auth/register", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						email: formData.email,
						username: formData.username,
						password: formData.password,
						name: formData.name,
					}),
				});
				const data = await res.json();
				if (res.ok) {
					setMessage({ type: "success", text: "Đăng ký thành công! Hãy đăng nhập." });
					setTimeout(() => setMode("login"), 1500);
				} else {
					setMessage({ type: "error", text: data.message });
				}
			} else {
				// Quên mật khẩu
				const res = await fetch("/api/auth/forgot-password", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ email: formData.email }),
				});
				const data = await res.json();
				if (res.ok) {
					setMessage({ type: "success", text: data.message });
					setTimeout(() => setMode("login"), 3000);
				} else {
					setMessage({ type: "error", text: data.message });
				}
			}
		} catch (error) {
			setMessage({ type: "error", text: "Đã xảy ra lỗi kết nối" });
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-[#1c1c1e] p-4 font-sans text-white">
			<div className="w-full max-w-100 space-y-8">
				{/* Header */}
				<div className="text-center">

				</div>

				{/* Card Container */}
				<div className="rounded-3xl bg-[#2c2c2e] p-8 shadow-2xl ring-1 ring-white/10">
					<form onSubmit={handleSubmit} className="space-y-4">
						{message && (
							<div
								className={`rounded-xl p-3 text-center text-sm ${
									message.type === "success" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
								}`}
							>
								{message.text}
							</div>
						)}

						{/* Login Fields */}
						{mode === "login" && (
							<>
								<InputGroup
									icon={User}
									name="identifier"
									placeholder="Email hoặc Username"
									value={formData.identifier}
									onChange={handleChange}
								/>
								<InputGroup
									icon={Lock}
									name="password"
									type="password"
									placeholder="Mật khẩu"
									value={formData.password}
									onChange={handleChange}
								/>
							</>
						)}

						{/* Register Fields */}
						{mode === "register" && (
							<>
								<InputGroup
									icon={User}
									name="name"
									placeholder="Họ và tên (không bắt buộc)"
									value={formData.name}
									onChange={handleChange}
								/>
								<InputGroup
									icon={UserPlus}
									name="username"
									placeholder="Username"
									value={formData.username}
									onChange={handleChange}
								/>
								<InputGroup
									icon={Mail}
									name="email"
									type="email"
									placeholder="Email"
									value={formData.email}
									onChange={handleChange}
								/>
								<InputGroup
									icon={Lock}
									name="password"
									type="password"
									placeholder="Mật khẩu"
									value={formData.password}
									onChange={handleChange}
								/>
								<InputGroup
									icon={Key}
									name="confirmPassword"
									type="password"
									placeholder="Xác nhận mật khẩu"
									value={formData.confirmPassword}
									onChange={handleChange}
								/>
							</>
						)}

						{/* Forgot Password Fields */}
						{mode === "forgot" && (
							<InputGroup
								icon={Mail}
								name="email"
								type="email"
								placeholder="Nhập Email của bạn"
								value={formData.email}
								onChange={handleChange}
							/>
						)}

						{/* Submit Button */}
						<button
							type="submit"
							disabled={isLoading}
							className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-4 text-sm font-semibold text-black transition-all hover:bg-[#e5e5e7] disabled:opacity-50"
						>
							{isLoading ? (
								<Loader2 className="h-5 w-5 animate-spin" />
							) : (
								<>
									{mode === "login" ? "Đăng nhập" : mode === "register" ? "Đăng ký" : "Gửi yêu cầu"}
									<ArrowRight className="h-4 w-4" />
								</>
							)}
						</button>
					</form>

					{/* Navigation Links */}
					<div className="mt-6 flex flex-col items-center gap-3 text-sm text-[#8e8e93]">
						{mode === "login" ? (
							<>
								<button onClick={() => setMode("forgot")} className="hover:text-white transition-colors">
									Quên mật khẩu?
								</button>
								<p>
									Chưa có tài khoản?{" "}
									<button onClick={() => setMode("register")} className="font-medium text-white hover:underline">
										Đăng ký ngay
									</button>
								</p>
							</>
						) : (
							<button onClick={() => setMode("login")} className="font-medium text-white hover:underline">
								Quay lại đăng nhập
							</button>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

/**
 * Component ô nhập liệu dùng chung.
 */
function InputGroup({
	icon: Icon,
	...props
}: {
	icon: LucideIcon;
	name: string;
	type?: string;
	placeholder: string;
	value: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
	return (
		<div className="relative">
			<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
				<Icon className="h-5 w-5 text-[#8e8e93]" />
			</div>
			<input
				{...props}
				className="w-full rounded-2xl bg-[#3a3a3c] py-4 pl-12 pr-4 text-sm transition-all focus:bg-[#48484a] focus:outline-none focus:ring-2 focus:ring-white/10"
				autoComplete="off"
			/>
		</div>
	);
}
