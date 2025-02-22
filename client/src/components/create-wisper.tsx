import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertWisperSchema } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useEncryption } from "@/hooks/use-encryption";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Smile } from "lucide-react";
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const BANNED_WORDS = [
  'racist', 'offensive', 'hate', 'slur', 'discriminate',
  // Add more banned words as needed
];

export function CreateWisper() {
  const { encrypt } = useEncryption();
  const { toast } = useToast();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const form = useForm({
    resolver: zodResolver(insertWisperSchema),
    defaultValues: { content: "" },
  });

  const addEmoji = (emoji: any) => {
    const textarea = form.getValues("content");
    form.setValue("content", textarea + emoji.native);
  };

  const createWisperMutation = useMutation({
    mutationFn: async (data: { content: string }) => {
      const words = data.content.split(/\s+/);
      if (words.length < 20) {
        throw new Error("Content must be at least 20 words long");
      }

      const hasBannedWords = BANNED_WORDS.some(word => 
        data.content.toLowerCase().includes(word)
      );
      if (hasBannedWords) {
        throw new Error("Content contains inappropriate language");
      }

      const encrypted = encrypt(data.content);
      if (!encrypted) throw new Error("Encryption failed");
      await apiRequest('POST', '/api/wispers', { content: encrypted });
    },
    onSuccess: () => {
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/wispers'] });
      toast({
        title: "Success",
        description: "Your Wisper has been posted!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Card className="mb-8">
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => createWisperMutation.mutate(data))} className="space-y-4">
            <div className="flex gap-2 mb-4">
              <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                <PopoverTrigger asChild>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon"
                    className="shrink-0"
                  >
                    <Smile className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Picker
                    data={data}
                    onEmojiSelect={addEmoji}
                    theme="light"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Share your thoughts anonymously... (minimum 20 words)"
                      className="min-h-[100px] resize-none transition-all duration-200 focus:min-h-[150px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full"
              disabled={createWisperMutation.isPending}
            >
              {createWisperMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                'Post Wisper'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}