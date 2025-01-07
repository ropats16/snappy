import CameraApp from "../components/CameraApp";
import { Toaster } from "@/components/ui/toaster";

export default function Home() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-white">
      <CameraApp />
      <Toaster />
    </main>
  );
}
