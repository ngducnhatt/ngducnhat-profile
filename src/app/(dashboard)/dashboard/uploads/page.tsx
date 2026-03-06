import UploadSection from "@/components/dashboard/UploadSection";

export default function UserUploadsPage() {
	return (
		<div className="space-y-8">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Tải lên của tôi</h1>
				<p className="text-[#8e8e93] mt-1">Lưu trữ hình ảnh và video cá nhân của bạn.</p>
			</div>
			<UploadSection />
		</div>
	);
}
