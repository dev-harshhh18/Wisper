import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, Trash2, Loader2 } from "lucide-react";
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
import { cn } from "@/lib/utils";

export function WisperCard({ wisper }: { wisper: Wisper }) {
  const { decrypt } = useEncryption();
  const { user } = useAuth();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const decryptedContent = decrypt(wisper.content);

  const voteMutation = useMutation({
    mutationFn: async ({ type }: { type: "upvote" | "remove-upvote" }) => {
      await apiRequest("POST", `/api/wispers/${wisper.id}/${type}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wispers"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/wispers/${wisper.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wispers"] });
    },
  });

  const handleDelete = () => {
    setShowDeleteDialog(false);
    deleteMutation.mutate();
  };

  const isAuthor = wisper.userId === user?.id;
  const hasUpvoted = wisper.upvotes > 0;

  return (
    <Card className="mb-4 hover:shadow-lg transition-shadow duration-200">
      <CardContent className="pt-6">
        <p className="text-lg leading-relaxed">{decryptedContent}</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex gap-4">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "transition-all duration-200 hover:scale-105",
              voteMutation.isPending && "opacity-50 cursor-not-allowed",
            )}
            onClick={() =>
              voteMutation.mutate({
                type: hasUpvoted ? "remove-upvote" : "upvote",
              })
            }
            disabled={voteMutation.isPending}
          >
            {voteMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <ThumbsUp
                className={`w-4 h-4 mr-2 transition-transform duration-200 ${
                  hasUpvoted ? "fill-current scale-110" : ""
                }`}
              />
            )}
            {wisper.upvotes || 0}
          </Button>
        </div>
        {isAuthor && (
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "text-destructive hover:text-destructive",
              deleteMutation.isPending && "opacity-50 cursor-not-allowed",
            )}
            onClick={() => setShowDeleteDialog(true)}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </Button>
        )}

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this Wisper?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. The Wisper will be permanently
                deleted.
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
