import TwoFactorSection from "@/components/dashboard/TwoFactorSection";

export default function User2FAPage() {
	return (
		<div className="space-y-8">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Mã xác thực 2FA</h1>
				<p className="text-[#8e8e93] mt-1">Sử dụng để đăng nhập vào các tài khoản bảo mật.</p>
			</div>
			<TwoFactorSection />
		</div>
	);
}
