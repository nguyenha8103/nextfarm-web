import { Button } from '@/components/ui/Button';

export default function AiChatPage() {
  return (
    <section className="flex h-full min-h-[720px] flex-col p-6">
      <p className="text-sm font-medium text-[#236b4a]">AI</p>
      <h1 className="mt-2 text-2xl font-semibold">Tro ly nong nghiep</h1>
      <div className="mt-6 flex-1 rounded-lg border border-[#dbe3dc] bg-white p-5">
        <div className="max-w-xl rounded-lg bg-[#eef4ef] p-4 text-sm leading-6">
          Chao ban, toi co the ho tro phan tich vu mua, rui ro sau benh va ke hoach canh tac.
        </div>
      </div>
      <form className="mt-4 flex gap-3">
        <input
          className="min-w-0 flex-1 rounded-md border border-[#cdd8d0] px-4 py-3 outline-none focus:border-[#236b4a]"
          placeholder="Nhap cau hoi..."
        />
        <Button type="button">Gui</Button>
      </form>
    </section>
  );
}
