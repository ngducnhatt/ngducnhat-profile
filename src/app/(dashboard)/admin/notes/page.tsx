import NotesList from "@/components/dashboard/NotesList";

export default function AdminNotesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Quản lý Ghi chú</h1>
        <p className="text-[#8e8e93] mt-1">Xem và quản lý tất cả các ghi chú của bạn.</p>
      </div>
      <NotesList />
    </div>
  );
}
