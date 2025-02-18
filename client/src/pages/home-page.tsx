import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { WisperCard } from "@/components/wisper-card";
import { CreateWisper } from "@/components/create-wisper";
import { Wisper } from "@shared/schema";
import { LogOut } from "lucide-react";

export default function HomePage() {
  const { logoutMutation } = useAuth();
  
  const { data: wispers } = useQuery<Wisper[]>({
    queryKey: ['/api/wispers'],
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Wisper</h1>
          <Button variant="ghost" onClick={() => logoutMutation.mutate()}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <CreateWisper />
        
        <div className="space-y-4">
          {wispers?.map((wisper) => (
            <WisperCard key={wisper.id} wisper={wisper} />
          ))}
        </div>
      </main>
    </div>
  );
}
