import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?from=/admin/dashboard");
  }

  if (user.role !== "ADMIN") {
    redirect("/resident/dashboard?error=unauthorized_admin");
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#090d16]">
      <Navbar user={user} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
