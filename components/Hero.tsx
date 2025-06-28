"use client";

import { ArrowRight, Music, Play, List, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  const handleGetStarted = () => {
    if (user) {
      // If logged in, go to dashboard
      router.push("/dashboard");
    } else {
      // If not logged in, go to login page
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 sm:pt-20 lg:pt-24">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-orange-600/20" />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 text-center">
          <div className="animate-fade-in">
            <div className="flex justify-center mb-6 sm:mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-orange-500 rounded-full blur-xl opacity-50 animate-pulse" />
                <div className="relative bg-white/10 backdrop-blur-sm rounded-full p-4 sm:p-6 border border-white/20">
                  <Music className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
                </div>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 leading-tight px-2">
              Turn any <span className="bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">YouTube</span> video into a<br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">Spotify</span> playlist
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-4 sm:mb-6 max-w-2xl sm:max-w-3xl mx-auto leading-relaxed px-4">
              Paste a YouTube link. <br /> We&apos;ll find every song and build a Spotify playlist for you.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6 sm:mb-8 w-full max-w-xl mx-auto px-4">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-700 hover:to-orange-700 text-white px-6 sm:px-8 py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105 text-base sm:text-lg cursor-pointer"
                onClick={handleGetStarted}
              >
                {user ? "Build My Playlist" : "Start now"} <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>

            <p className="text-xs sm:text-sm text-gray-400 mb-8 sm:mb-10 px-4">Join 2,847 music lovers who converted their playlists this week</p>

            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 sm:gap-6 text-white/80 px-4">
              <div className="flex items-center justify-center gap-2">
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                <span className="text-sm sm:text-base">Always free</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Play className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                <span className="text-sm sm:text-base">Convert in few minutes</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <List className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                <span className="text-sm sm:text-base">Keep your playlists</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-12 sm:py-16 lg:py-20 bg-white/5 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">
              How It Works
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto px-4">
              Three simple steps to bring your music everywhere
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {[
              {
                step: "1",
                title: "Paste YouTube link",
                color: "from-red-500 to-red-600",
                desc: "Paste any YouTube video link. We'll instantly find the music inside.",
              },
              {
                step: "2",
                title: "Review & Edit",
                color: "from-purple-500 to-purple-600",
                desc: "Check the song matches and make any tweaks. Perfect your playlist before we create it.",
              },
              {
                step: "3",
                title: "Sync to Spotify",
                color: "from-green-500 to-green-600",
                desc: "Connect your Spotify account and we will create your new playlist in one click.",
              },
            ].map((item, i) => (
              <Card
                key={i}
                className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105"
              >
                <CardContent className="p-6 sm:p-8 text-center">
                  <div
                    className={`bg-gradient-to-r ${item.color} rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-4 sm:mb-6`}
                  >
                    <span className="text-xl sm:text-2xl font-bold text-white">{item.step}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-white mb-3 sm:mb-4">{item.title}</h3>
                  <p className="text-sm sm:text-base text-gray-300 leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 px-4">
              Save hours. Build playlists instantly.
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 mb-6 sm:mb-8 px-4">
              No more Googling tracklists or guessing song names. We find them for you — fast.
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-700 hover:to-orange-700 text-white px-8 sm:px-12 py-3 sm:py-4 rounded-full font-semibold text-base sm:text-lg transition-all duration-300 hover:scale-105 cursor-pointer"
              onClick={handleGetStarted}
            >
              {user ? "Go to Dashboard" : "Make My first Spotify Playlist"} <ArrowRight className="ml-2 sm:ml-3 w-4 h-4 sm:w-6 sm:h-6" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 sm:py-8 border-t border-white/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm sm:text-base text-gray-400">
            Made with <Heart className="inline w-3 h-3 sm:w-4 sm:h-4 text-red-400 mx-1" /> for music lovers everywhere
          </p>
        </div>
      </footer>
    </div>
  );
}
