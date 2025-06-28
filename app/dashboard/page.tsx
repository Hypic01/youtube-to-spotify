"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useSpotify } from "@/contexts/SpotifyContext";
import { Music, Link as LinkIcon, CheckCircle, LogOut } from "lucide-react";

export default function DashboardPage() {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const router = useRouter();
  const { user } = useAuth();
  const { 
    isConnected, 
    spotifyProfile, 
    connectSpotify, 
    disconnectSpotify, 
    loading: spotifyLoading 
  } = useSpotify();

  useEffect(() => {
    if (user === null) {
      router.push("/login");
    }
  }, [user, router]);

  if (!user) return null; // 로딩 중

  const handleSpotifyConnect = () => {
    connectSpotify();
  };

  const handleSpotifyDisconnect = async () => {
    await disconnectSpotify();
  };

  const handleConvert = () => {
    if (!youtubeUrl) {
      alert("⚠️ Please enter a YouTube playlist URL");
      return;
    }

    if (!isConnected) {
      alert("⚠️ Please connect your Spotify account first");
      return;
    }

    alert("✅ YouTube to Spotify conversion coming soon!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 pt-16 sm:pt-20 lg:pt-[80px]">
      
      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-2xl mx-auto">
          {/* Spotify Connection */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-white/20 mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Connect Your Accounts</h2>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 gap-4 sm:gap-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <Music className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm sm:text-base">Spotify</h3>
                  <p className="text-gray-400 text-xs sm:text-sm">
                    {isConnected ? `Connected as ${spotifyProfile?.display_name || 'User'}` : "Not connected"}
                  </p>
                </div>
              </div>

              {isConnected ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-xs sm:text-sm font-medium">Connected</span>
                  </div>
                  <Button
                    onClick={handleSpotifyDisconnect}
                    disabled={spotifyLoading}
                    variant="outline"
                    size="sm"
                    className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                  >
                    <LogOut className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    Disconnect
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={handleSpotifyConnect}
                  disabled={spotifyLoading}
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3"
                >
                  <LinkIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  {spotifyLoading ? "Connecting..." : "Connect"}
                </Button>
              )}
            </div>
          </div>

          {/* YouTube → Spotify Section */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-white/20">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Convert Playlist</h2>
            <p className="text-sm sm:text-base text-gray-300 mb-6">
              Paste your YouTube playlist URL below to convert it to a Spotify playlist.
            </p>

            <div className="space-y-4">
              <Input
                type="url"
                placeholder="https://www.youtube.com/playlist?list=..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400 rounded-xl py-3 text-sm sm:text-base"
              />

              <Button
                onClick={handleConvert}
                disabled={!isConnected}
                className="w-full bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-700 hover:to-orange-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 hover:scale-105 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Convert to Spotify Playlist
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
