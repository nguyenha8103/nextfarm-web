import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#eef4ef] px-6">
      <section className="w-full max-w-sm rounded-lg border border-[#d7e2d9] bg-white p-6 shadow-sm">
        <div className="mb-6">
          <p className="text-sm font-medium text-[#236b4a]">Nextfarm</p>
          <h1 className="mt-2 text-2xl font-semibold text-[#17211b]">Dang nhap</h1>
        </div>
        <form className="space-y-4">
          <label className="block text-sm font-medium text-[#334139]">
            Email
            <input
              className="mt-1 w-full rounded-md border border-[#cdd8d0] px-3 py-2 outline-none focus:border-[#236b4a]"
              name="email"
              type="email"
              placeholder="admin@nextfarm.vn"
            />
          </label>
          <label className="block text-sm font-medium text-[#334139]">
            Mat khau
            <input
              className="mt-1 w-full rounded-md border border-[#cdd8d0] px-3 py-2 outline-none focus:border-[#236b4a]"
              name="password"
              type="password"
              placeholder="********"
            />
          </label>
          <Button className="w-full" type="button">
            Dang nhap
          </Button>
        </form>
      </section>
    </main>
  );
}
