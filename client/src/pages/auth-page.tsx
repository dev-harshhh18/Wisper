import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FaGithub, FaLinkedin, FaXTwitter } from "react-icons/fa6";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();

  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  const loginForm = useForm({
    resolver: zodResolver(insertUserSchema),
    defaultValues: { username: "", password: "" },
  });

  const registerForm = useForm({
    resolver: zodResolver(insertUserSchema),
    defaultValues: { username: "", password: "" },
  });

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Login/Register Section */}
      <div className="flex flex-col items-center justify-center p-8">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>Welcome to Wisper</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <Form {...loginForm}>
                  <form
                    onSubmit={loginForm.handleSubmit((data) =>
                      loginMutation.mutate(data),
                    )}
                    className="space-y-4"
                  >
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full">
                      Login
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="register">
                <Form {...registerForm}>
                  <form
                    onSubmit={registerForm.handleSubmit((data) =>
                      registerMutation.mutate(data),
                    )}
                    className="space-y-4"
                  >
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full">
                      Register
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Built by Section */}
        <div className="mt-6 text-center">
          <h3 className="text-sm font-medium text-muted-foreground">
            Built by Harshad Nikam
          </h3>
          <div className="flex justify-center gap-3 mt-2">
            <a
              href="https://www.linkedin.com/in/harshad-nikam-311734281/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <FaLinkedin
                size={18}
                className="text-blue-600 hover:text-blue-800"
              />
            </a>
            <a
              href="https://x.com/not_harshad_18"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <FaXTwitter
                size={18}
                className="text-black hover:text-gray-700"
              />
            </a>
            <a
              href="https://github.com/dev-harshhh18/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <FaGithub
                size={18}
                className="text-gray-900 hover:text-gray-700"
              />
            </a>
          </div>
        </div>
      </div>

      {/* Slogan Section */}
      <div className="hidden md:flex flex-col justify-center p-8 bg-primary text-primary-foreground">
        <h1 className="text-4xl font-bold mb-4">
          Share Your Voice Anonymously
        </h1>
        <p className="text-lg opacity-90">
          Express yourself freely and securely with Wisper. Your identity
          remains private while your voice is heard.
        </p>
      </div>
    </div>
  );
}
