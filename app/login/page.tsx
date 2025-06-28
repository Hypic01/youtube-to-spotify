"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Music } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { toast } from "sonner"

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Check your email to confirm your registration.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/dashboard");
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Authentication failed";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/dashboard`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
        },
      });
      if (error) throw error;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Google login failed";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="w-full max-w-sm sm:max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-orange-500 rounded-full blur-xl opacity-50 animate-pulse" />
              <div className="relative bg-white/10 backdrop-blur-sm rounded-full p-3 sm:p-4 border border-white/20">
                <Music className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-3">
            {isSignUp ? "Start converting videos." : "Welcome back!"}
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-300">
            {isSignUp 
              ? "Create an account to build playlists automatically."
              : "Sign in to convert your next video to a playlist."
            }
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-white/20">
          <Button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white hover:bg-gray-100 text-gray-900 font-semibold py-2.5 sm:py-3 px-4 rounded-xl mb-4 sm:mb-6 flex items-center justify-center cursor-pointer text-sm sm:text-base"
          >
            <FcGoogle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
            {loading ? "Signing you in..." : "Continue with Google"}
          </Button>

          <div className="flex items-center mb-4 sm:mb-6">
            <div className="flex-1 border-t border-white/20"></div>
            <div className="px-3 sm:px-4 text-gray-400 text-xs sm:text-sm">or use your email</div>
            <div className="flex-1 border-t border-white/20"></div>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-3 sm:space-y-4">
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400 rounded-xl py-2.5 sm:py-3 text-sm sm:text-base"
            />
            <Input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400 rounded-xl py-2.5 sm:py-3 text-sm sm:text-base"
            />
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-700 hover:to-orange-700 text-white font-semibold py-2.5 sm:py-3 rounded-xl transition-all duration-300 hover:scale-101 cursor-pointer text-sm sm:text-base"
            >
              <Mail className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              {loading ? "Setting up your account..." : (isSignUp ? "Create Account" : "Sign In")}
            </Button>
          </form>

          <div className="mt-4 sm:mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm cursor-pointer"
              disabled={loading}
            >
              {isSignUp
                ? "Already have an account? Sign in instead"
                : "New here? Create your account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
