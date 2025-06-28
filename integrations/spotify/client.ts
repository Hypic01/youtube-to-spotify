// Spotify API Configuration
const SPOTIFY_CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
const SPOTIFY_REDIRECT_URI = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI || `${window.location.origin}/dashboard`;
const SPOTIFY_SCOPES = [
  'playlist-read-private',
  'playlist-modify-public',
  'playlist-modify-private',
  'user-read-private',
  'user-read-email'
].join(' ');

// Spotify OAuth URL
export const getSpotifyAuthUrl = () => {
  const params = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID!,
    response_type: 'code',
    redirect_uri: SPOTIFY_REDIRECT_URI,
    scope: SPOTIFY_SCOPES,
    state: Math.random().toString(36).substring(7), // Random state for security
  });

  return `https://accounts.spotify.com/authorize?${params.toString()}`;
};

// Exchange authorization code for access token
export const exchangeCodeForToken = async (code: string) => {
  try {
    const response = await fetch('/api/spotify/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    throw error;
  }
};

// Get user profile
export const getSpotifyProfile = async (accessToken: string) => {
  try {
    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get Spotify profile');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting Spotify profile:', error);
    throw error;
  }
};

// Create playlist
export const createSpotifyPlaylist = async (
  accessToken: string,
  userId: string,
  name: string,
  description: string,
  isPublic: boolean = true
) => {
  try {
    const response = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        description,
        public: isPublic,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create playlist');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating playlist:', error);
    throw error;
  }
};

// Add tracks to playlist
export const addTracksToPlaylist = async (
  accessToken: string,
  playlistId: string,
  trackUris: string[]
) => {
  try {
    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uris: trackUris,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to add tracks to playlist');
    }

    return await response.json();
  } catch (error) {
    console.error('Error adding tracks to playlist:', error);
    throw error;
  }
};

// Search for tracks
export const searchSpotifyTracks = async (
  accessToken: string,
  query: string,
  limit: number = 5
) => {
  try {
    const params = new URLSearchParams({
      q: query,
      type: 'track',
      limit: limit.toString(),
    });

    const response = await fetch(`https://api.spotify.com/v1/search?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to search tracks');
    }

    const data = await response.json();
    return data.tracks?.items || [];
  } catch (error) {
    console.error('Error searching tracks:', error);
    throw error;
  }
}; 