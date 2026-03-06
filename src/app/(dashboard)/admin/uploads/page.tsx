import UploadSection from "@/components/dashboard/UploadSection";

export default function AdminUploadsPage() {
	return (
		<div className="space-y-8">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Kho lưu trữ</h1>
				<p className="text-[#8e8e93] mt-1">Quản lý hình ảnh và video trên Cloudflare R2.</p>
			</div>
			<UploadSection />
		</div>
	);
}
