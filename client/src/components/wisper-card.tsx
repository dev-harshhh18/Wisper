import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, Trash2 } from "lucide-react";
import { Wisper } from "@shared/schema";
import { useEncryption } from "@/hooks/use-encryption";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

export function WisperCard({ wisper }: { wisper: Wisper }) {
  const { decrypt } = useEncryption();
  const { user } = useAuth();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const decryptedContent = decrypt(wisper.content);

  const voteMutation = useMutation({
    mutationFn: async ({ type }: { type: 'upvote' | 'remove-upvote' }) => {
      await apiRequest('POST', `/api/wispers/${wisper.id}/${type}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wispers'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('DELETE', `/api/wispers/${wisper.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wispers'] });
    },
  });

  const handleDelete = () => {
    setShowDeleteDialog(false);
    deleteMutation.mutate();
  };

  const isAuthor = wisper.userId === user?.id;
  const hasUpvoted = wisper.upvotes > 0; // This is a simplification, we'll need to track user votes

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
            className="transition-all duration-200 hover:scale-105"
            onClick={() => voteMutation.mutate({ 
              type: hasUpvoted ? 'remove-upvote' : 'upvote' 
            })}
          >
            <ThumbsUp 
              className={`w-4 h-4 mr-2 ${hasUpvoted ? 'fill-current' : ''}`} 
            />
            {wisper.upvotes}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="transition-all duration-200 hover:scale-105"
            onClick={() => voteMutation.mutate({ 
              type: 'downvote'
            })}
          >
            <ThumbsDown className="w-4 h-4" />
          </Button>
        </div>
        {isAuthor && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this Wisper?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. The Wisper will be permanently deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete}
                className="bg-destructive hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}