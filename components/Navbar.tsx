"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Music, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext"; // 너가 만든 context
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  // DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const Navbar = () => {
  const router = useRouter();
  const { user, signOut } = useAuth(); // 로그인 상태 추적

  const handleLogin = () => {
    router.push("/login");
  };

  const handleProfile = () => {
    router.push("/dashboard");
  };

  const handleLogout = async () => {
    await signOut();        // Supabase 세션 삭제 + 상태 초기화
    router.push("/");       // 홈으로 이동
  };

  return (
    <nav className="w-full fixed top-0 left-0 right-0 z-50 py-2 sm:py-3">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12 sm:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-orange-500 rounded-lg blur-sm opacity-50" />
              <div className="relative bg-white/10 backdrop-blur-sm rounded-lg p-1.5 sm:p-2 border border-white/20">
                <Music className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
            <span className="text-lg sm:text-xl font-bold text-white">YT2Spotify</span>
          </Link>

          {/* Login/Profile */}
          <div className="flex-shrink-0">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-200 cursor-pointer [&[data-state=open]]:cursor-pointer focus:outline-none focus:ring-0 focus:border-white/20 transform-none select-none">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="cursor-pointer">
                  <DropdownMenuItem onClick={handleProfile} className="cursor-pointer">Profile</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">Sign Out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="outline"
                onClick={handleLogin}
                className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-all duration-200 cursor-pointer font-bold text-sm sm:text-base px-3 sm:px-4 py-1.5 sm:py-2"
              >
                Login
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
