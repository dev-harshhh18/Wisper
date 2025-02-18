import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, MessageCircle } from "lucide-react";
import { Wisper } from "@shared/schema";
import { useEncryption } from "@/hooks/use-encryption";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

export function WisperCard({ wisper }: { wisper: Wisper }) {
  const { decrypt } = useEncryption();
  const decryptedContent = decrypt(wisper.content);

  const voteMutation = useMutation({
    mutationFn: async ({ type }: { type: 'upvote' | 'downvote' }) => {
      await apiRequest('POST', `/api/wispers/${wisper.id}/${type}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wispers'] });
    },
  });

  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <p className="text-lg">{decryptedContent}</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => voteMutation.mutate({ type: 'upvote' })}
          >
            <ThumbsUp className="w-4 h-4 mr-2" />
            {wisper.upvotes}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => voteMutation.mutate({ type: 'downvote' })}
          >
            <ThumbsDown className="w-4 h-4 mr-2" />
            {wisper.downvotes}
          </Button>
        </div>
        <Button variant="ghost" size="sm">
          <MessageCircle className="w-4 h-4 mr-2" />
          Comment
        </Button>
      </CardFooter>
    </Card>
  );
}
