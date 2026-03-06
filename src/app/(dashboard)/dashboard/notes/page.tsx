import NotesList from "@/components/dashboard/NotesList";

export default function UserNotesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ghi chú của tôi</h1>
        <p className="text-[#8e8e93] mt-1">Lưu trữ các ý tưởng và thông tin quan trọng của bạn.</p>
      </div>
      <NotesList />
    </div>
  );
}
