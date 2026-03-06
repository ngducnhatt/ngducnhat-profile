import TwoFactorSection from "@/components/dashboard/TwoFactorSection";

export default function Admin2FAPage() {
	return (
		<div className="space-y-8">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Mã xác thực 2FA</h1>
				<p className="text-[#8e8e93] mt-1">Quản lý các mã xác thực bảo mật của bạn.</p>
			</div>
			<TwoFactorSection />
		</div>
	);
}
