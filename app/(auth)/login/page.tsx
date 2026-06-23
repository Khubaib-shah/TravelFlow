"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plane, Mail, Lock, ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    // Mock authentication delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    // Set a dummy cookie to pass the middleware check
    document.cookie = `tf_mock_session=${values.email}; path=/; max-age=86400`;
    
    toast.success("Successfully logged in");
    router.push("/dashboard");
  };

  const fillDummyCredentials = (role: "admin" | "agent") => {
    if (role === "admin") {
      form.setValue("email", "admin@travelflow.pk");
      form.setValue("password", "admin123");
      toast.info("Admin credentials filled");
    } else {
      form.setValue("email", "agent@travelflow.pk");
      form.setValue("password", "agent123");
      toast.info("Agent credentials filled");
    }
  };

  return (
    <div className="w-full h-screen flex">
      {/* Left Side - Image/Branding */}
      <div className="hidden lg:flex w-1/2 relative bg-slate-900 overflow-hidden">
        {/* Modern Travel Image */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center" 
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074&auto=format&fit=crop')" }} 
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-[var(--tf-primary)]/90 via-[var(--tf-primary)]/40 to-transparent" />
        
        <div className="absolute inset-0 z-20 flex flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
              <Plane className="w-8 h-8 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">TravelFlow</span>
          </div>
          
          <div className="max-w-md">
            <h1 className="text-4xl font-bold mb-4">The Operating System for Modern Travel Agencies</h1>
            <p className="text-white/80 text-lg">
              Manage your bookings, customers, leads, and financials all in one powerful platform designed for travel professionals.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[var(--tf-bg)]">
        <div className="w-full max-w-md space-y-8">
          
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:hidden gap-2 mb-8">
              <div className="bg-[var(--tf-primary)] p-2 rounded-xl">
                <Plane className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-[var(--tf-text-primary)] tracking-tight">TravelFlow</span>
            </div>
            <h2 className="tf-h1 text-[var(--tf-text-primary)]">Welcome back</h2>
            <p className="tf-body text-[var(--tf-text-secondary)] mt-2">Enter your credentials to access your agency dashboard.</p>
          </div>

          {/* Dummy Credentials Helper */}
          <div className="bg-[var(--tf-surface)] border border-[var(--tf-border)] rounded-xl p-4 shadow-sm">
            <p className="text-xs text-[var(--tf-text-secondary)] mb-3 font-medium uppercase tracking-wider">Demo Credentials</p>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" className="flex-1" onClick={() => fillDummyCredentials("admin")}>
                Admin Login
              </Button>
              <Button type="button" variant="outline" size="sm" className="flex-1" onClick={() => fillDummyCredentials("agent")}>
                Agent Login
              </Button>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[var(--tf-text-secondary)]">Email Address</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-5 w-5 text-[var(--tf-text-muted)]" />
                        <Input 
                          placeholder="name@travelflow.pk" 
                          className="pl-10 bg-[var(--tf-surface)] border-[var(--tf-border)] h-11 text-[var(--tf-text-primary)]" 
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-[var(--tf-danger)]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-[var(--tf-text-secondary)]">Password</FormLabel>
                      <a href="#" className="text-sm font-medium text-[var(--tf-primary)] hover:underline">Forgot password?</a>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-5 w-5 text-[var(--tf-text-muted)]" />
                        <Input 
                          type="password"
                          placeholder="••••••••" 
                          className="pl-10 bg-[var(--tf-surface)] border-[var(--tf-border)] h-11 text-[var(--tf-text-primary)]" 
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-[var(--tf-danger)]" />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full h-11 bg-[var(--tf-primary)] text-white hover:bg-[var(--tf-primary-hover)] text-base font-semibold" disabled={isLoading}>
                {isLoading ? "Signing in..." : (
                  <>
                    Sign In <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          </Form>

        </div>
      </div>
    </div>
  );
}
