"use client";

import { useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { Plus, Trash2, StickyNote, Loader2, X, AlertTriangle, CheckCircle } from "lucide-react";
import { clsx } from "clsx";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
};

export default function NotesList() {
  const { mutate } = useSWRConfig();
  
  // Cấu hình Fetch-Once cho Ghi chú
  const { data: notes = [], isLoading } = useSWR<Note[]>("/api/notes", fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  const [isAdding, setIsAdding] = useState(false);
  const [newNote, setNewNote] = useState({ title: "", content: "" });
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showToast = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.title || !newNote.content) return;

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newNote),
      });
      if (res.ok) {
        setNewNote({ title: "", content: "" });
        setIsAdding(false);
        showToast("success", "Đã lưu ghi chú mới!");
        // Chỉ gọi lại API khi có thay đổi thực sự
        mutate("/api/notes");
      } else {
        showToast("error", "Lỗi khi lưu ghi chú");
      }
    } catch (error) {
      showToast("error", "Lỗi kết nối máy chủ");
    }
  };

  const handleDelete = async () => {
    if (!confirmModal.id) return;
    try {
      const res = await fetch(`/api/notes/${confirmModal.id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("success", "Đã xóa ghi chú!");
        mutate("/api/notes");
      } else {
        showToast("error", "Không thể xóa ghi chú");
      }
    } catch (error) {
      showToast("error", "Lỗi kết nối máy chủ");
    } finally {
      setConfirmModal({ isOpen: false, id: null });
    }
  };

  if (isLoading && notes.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[50vh] text-[#8e8e93]">
        <Loader2 className="animate-spin mb-4" size={40} />
        <p className="font-medium">Đang tải ghi chú...</p>
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
              <h3 className="text-xl font-bold mb-3">Xóa ghi chú?</h3>
              <p className="text-[#8e8e93] text-sm leading-relaxed">Hành động này không thể hoàn tác. Ghi chú của bạn sẽ bị xóa vĩnh viễn.</p>
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
        <button 
          onClick={() => setIsAdding(true)}
          className="flex justify-center items-center gap-2 bg-white text-black px-6 py-3 rounded-2xl font-bold text-sm hover:bg-[#e5e5e7] active:scale-95 transition-all shadow-lg w-full sm:w-auto"
        >
          <Plus size={18} /> Thêm ghi chú
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {notes.length === 0 ? (
          <div className="col-span-full bg-[#2c2c2e]/50 p-12 rounded-[2.5rem] text-center border border-dashed border-white/10">
            <StickyNote className="mx-auto text-[#8e8e93] mb-4" size={48} />
            <p className="text-[#8e8e93]">Chưa có ghi chú nào. Hãy tạo cái đầu tiên!</p>
          </div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="bg-[#2c2c2e] p-6 rounded-3xl lg:rounded-[2rem] border border-white/5 shadow-xl group hover:border-white/20 transition-all flex flex-col h-[280px]">
              <div className="flex justify-between items-start mb-4 gap-4">
                <h3 className="font-bold text-lg leading-tight line-clamp-2">{note.title}</h3>
                <button 
                  onClick={() => setConfirmModal({ isOpen: true, id: note.id })}
                  className="text-[#ff453a] p-2 bg-red-500/10 rounded-xl opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity active:scale-90 shrink-0"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar mb-4">
                <p className="text-[#8e8e93] text-sm leading-relaxed whitespace-pre-wrap">
                  {note.content}
                </p>
              </div>
              <div className="text-[10px] text-[#48484a] font-bold uppercase tracking-widest pt-4 border-t border-white/5 shrink-0">
                {new Date(note.createdAt).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          ))
        )}
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-300">
          <div className="bg-[#1c1c1e] w-full max-w-xl rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 lg:p-10 shadow-2xl ring-1 ring-white/10 overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-bold">Ghi chú mới</h3>
                <p className="text-sm text-[#8e8e93] mt-1">Viết nội dung bạn muốn lưu lại.</p>
              </div>
              <button 
                onClick={() => setIsAdding(false)} 
                className="p-2 rounded-full bg-[#2c2c2e] text-[#8e8e93] hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddNote} className="space-y-4">
              <input
                type="text"
                placeholder="Tiêu đề ghi chú..."
                required
                value={newNote.title}
                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                className="w-full bg-[#2c2c2e] rounded-2xl py-4 px-6 text-base font-bold focus:outline-none focus:ring-2 focus:ring-white/10 border-none placeholder:font-normal"
                autoFocus
              />
              <textarea
                placeholder="Nhập nội dung chi tiết..."
                required
                value={newNote.content}
                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                rows={8}
                className="w-full bg-[#2c2c2e] rounded-2xl py-4 px-6 text-sm focus:outline-none focus:ring-2 focus:ring-white/10 resize-none border-none leading-relaxed custom-scrollbar"
              />
              <button
                type="submit"
                className="w-full bg-white text-black py-4 lg:py-5 rounded-2xl font-bold text-base mt-2 hover:bg-[#e5e5e7] active:scale-[0.98] transition-all shadow-xl"
              >
                Lưu ghi chú
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
