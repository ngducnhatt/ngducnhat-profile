"use client";

import { useState, useEffect } from "react";
import useSWR, { useSWRConfig } from "swr";
import { Plus, Trash2, ShieldCheck, Loader2, X, Copy, Check, AlertTriangle, CheckCircle } from "lucide-react";
import * as authenticator from "otplib";
import { clsx } from "clsx";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type TwoFactorItem = {
	id: string;
	label: string;
	secret: string;
};

export default function TwoFactorSection() {
	const { mutate } = useSWRConfig();

	// Cấu hình Fetch-Once cho Mã 2FA
	const { data: items = [], isLoading } = useSWR<TwoFactorItem[]>("/api/2fa", fetcher, {
		revalidateIfStale: false,
		revalidateOnFocus: false,
		revalidateOnReconnect: false,
	});

	const [isAdding, setIsAdding] = useState(false);
	const [new2FA, setNew2FA] = useState({ label: "", secret: "" });
	const [timeLeft, setTimeLeft] = useState(30);
	const [copiedId, setCopiedId] = useState<string | null>(null);

	const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });
	const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

	useEffect(() => {
		const timer = setInterval(() => {
			const seconds = 30 - (Math.floor(Date.now() / 1000) % 30);
			setTimeLeft(seconds);
		}, 1000);
		return () => clearInterval(timer);
	}, []);

	const showToast = (type: "success" | "error", text: string) => {
		setMessage({ type, text });
		setTimeout(() => setMessage(null), 3000);
	};

	const handleAdd = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!new2FA.secret || !new2FA.label) return;
		try {
			const res = await fetch("/api/2fa", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(new2FA),
			});
			if (res.ok) {
				setNew2FA({ label: "", secret: "" });
				setIsAdding(false);
				showToast("success", "Đã thêm mã xác thực mới!");
				mutate("/api/2fa");
			} else {
				showToast("error", "Lỗi khi lưu mã xác thực");
			}
		} catch (error) {
			showToast("error", "Lỗi kết nối máy chủ");
		}
	};

	const handleDelete = async () => {
		if (!confirmModal.id) return;
		try {
			const res = await fetch(`/api/2fa/${confirmModal.id}`, { method: "DELETE" });
			if (res.ok) {
				showToast("success", "Đã xóa mã xác thực!");
				mutate("/api/2fa");
			} else {
				showToast("error", "Không thể xóa mã xác thực");
			}
		} catch (error) {
			showToast("error", "Lỗi kết nối máy chủ");
		} finally {
			setConfirmModal({ isOpen: false, id: null });
		}
	};

	const getOTP = (secret: string) => {
		try {
			return authenticator.authenticator.generate(secret);
		} catch {
			return "ERROR";
		}
	};

	const handleCopy = (code: string, id: string) => {
		if (code === "ERROR") return;
		navigator.clipboard.writeText(code);
		setCopiedId(id);
		setTimeout(() => setCopiedId(null), 2000);
		showToast("success", "Đã sao chép mã!");
	};

	if (isLoading && items.length === 0) return (
		<div className="flex flex-col justify-center items-center min-h-[50vh] text-[#8e8e93]">
			<Loader2 className="animate-spin mb-4" size={40} />
			<p className="font-medium">Đang tải mã xác thực...</p>
		</div>
	);

	return (
		<div className="space-y-6 lg:space-y-8">
			{message && (
				<div className={clsx(
					"fixed top-6 right-6 lg:top-8 lg:right-8 z-300 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl transition-all animate-in fade-in slide-in-from-top-4",
					message.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
				)}>
					<CheckCircle size={20} />
					<span className="font-bold text-sm lg:text-base">{message.text}</span>
				</div>
			)}

			{confirmModal.isOpen && (
				<div className="fixed inset-0 z-250 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
					<div className="bg-[#1c1c1e] w-full max-sm:max-w-xs max-w-sm rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
						<div className="p-8 text-center">
							<div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6 bg-red-500/10 text-red-500">
								<AlertTriangle size={32} />
							</div>
							<h3 className="text-xl font-bold mb-3">Xóa mã xác thực?</h3>
							<p className="text-[#8e8e93] text-sm leading-relaxed">Nếu xóa mã này, bạn có thể mất quyền truy cập vào dịch vụ tương ứng.</p>
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

			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div className="flex items-center gap-3">
					<span className="text-xs lg:text-sm font-bold bg-blue-500/20 text-blue-400 px-4 py-2 rounded-full animate-pulse">
						{timeLeft}s
					</span>
				</div>
				<button
					onClick={() => setIsAdding(true)}
					className="flex justify-center items-center gap-2 bg-white text-black px-6 py-3 rounded-2xl font-bold text-sm hover:bg-[#e5e5e7] active:scale-95 transition-all shadow-lg w-full sm:w-auto"
				>
					<Plus size={18} /> Thêm mã mới
				</button>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{items.length === 0 ? (
					<div className="col-span-full bg-[#2c2c2e]/50 p-12 rounded-[2.5rem] text-center border border-dashed border-white/10">
						<ShieldCheck className="mx-auto text-[#8e8e93] mb-4" size={48} />
						<p className="text-[#8e8e93]">Chưa có mã 2FA nào được lưu.</p>
					</div>
				) : (
					items.map((item) => {
						const code = getOTP(item.secret);
						return (
							<div key={item.id} className="bg-[#2c2c2e] p-6 lg:p-8 rounded-3xl lg:rounded-[2.5rem] border border-white/5 shadow-xl group relative overflow-hidden transition-all hover:border-white/10">
								<div className="flex justify-between items-start mb-6">
									<span className="text-xs font-bold text-[#8e8e93] uppercase tracking-widest truncate max-w-[80%]">{item.label}</span>
									<button
										onClick={() => setConfirmModal({ isOpen: true, id: item.id })}
										className="text-[#ff453a] p-2 bg-red-500/10 rounded-xl opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity active:scale-90"
									>
										<Trash2 size={16} />
									</button>
								</div>
								<div className="flex items-center justify-between gap-4">
									<span className={clsx(
										"text-3xl lg:text-4xl font-mono font-bold tracking-wider",
										code === "ERROR" ? "text-red-500 text-lg" : "text-blue-400"
									)}>
										{code === "ERROR" ? "Mã Secret Sai" : `${code.slice(0, 3)} ${code.slice(3)}`}
									</span>
									<button
										onClick={() => handleCopy(code, item.id)}
										disabled={code === "ERROR"}
										className="p-3.5 bg-white/5 rounded-2xl text-[#8e8e93] hover:text-white hover:bg-white/10 transition-all active:scale-90 disabled:opacity-50"
									>
										{copiedId === item.id ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
									</button>
								</div>
								<div className="absolute bottom-0 left-0 h-1.5 bg-blue-500 transition-all duration-1000 ease-linear" style={{ width: `${(timeLeft / 30) * 100}%` }} />
							</div>
						);
					})
				)}
			</div>

			{isAdding && (
				<div className="fixed inset-0 z-200 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-300">
					<div className="bg-[#1c1c1e] w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 lg:p-10 shadow-2xl ring-1 ring-white/10 overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
						<div className="flex justify-between items-center mb-8">
							<div>
								<h3 className="text-2xl font-bold">Thêm mã mới</h3>
								<p className="text-sm text-[#8e8e93] mt-1">Dán khóa thiết lập (Secret key) vào đây.</p>
							</div>
							<button
								onClick={() => setIsAdding(false)}
								className="p-2 rounded-full bg-[#2c2c2e] text-[#8e8e93] hover:text-white transition-colors"
							>
								<X size={24} />
							</button>
						</div>
						<form onSubmit={handleAdd} className="space-y-4">
							<div className="space-y-1.5">
								<label className="text-[10px] font-bold text-[#8e8e93] uppercase tracking-wider ml-1">Tên dịch vụ</label>
								<input
									type="text"
									placeholder="Ví dụ: Facebook, Github..."
									required
									value={new2FA.label}
									onChange={(e) => setNew2FA({ ...new2FA, label: e.target.value })}
									className="w-full bg-[#2c2c2e] rounded-2xl py-4 px-6 text-sm focus:outline-none focus:ring-2 focus:ring-white/10 border-none"
									autoFocus
								/>
							</div>
							<div className="space-y-1.5">
								<label className="text-[10px] font-bold text-[#8e8e93] uppercase tracking-wider ml-1">Khóa thiết lập (Secret Key)</label>
								<input
									type="text"
									placeholder="Chuỗi ký tự do dịch vụ cung cấp..."
									required
									value={new2FA.secret}
									onChange={(e) => setNew2FA({ ...new2FA, secret: e.target.value.replace(/\s+/g, '') })}
									className="w-full bg-[#2c2c2e] rounded-2xl py-4 px-6 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-white/10 border-none uppercase"
								/>
							</div>
							<button
								type="submit"
								className="w-full bg-white text-black py-4 lg:py-5 rounded-2xl font-bold text-base mt-2 hover:bg-[#e5e5e7] active:scale-[0.98] transition-all shadow-xl"
							>
								Lưu mã bảo mật
							</button>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
