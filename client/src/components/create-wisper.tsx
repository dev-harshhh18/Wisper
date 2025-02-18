import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertWisperSchema } from "@shared/schema";

const BANNED_WORDS = [
  'racist', 'offensive', 'hate', 'slur', 'discriminate',
  // Add more banned words as needed
];
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { useEncryption } from "@/hooks/use-encryption";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

export function CreateWisper() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { encrypt } = useEncryption();
  
  const form = useForm({
    resolver: zodResolver(insertWisperSchema),
    defaultValues: { content: "" },
  });

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
    },
  });

  return (
    <Card className="mb-8">
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => createWisperMutation.mutate(data))} className="space-y-4">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Share your thoughts anonymously..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className="w-full"
              disabled={isSubmitting}
            >
              Post Wisper
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
