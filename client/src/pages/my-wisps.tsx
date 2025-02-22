import { useQuery } from "@tanstack/react-query";
import { Wisper } from "@shared/schema";
import { WisperCard } from "@/components/wisper-card";
import { Navbar } from "@/components/navbar";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

export default function MyWispsPage() {
  const { user } = useAuth();
  const { data: wispers, isLoading } = useQuery<Wisper[]>({
    queryKey: ['/api/user/wispers'],
    enabled: !!user,
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">My Wispers</h1>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : wispers?.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            You haven't created any wispers yet.
          </p>
        ) : (
          <div className="space-y-4">
            {wispers?.map((wisper) => (
              <WisperCard key={wisper.id} wisper={wisper} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
