"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Search, 
  UserPlus, 
  Trash2, 
  Edit3, 
  X, 
  Loader2, 
  CheckCircle,
  AlertTriangle,
  Mail,
  User,
  Shield,
  Key
} from "lucide-react";
import { clsx } from "clsx";

type UserData = {
	id: string;
	email: string;
	username: string;
	name: string | null;
	role: "USER" | "ADMIN";
	createdAt: string;
};

export default function AdminUsersPage() {
	const [users, setUsers] = useState<UserData[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [isAdding, setIsAdding] = useState(false);
	const [editingUser, setEditingUser] = useState<UserData | null>(null);
	const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void; type: 'danger' | 'info' }>({
		isOpen: false,
		title: "",
		message: "",
		onConfirm: () => {},
		type: 'info'
	});
	const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

	// Form states
	const [newUser, setNewUser] = useState({ name: "", email: "", username: "", password: "", role: "USER" as "USER" | "ADMIN" });
	const [editData, setEditData] = useState<Partial<UserData>>({});

	useEffect(() => {
		fetchUsers();
	}, []);

	const fetchUsers = async () => {
		try {
			const res = await fetch("/api/admin/users");
			const data = await res.json();
			setUsers(Array.isArray(data) ? data : []);
		} catch (error) {
			console.error("Fetch users error:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const filteredUsers = useMemo(() => {
		return users.filter(user => 
			(user.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
			user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
			user.username.toLowerCase().includes(searchTerm.toLowerCase())
		);
	}, [users, searchTerm]);

	const showToast = (type: "success" | "error", text: string) => {
		setMessage({ type, text });
		setTimeout(() => setMessage(null), 3000);
	};

	const openConfirm = (title: string, message: string, onConfirm: () => void, type: 'danger' | 'info' = 'danger') => {
		setConfirmModal({ isOpen: true, title, message, onConfirm, type });
	};

	const handleAddUser = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const res = await fetch("/api/admin/users", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(newUser),
			});
			if (res.ok) {
				showToast("success", "Đã thêm người dùng mới!");
				setIsAdding(false);
				setNewUser({ name: "", email: "", username: "", password: "", role: "USER" });
				fetchUsers();
			} else {
				const d = await res.json();
				showToast("error", d.message);
			}
		} catch (error) {
			showToast("error", "Lỗi kết nối");
		}
	};

	const handleSaveEdit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!editingUser) return;
		try {
			const res = await fetch(`/api/admin/users/${editingUser.id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(editData),
			});
			if (res.ok) {
				showToast("success", "Đã cập nhật thông tin!");
				setEditingUser(null);
				fetchUsers();
			}
		} catch (error) {
			showToast("error", "Lỗi khi cập nhật");
		}
	};

	const handleDelete = (userId: string) => {
		openConfirm(
			"Xác nhận xóa", 
			"Bạn có chắc chắn muốn xóa người dùng này vĩnh viễn không? Hành động này không thể hoàn tác.",
			async () => {
				try {
					const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
					if (res.ok) {
						showToast("success", "Đã xóa người dùng!");
						fetchUsers();
					}
				} catch (error) {
					showToast("error", "Lỗi khi xóa");
				}
				setConfirmModal(prev => ({ ...prev, isOpen: false }));
			}
		);
	};

	if (isLoading) return (
		<div className="flex flex-col items-center justify-center min-h-[60vh] text-[#8e8e93]">
			<Loader2 className="animate-spin mb-4" size={40} />
			<p className="font-medium">Đang tải danh sách người dùng...</p>
		</div>
	);

	return (
		<div className="space-y-6 lg:space-y-8 pb-12 w-full max-w-full overflow-hidden">
			{/* Toast Message */}
			{message && (
				<div className={clsx(
					"fixed top-6 right-6 lg:top-8 lg:right-8 z-300 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl transition-all animate-in fade-in slide-in-from-top-4",
					message.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
				)}>
					<CheckCircle size={20} />
					<span className="font-bold text-sm lg:text-base">{message.text}</span>
				</div>
			)}

			{/* Custom Confirm Modal */}
			{confirmModal.isOpen && (
				<div className="fixed inset-0 z-250 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
					<div className="bg-[#1c1c1e] w-full max-w-sm rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
						<div className="p-8 text-center">
							<div className={clsx(
								"mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6",
								confirmModal.type === 'danger' ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-500"
							)}>
								<AlertTriangle size={32} />
							</div>
							<h3 className="text-xl font-bold mb-3">{confirmModal.title}</h3>
							<p className="text-[#8e8e93] text-sm leading-relaxed">{confirmModal.message}</p>
						</div>
						<div className="flex border-t border-white/5 divide-x divide-white/5">
							<button 
								onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
								className="flex-1 py-4 text-sm font-bold text-[#8e8e93] hover:bg-white/5 transition-colors"
							>
								Hủy bỏ
							</button>
							<button 
								onClick={confirmModal.onConfirm}
								className={clsx(
									"flex-1 py-4 text-sm font-bold hover:opacity-80 transition-all",
									confirmModal.type === 'danger' ? "bg-red-500 text-white" : "bg-white text-black"
								)}
							>
								Xác nhận
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Header & Search */}
			<div className="flex flex-col gap-6">
				<div className="flex items-center justify-between">
					<div className="min-w-0">
						<h1 className="text-2xl lg:text-3xl font-bold tracking-tight truncate">Người dùng</h1>
						<p className="text-[#8e8e93] text-xs lg:text-sm mt-1 truncate">Quản lý thành viên hệ thống.</p>
					</div>
					<button 
						onClick={() => setIsAdding(true)}
						className="flex items-center gap-2 bg-white text-black px-4 py-2.5 lg:px-6 lg:py-3 rounded-2xl font-bold text-sm hover:bg-[#e5e5e7] active:scale-95 transition-all shadow-lg shrink-0"
					>
						<UserPlus size={18} /> <span className="hidden sm:inline">Thêm mới</span>
					</button>
				</div>

				<div className="relative group w-full">
					<Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#48484a] group-focus-within:text-white transition-colors" size={20} />
					<input 
						type="text" 
						placeholder="Tìm kiếm..." 
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="w-full bg-[#2c2c2e] rounded-2xl lg:rounded-3xl py-3.5 lg:py-4 pl-12 pr-6 text-sm lg:text-base focus:outline-none ring-1 ring-white/5 focus:ring-white/20 border-none transition-all placeholder:text-[#48484a]"
					/>
				</div>
			</div>

			{/* Users Table */}
			<div className="bg-[#2c2c2e] rounded-3xl lg:rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden w-full">
				<div className="overflow-x-auto scrollbar-hide">
					<table className="w-full text-left border-collapse min-w-150">
						<thead>
							<tr className="border-b border-white/5 bg-white/2 text-[#8e8e93] text-[10px] lg:text-[12px] uppercase tracking-wider">
								<th className="px-6 py-4 lg:py-5 font-bold w-16"># ID</th>
								<th className="px-6 py-4 lg:py-5 font-bold">Username</th>
								<th className="px-6 py-4 lg:py-5 font-bold hidden md:table-cell">Họ tên</th>
								<th className="px-6 py-4 lg:py-5 font-bold hidden lg:table-cell">Email</th>
								<th className="px-6 py-4 lg:py-5 font-bold hidden sm:table-cell">Quyền</th>
								<th className="px-6 py-4 lg:py-5 font-bold text-right">Thao tác</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-white/5">
							{filteredUsers.length > 0 ? filteredUsers.map((user, index) => (
								<tr key={user.id} className="group hover:bg-white/1 transition-colors">
									<td className="px-6 py-4 lg:py-5 text-sm font-medium text-[#48484a]">{index + 1}</td>
									<td className="px-6 py-4 lg:py-5">
										<div className="flex flex-col">
											<span className="font-bold text-sm lg:text-base">{user.username}</span>
											<span className="text-[10px] lg:hidden text-[#8e8e93] truncate max-w-37.5">{user.email}</span>
										</div>
									</td>
									<td className="px-6 py-4 lg:py-5 hidden md:table-cell text-sm">{user.name || "—"}</td>
									<td className="px-6 py-4 lg:py-5 hidden lg:table-cell text-sm text-[#8e8e93]">{user.email}</td>
									<td className="px-6 py-4 lg:py-5 hidden sm:table-cell">
										<span className={clsx(
											"text-[10px] font-bold px-3 py-1 rounded-full border",
											user.role === 'ADMIN' 
												? 'bg-purple-500/10 text-purple-500 border-purple-500/20' 
												: 'bg-blue-500/10 text-blue-500 border-blue-500/20'
										)}>
											{user.role}
										</span>
									</td>
									<td className="px-6 py-4 lg:py-5 text-right space-x-1 lg:space-x-2">
										<button 
											onClick={() => {
												setEditingUser(user);
												setEditData(user);
											}} 
											className="p-2.5 bg-white/5 text-[#8e8e93] rounded-xl hover:bg-white hover:text-black transition-all active:scale-90"
										>
											<Edit3 size={18} />
										</button>
										<button 
											onClick={() => handleDelete(user.id)} 
											className="p-2.5 bg-red-500/10 text-[#ff453a] rounded-xl hover:bg-[#ff453a] hover:text-white transition-all active:scale-90"
										>
											<Trash2 size={18} />
										</button>
									</td>
								</tr>
							)) : (
								<tr>
									<td colSpan={6} className="px-6 py-20 text-center text-[#8e8e93]">
										Không tìm thấy người dùng nào phù hợp.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* Add/Edit Modal */}
			{(isAdding || editingUser) && (
				<div className="fixed inset-0 z-200 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-300">
					<div className="bg-[#1c1c1e] w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 lg:p-10 shadow-2xl ring-1 ring-white/10 overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
						<div className="flex justify-between items-center mb-8">
							<div>
								<h3 className="text-2xl font-bold">{isAdding ? "Người dùng mới" : "Sửa thông tin"}</h3>
								<p className="text-sm text-[#8e8e93] mt-1">Cung cấp thông tin tài khoản bên dưới.</p>
							</div>
							<button 
								onClick={() => {
									setIsAdding(false);
									setEditingUser(null);
								}} 
								className="p-2 rounded-full bg-[#2c2c2e] text-[#8e8e93] hover:text-white"
							>
								<X size={24} />
							</button>
						</div>

						<form onSubmit={isAdding ? handleAddUser : handleSaveEdit} className="space-y-5">
							<div className="space-y-4 max-h-[60vh] overflow-y-auto px-1">
								{/* Name */}
								<div className="space-y-1.5">
									<label className="text-[10px] font-bold text-[#8e8e93] uppercase tracking-wider ml-1">Họ và tên</label>
									<div className="relative">
										<User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#48484a]" size={18} />
										<input 
											type="text" 
											required 
											value={isAdding ? newUser.name : (editData.name || "")} 
											onChange={e => isAdding ? setNewUser({...newUser, name: e.target.value}) : setEditData({...editData, name: e.target.value})} 
											className="w-full bg-[#2c2c2e] rounded-2xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:ring-2 focus:ring-white/10 border-none"
											placeholder="Nguyễn Văn A"
										/>
									</div>
								</div>

								{/* Username & Email Row */}
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<div className="space-y-1.5">
										<label className="text-[10px] font-bold text-[#8e8e93] uppercase tracking-wider ml-1">Username</label>
										<input 
											type="text" 
											required 
											value={isAdding ? newUser.username : (editData.username || "")} 
											onChange={e => isAdding ? setNewUser({...newUser, username: e.target.value}) : setEditData({...editData, username: e.target.value})} 
											className="w-full bg-[#2c2c2e] rounded-2xl py-4 px-6 text-sm focus:outline-none focus:ring-2 focus:ring-white/10 border-none"
											placeholder="nva_99"
										/>
									</div>
									<div className="space-y-1.5">
										<label className="text-[10px] font-bold text-[#8e8e93] uppercase tracking-wider ml-1">Email</label>
										<div className="relative">
											<Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#48484a]" size={18} />
											<input 
												type="email" 
												required 
												value={isAdding ? newUser.email : (editData.email || "")} 
												onChange={e => isAdding ? setNewUser({...newUser, email: e.target.value}) : setEditData({...editData, email: e.target.value})} 
												className="w-full bg-[#2c2c2e] rounded-2xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:ring-2 focus:ring-white/10 border-none"
												placeholder="nva@example.com"
											/>
										</div>
									</div>
								</div>

								{/* Password (Only for new user) */}
								{isAdding && (
									<div className="space-y-1.5">
										<label className="text-[10px] font-bold text-[#8e8e93] uppercase tracking-wider ml-1">Mật khẩu</label>
										<div className="relative">
											<Key className="absolute left-4 top-1/2 -translate-y-1/2 text-[#48484a]" size={18} />
											<input 
												type="password" 
												value={newUser.password} 
												onChange={e => setNewUser({...newUser, password: e.target.value})} 
												className="w-full bg-[#2c2c2e] rounded-2xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:ring-2 focus:ring-white/10 border-none"
												placeholder="Mặc định: 123456"
											/>
										</div>
									</div>
								)}

								{/* Role Selection */}
								<div className="space-y-3">
									<label className="text-[10px] font-bold text-[#8e8e93] uppercase tracking-wider ml-1">Quyền hạn truy cập</label>
									<div className="grid grid-cols-2 gap-3">
										<button 
											type="button" 
											onClick={() => isAdding ? setNewUser({...newUser, role: 'USER'}) : setEditData({...editData, role: 'USER'})} 
											className={clsx(
												"flex items-center justify-center gap-2 py-4 rounded-2xl text-xs font-bold border transition-all",
												(isAdding ? newUser.role : editData.role) === 'USER' 
													? "bg-blue-500 border-blue-400 text-white shadow-lg shadow-blue-500/20" 
													: "bg-[#2c2c2e] border-white/5 text-[#8e8e93]"
											)}
										>
											<User size={16} /> USER
										</button>
										<button 
											type="button" 
											onClick={() => isAdding ? setNewUser({...newUser, role: 'ADMIN'}) : setEditData({...editData, role: 'ADMIN'})} 
											className={clsx(
												"flex items-center justify-center gap-2 py-4 rounded-2xl text-xs font-bold border transition-all",
												(isAdding ? newUser.role : editData.role) === 'ADMIN' 
													? "bg-purple-500 border-purple-400 text-white shadow-lg shadow-purple-500/20" 
													: "bg-[#2c2c2e] border-white/5 text-[#8e8e93]"
											)}
										>
											<Shield size={16} /> ADMIN
										</button>
									</div>
								</div>
							</div>

							<button 
								type="submit" 
								className="w-full bg-white text-black py-4 lg:py-5 rounded-2xl font-bold text-base lg:text-lg mt-4 hover:bg-[#e5e5e7] active:scale-[0.98] transition-all shadow-xl"
							>
								{isAdding ? "Tạo tài khoản ngay" : "Lưu thay đổi"}
							</button>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
