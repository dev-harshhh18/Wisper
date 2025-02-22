import { useQuery } from "@tanstack/react-query";
import { CreateWisper } from "@/components/create-wisper";
import { WisperCard } from "@/components/wisper-card";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Wisper } from "@shared/schema";

export default function HomePage() {
  const { data: wispers } = useQuery<Wisper[]>({
    queryKey: ['/api/wispers'],
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8 flex-1">
        <CreateWisper />

        <div className="space-y-4">
          {wispers?.map((wisper) => (
            <WisperCard key={wisper.id} wisper={wisper} />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}