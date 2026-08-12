import { Sidebar } from "@/components/Sidebar";

export default function SectionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="md:flex">
      <Sidebar />
      <main className="relative min-h-screen flex-1 md:ml-[clamp(360px,40vw,640px)]">
        {children}
      </main>
    </div>
  );
}
