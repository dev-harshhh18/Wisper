import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, MessageSquare, Trash2, Loader2 } from "lucide-react";
import { Wisper, Comment } from "@shared/schema";
import { useEncryption } from "@/hooks/use-encryption";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCommentSchema } from "@shared/schema";
import { Textarea } from "@/components/ui/textarea";

export function WisperCard({ wisper }: { wisper: Wisper }) {
  const { decrypt } = useEncryption();
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const decryptedContent = decrypt(wisper.content);

  const { data: votes } = useQuery<number[]>({
    queryKey: ['/api/user/votes'],
    enabled: !!user,
  });

  const { data: comments = [], isLoading: isLoadingComments } = useQuery<Comment[]>({
    queryKey: [`/api/wispers/${wisper.id}/comments`],
    enabled: showComments,
  });

  const form = useForm({
    resolver: zodResolver(insertCommentSchema),
    defaultValues: { content: "", wisperId: wisper.id },
  });

  const hasVoted = votes?.includes(wisper.id) ?? false;
  const isAuthor = wisper.userId === user?.id;

  const voteMutation = useMutation({
    mutationFn: async () => {
      if (hasVoted) return; // Prevent vote removal
      await apiRequest("POST", `/api/wispers/${wisper.id}/upvote`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wispers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/votes"] });
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

  const commentMutation = useMutation({
    mutationFn: async (data: { content: string }) => {
      const res = await apiRequest("POST", `/api/wispers/${wisper.id}/comments`, data);
      return res.json();
    },
    onSuccess: () => {
      form.reset();
      queryClient.invalidateQueries({ queryKey: [`/api/wispers/${wisper.id}/comments`] });
    },
  });

  return (
    <Card className="mb-4 hover:shadow-lg transition-shadow duration-200">
      <CardContent className="pt-6">
        <p className="text-lg leading-relaxed">{decryptedContent}</p>
      </CardContent>
      <CardFooter className="flex flex-col">
        <div className="flex justify-between w-full">
          <div className="flex gap-4">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "transition-all duration-200 hover:scale-105",
                voteMutation.isPending && "opacity-50 cursor-not-allowed",
                hasVoted && "pointer-events-none", // Disable button if already voted
              )}
              onClick={() => voteMutation.mutate()}
              disabled={voteMutation.isPending || hasVoted}
            >
              {voteMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ThumbsUp
                  className={`w-4 h-4 mr-2 transition-transform duration-200 ${
                    hasVoted ? "fill-current scale-110" : ""
                  }`}
                />
              )}
              {wisper.upvotes || 0}
            </Button>

            {/* Only show downvote count to author */}
            {isAuthor && wisper.downvotes > 0 && (
              <Button variant="ghost" size="sm" className="cursor-default">
                <ThumbsDown className="w-4 h-4 mr-2" />
                {wisper.downvotes}
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              {comments.length}
            </Button>
            {isAuthor && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteMutation.mutate()}
                className="text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            )}
          </div>
        </div>

        {showComments && (
          <div className="w-full mt-4 space-y-4">
            {isLoadingComments ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">{comment.content}</p>
                  </div>
                ))}
              </div>
            )}

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((data) => commentMutation.mutate(data))}
                className="space-y-2"
              >
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Write a comment..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={commentMutation.isPending}
                >
                  {commentMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    'Post Comment'
                  )}
                </Button>
              </form>
            </Form>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}