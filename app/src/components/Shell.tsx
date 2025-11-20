import Navbar from "./Navbar";
import { Toaster } from "@/components/ui/sonner";
import { Chat } from "./Chat/Chat";

const Shell = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col bg-linear-to-br from-zinc-50 via-zinc-50 to-zinc-100 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-800">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-[url('data:image/svg+xml,%3csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 32 32%22 width=%2232%22 height=%2232%22 fill=%22none%22 stroke=%22rgb(148 163 184 / 0.05)%22%3e%3cpath d=%22m0 .5 32 32M32 .5 0 32%22/%3e%3c/svg%3e')] dark:bg-[url('data:image/svg+xml,%3csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 32 32%22 width=%2232%22 height=%2232%22 fill=%22none%22 stroke=%22rgb(64 64 64 / 0.05)%22%3e%3cpath d=%22m0 .5 32 32M32 .5 0 32%22/%3e%3c/svg%3e')] mask-[radial-gradient(ellipse_at_center,transparent_20%,black)]" />

      <Navbar />

      <main className="relative flex-1 w-full mx-auto py-3">
        <div className="w-full">{children}</div>
      </main>
      <Chat />
      <Toaster />
    </div>
  );
};

export default Shell;
