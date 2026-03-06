"use client";

import { useState, useRef } from "react";
import useSWR, { useSWRConfig } from "swr";
import { UploadCloud, Video, Trash2, Loader2, Plus, AlertTriangle, CheckCircle } from "lucide-react";
import { clsx } from "clsx";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type UploadedFile = {
	id: string;
	name: string;
	url: string;
	type: string;
	size: number;
	createdAt: string;
};

export default function UploadSection() {
	const { mutate } = useSWRConfig();
	
	// Cấu hình Fetch-Once cho Tệp tin
	const { data: files = [], isLoading } = useSWR<UploadedFile[]>("/api/uploads", fetcher, {
		revalidateIfStale: false,
		revalidateOnFocus: false,
		revalidateOnReconnect: false,
	});

	const [isUploading, setIsUploading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });
	const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

	const showToast = (type: "success" | "error", text: string) => {
		setMessage({ type, text });
		setTimeout(() => setMessage(null), 3000);
	};

	const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setIsUploading(true);
		const formData = new FormData();
		formData.append("file", file);

		try {
			const res = await fetch("/api/uploads", {
				method: "POST",
				body: formData,
			});
			if (res.ok) {
				showToast("success", "Tải tệp lên thành công!");
				mutate("/api/uploads");
			} else {
				showToast("error", "Lỗi khi tải tệp lên");
			}
		} catch (error) {
			showToast("error", "Lỗi kết nối máy chủ");
		} finally {
			setIsUploading(false);
			if (fileInputRef.current) fileInputRef.current.value = "";
		}
	};

	const handleDelete = async () => {
		if (!confirmModal.id) return;
		try {
			const res = await fetch(`/api/uploads/${confirmModal.id}`, { method: "DELETE" });
			if (res.ok) {
				showToast("success", "Đã xóa tệp tin!");
				mutate("/api/uploads");
			} else {
				showToast("error", "Không thể xóa tệp tin");
			}
		} catch (error) {
			showToast("error", "Lỗi kết nối máy chủ");
		} finally {
			setConfirmModal({ isOpen: false, id: null });
		}
	};

	const formatSize = (bytes: number) => {
		if (bytes === 0) return "0 Bytes";
		const k = 1024;
		const sizes = ["Bytes", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
	};

	if (isLoading && files.length === 0) {
		return (
			<div className="flex flex-col justify-center items-center min-h-[50vh] text-[#8e8e93]">
				<Loader2 className="animate-spin mb-4" size={40} />
				<p className="font-medium">Đang tải tệp tin...</p>
			</div>
		);
	}

	return (
		<div className="space-y-6 lg:space-y-8">
			{message && (
				<div className={clsx(
					"fixed top-6 right-6 lg:top-8 lg:right-8 z-[300] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl transition-all animate-in fade-in slide-in-from-top-4",
					message.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
				)}>
					<CheckCircle size={20} />
					<span className="font-bold text-sm lg:text-base">{message.text}</span>
				</div>
			)}

			{confirmModal.isOpen && (
				<div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
					<div className="bg-[#1c1c1e] w-full max-sm:max-w-xs max-w-sm rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
						<div className="p-8 text-center">
							<div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6 bg-red-500/10 text-red-500">
								<AlertTriangle size={32} />
							</div>
							<h3 className="text-xl font-bold mb-3">Xóa tệp tin?</h3>
							<p className="text-[#8e8e93] text-sm leading-relaxed">Hành động này không thể hoàn tác. Tệp tin này sẽ bị xóa vĩnh viễn khỏi máy chủ.</p>
						</div>
						<div className="flex border-t border-white/5 divide-x divide-white/5">
							<button 
								onClick={() => setConfirmModal({ isOpen: false, id: null })}
								className="flex-1 py-4 text-sm font-bold text-[#8e8e93] hover:bg-white/5 transition-colors"
							>
								Hủy bỏ
							</button>
							<button 
								onClick={handleDelete}
								className="flex-1 py-4 text-sm font-bold bg-red-500 text-white hover:opacity-80 transition-all"
							>
								Xóa ngay
							</button>
						</div>
					</div>
				</div>
			)}

			<div className="flex flex-col sm:flex-row sm:items-center justify-end gap-4">
				<div className="flex items-center w-full sm:w-auto">
					<input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" accept="image/*,video/*" />
					<button
						onClick={() => fileInputRef.current?.click()}
						disabled={isUploading}
						className="flex w-full justify-center items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-bold text-black transition-all hover:bg-[#e5e5e7] active:scale-95 disabled:opacity-50 shadow-lg"
					>
						{isUploading ? (
							<Loader2 className="h-5 w-5 animate-spin" />
						) : (
							<Plus size={18} />
						)}
						{isUploading ? "Đang tải lên..." : "Tải lên tệp mới"}
					</button>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{files.length === 0 ? (
					<div className="col-span-full rounded-[2.5rem] border border-dashed border-white/10 bg-[#2c2c2e]/50 p-12 text-center">
						<UploadCloud className="mx-auto mb-4 text-[#8e8e93]" size={48} />
						<p className="text-[#8e8e93]">Chưa có tệp nào được tải lên.</p>
					</div>
				) : (
					files.map((file) => (
						<div
							key={file.id}
							className="group relative overflow-hidden rounded-3xl lg:rounded-[2rem] border border-white/5 bg-[#2c2c2e] shadow-xl transition-all hover:border-white/20 flex flex-col"
						>
							<div className="aspect-square sm:aspect-video xl:aspect-square w-full overflow-hidden bg-[#1c1c1e] relative">
								{file.type === "IMAGE" ? (
									<img src={file.url} alt={file.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
								) : (
									<div className="flex h-full w-full items-center justify-center text-[#8e8e93] bg-[#2c2c2e]/50">
										<Video size={48} />
									</div>
								)}
								<button
									onClick={(e) => {
										e.stopPropagation();
										setConfirmModal({ isOpen: true, id: file.id });
									}}
									className="absolute top-3 right-3 rounded-xl bg-red-500/90 backdrop-blur-md p-2.5 text-white opacity-100 lg:opacity-0 transition-all hover:bg-red-500 lg:group-hover:opacity-100 active:scale-90 shadow-lg"
								>
									<Trash2 size={16} />
								</button>
							</div>

							<div className="p-5 flex-1 flex flex-col justify-center">
								<div className="flex items-start justify-between gap-3">
									<div className="flex-1 overflow-hidden">
										<p className="truncate font-bold text-sm lg:text-base leading-tight" title={file.name}>{file.name}</p>
										<p className="mt-1.5 text-xs font-semibold tracking-wider text-[#8e8e93] uppercase">{formatSize(file.size)}</p>
									</div>
								</div>
							</div>
						</div>
					))
				)}
			</div>
		</div>
	);
}
