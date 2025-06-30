"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { getSpotifyAuthUrl, exchangeCodeForToken, getSpotifyProfile } from '@/integrations/spotify/client';
import { toast } from 'sonner';

interface SpotifyProfile {
  id: string;
  display_name: string;
  email: string;
  images?: Array<{ url: string; height: number; width: number }>;
}

interface SpotifyContextType {
  isConnected: boolean;
  spotifyProfile: SpotifyProfile | null;
  accessToken: string | null;
  connectSpotify: () => void;
  disconnectSpotify: () => Promise<void>;
  refreshSpotifyConnection: () => Promise<void>;
  loading: boolean;
}

const SpotifyContext = createContext<SpotifyContextType | undefined>(undefined);

export const useSpotify = () => {
  const context = useContext(SpotifyContext);
  if (context === undefined) {
    throw new Error('useSpotify must be used within a SpotifyProvider');
  }
  return context;
};

interface SpotifyProviderProps {
  children: ReactNode;
}

export const SpotifyProvider: React.FC<SpotifyProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [spotifyProfile, setSpotifyProfile] = useState<SpotifyProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasHandled, setHasHandled] = useState(false);

  // Check for Spotify connection on mount and when user changes
  useEffect(() => {
    if (user) {
      checkSpotifyConnection();
    } else {
      // Reset state when user logs out
      setIsConnected(false);
      setSpotifyProfile(null);
      setAccessToken(null);
    }
  }, [user]);

  // Check for authorization code in URL (after Spotify OAuth redirect)
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    if (error) {
      toast.error('Spotify connection failed. Please try again.');
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    if (code && user) {
      handleSpotifyCallback(code);
    }
  }, [user]);

  const checkSpotifyConnection = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Check if user has Spotify tokens stored in Supabase
      const { data: spotifyData, error } = await supabase
        .from('user_spotify_tokens')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error || !spotifyData) {
        setIsConnected(false);
        setSpotifyProfile(null);
        setAccessToken(null);
        return;
      }

      // Check if token is still valid by making a test API call
      try {
        const profile = await getSpotifyProfile(spotifyData.access_token);
        setSpotifyProfile(profile);
        setAccessToken(spotifyData.access_token);
        setIsConnected(true);
      } catch {
        // Token might be expired, remove it
        await supabase
          .from('user_spotify_tokens')
          .delete()
          .eq('user_id', user.id);
        
        setIsConnected(false);
        setSpotifyProfile(null);
        setAccessToken(null);
      }
    } catch (error) {
      console.error('Error checking Spotify connection:', error);
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSpotifyCallback = async (code: string) => {
    if (hasHandled) return;
    setHasHandled(true);
    if (!user) return;

    try {
      setLoading(true);

      // Exchange code for token
      const tokenData = await exchangeCodeForToken(code);
      console.log('Token data:', tokenData);

      // Get user profile
      const profile = await getSpotifyProfile(tokenData.access_token);
      console.log('Spotify profile:', profile);

      // Store tokens in Supabase
      const { error } = await supabase
        .from('user_spotify_tokens')
        .upsert({
          user_id: user.id,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
          spotify_user_id: profile.id,
        });
      if (error) {
        console.error('Supabase upsert error:', error);
        throw error;
      }

      setSpotifyProfile(profile);
      setAccessToken(tokenData.access_token);
      setIsConnected(true);

      toast.success('Spotify connected successfully!');
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
      console.error('Error handling Spotify callback:', error);
      toast.error('Failed to connect Spotify. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const connectSpotify = () => {
    const authUrl = getSpotifyAuthUrl();
    window.location.href = authUrl;
  };

  const disconnectSpotify = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Remove tokens from Supabase
      const { error } = await supabase
        .from('user_spotify_tokens')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      setIsConnected(false);
      setSpotifyProfile(null);
      setAccessToken(null);
      
      toast.success('Spotify disconnected successfully!');
    } catch (error) {
      console.error('Error disconnecting Spotify:', error);
      toast.error('Failed to disconnect Spotify. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const refreshSpotifyConnection = async () => {
    await checkSpotifyConnection();
  };

  const value: SpotifyContextType = {
    isConnected,
    spotifyProfile,
    accessToken,
    connectSpotify,
    disconnectSpotify,
    refreshSpotifyConnection,
    loading,
  };

  return (
    <SpotifyContext.Provider value={value}>
      {children}
    </SpotifyContext.Provider>
  );
}; 