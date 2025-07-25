"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useSpotify } from "@/contexts/SpotifyContext";
import { Music, Link as LinkIcon, CheckCircle, LogOut, Play, X } from "lucide-react";
import { toast } from "sonner";
import { searchSpotifyTracks, createSpotifyPlaylist, addTracksToPlaylist } from "@/integrations/spotify/client";
import { recognizeSongsFromYouTube } from "@/integrations/audd/client";
import { supabase } from "@/integrations/supabase/client";

type RecognizedSong = {
  title: string;
  artist: string;
  spotifyUri?: string;
  found: boolean;
};

type ProgressStep = 'idle' | 'recognizing' | 'searching' | 'creating' | 'preview';

export default function DashboardPage() {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [converting, setConverting] = useState(false);
  const [recognizedSongs, setRecognizedSongs] = useState<RecognizedSong[]>([]);
  const [progressStep, setProgressStep] = useState<ProgressStep>('idle');
  const router = useRouter();
  const { user } = useAuth();
  const {
    isConnected,
    spotifyProfile,
    accessToken,
    connectSpotify,
    disconnectSpotify,
    loading: spotifyLoading,
  } = useSpotify();
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    if (user === null) {
      router.push("/login");
    }
  }, [user, router]);

  useEffect(() => {
    const fetchCredits = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from("profiles")
        .select("credits")
        .eq("id", user.id)
        .single();
      if (error) {
        setCredits(null);
      } else {
        setCredits(data.credits);
      }
    };
    fetchCredits();
  }, [user]);

  if (!user) return null; // 로딩 중

  const handleSpotifyConnect = () => {
    connectSpotify();
  };

  const handleSpotifyDisconnect = async () => {
    await disconnectSpotify();
  };

  const handleConvert = async () => {
    if (!youtubeUrl) {
      toast.error("⚠️ Please enter a YouTube link");
      return;
    }
    if (!isConnected || !accessToken || !spotifyProfile) {
      toast.error("⚠️ Please connect your Spotify account first");
      return;
    }

    console.log('Starting conversion with URL:', youtubeUrl);
    setConverting(true);
    setProgressStep('recognizing');
    setRecognizedSongs([]);

    try {
      // 1. Recognize songs from YouTube using AudD
      console.log('Calling AudD API...');
      const auddResults = await recognizeSongsFromYouTube(youtubeUrl);
      console.log('AudD results:', auddResults);
      
      if (!auddResults || auddResults.length === 0) {
        toast.error("Could not recognize any songs in this video.");
        setConverting(false);
        setProgressStep('idle');
        return;
      }

      // 2. For each recognized song, search on Spotify
      setProgressStep('searching');
      const songsWithSpotify: RecognizedSong[] = [];
      
      for (const result of auddResults) {
        const query = result.title && result.artist ? `${result.title} ${result.artist}` : result.title;
        if (!query) continue;
        
        const tracks = await searchSpotifyTracks(accessToken, query, 1);
        const found = tracks && tracks.length > 0;
        
        songsWithSpotify.push({
          title: result.title || 'Unknown Title',
          artist: result.artist || 'Unknown Artist',
          spotifyUri: found ? tracks[0].uri : undefined,
          found
        });
      }

      if (songsWithSpotify.length === 0) {
        toast.error("Could not find any recognized songs on Spotify.");
        setConverting(false);
        setProgressStep('idle');
        return;
      }

      // 3. Show preview of recognized songs
      setRecognizedSongs(songsWithSpotify);
      setProgressStep('preview');
      setConverting(false);

    } catch (error) {
      console.error('Error during recognition:', error);
      toast.error("Something went wrong during song recognition.");
      setConverting(false);
      setProgressStep('idle');
    }
  };

  const handleCreatePlaylist = async () => {
    if (!accessToken || !spotifyProfile) return;

    setConverting(true);
    setProgressStep('creating');

    try {
      const foundTracks = recognizedSongs
        .filter(song => song.found)
        .map(song => song.spotifyUri!)
        .filter(Boolean);

      if (foundTracks.length === 0) {
        toast.error("No songs found to add to playlist.");
        setConverting(false);
        setProgressStep('idle');
        return;
      }

      // Create a new playlist
      const playlistName = `YT2Spotify: ${recognizedSongs[0].title || "Playlist"}`;
      const playlist = await createSpotifyPlaylist(
        accessToken,
        spotifyProfile.id,
        playlistName,
        `Created from YouTube: ${youtubeUrl}`
      );

      // Add all found tracks to the playlist
      await addTracksToPlaylist(accessToken, playlist.id, foundTracks);
      
      toast.success(`Playlist created! Added ${foundTracks.length} song(s).`);
      setYoutubeUrl("");
      setRecognizedSongs([]);
      setProgressStep('idle');
    } catch (error) {
      console.error('Error creating playlist:', error);
      toast.error("Something went wrong during playlist creation.");
      setConverting(false);
      setProgressStep('idle');
    } finally {
      setConverting(false);
    }
  };

  const handleCancelPreview = () => {
    setRecognizedSongs([]);
    setProgressStep('idle');
    setConverting(false);
  };

  const getProgressText = () => {
    switch (progressStep) {
      case 'recognizing': return 'Recognizing songs from YouTube...';
      case 'searching': return 'Searching for songs on Spotify...';
      case 'creating': return 'Creating playlist...';
      default: return '';
    }
  };

  const getProgressColor = () => {
    switch (progressStep) {
      case 'recognizing': return 'text-blue-400';
      case 'searching': return 'text-green-400';
      case 'creating': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 pt-16 sm:pt-20 lg:pt-[80px]">
      {/* Credits Display */}
      <div className="w-full flex justify-center mt-8 mb-4">
        <div className="bg-white/20 text-white font-bold rounded-xl px-6 py-3 text-lg shadow-lg border border-white/30">
          {credits !== null
            ? `Free conversions left this week: ${credits}/3`
            : "Loading credits..."}
        </div>
      </div>
      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-2xl mx-auto">
          {/* Spotify Connection */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-white/20 mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Connect Your Accounts</h2>
            <div className="flex flex-row items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 gap-4">
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
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3 cursor-pointer"
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
              Paste your YouTube link below to convert it to a Spotify playlist.
            </p>
            
            {/* Progress Indicator */}
            {progressStep !== 'idle' && progressStep !== 'preview' && (
              <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span className={`text-sm font-medium ${getProgressColor()}`}>
                    {getProgressText()}
                  </span>
                </div>
              </div>
            )}

            {/* Song Preview */}
            {progressStep === 'preview' && recognizedSongs.length > 0 && (
              <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
                <h3 className="text-white font-semibold mb-3">Recognized Songs ({recognizedSongs.filter(s => s.found).length} found)</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {recognizedSongs.map((song, index) => (
                    <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${
                      song.found ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'
                    }`}>
                      <div className="flex items-center gap-3">
                        {song.found ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <X className="w-4 h-4 text-red-400" />
                        )}
                        <div>
                          <p className="text-white font-medium text-sm">{song.title}</p>
                          <p className="text-gray-400 text-xs">{song.artist}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-medium ${
                        song.found ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {song.found ? 'Found' : 'Not found'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <Input
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                disabled={converting || progressStep === 'preview'}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400 rounded-xl py-3 text-sm sm:text-base disabled:opacity-50"
              />

              {progressStep === 'preview' ? (
                <div className="flex gap-3">
                  <Button
                    onClick={handleCreatePlaylist}
                    disabled={converting}
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 rounded-xl transition-all duration-300 hover:scale-105 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {converting ? "Creating..." : "Create Playlist"}
                  </Button>
                  <Button
                    onClick={handleCancelPreview}
                    disabled={converting}
                    variant="outline"
                    className="px-6 border-white/20 text-white hover:bg-white/10"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
              <Button
                onClick={handleConvert}
                  disabled={!isConnected || converting}
                  className="w-full bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-700 hover:to-orange-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 hover:scale-105 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                  {converting ? "Converting..." : "Convert to Spotify Playlist"}
              </Button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
