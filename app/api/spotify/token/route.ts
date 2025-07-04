import { NextRequest, NextResponse } from 'next/server';

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:3000/dashboard';

export async function POST(request: NextRequest) {
  try {
    // Validate environment variables
    if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
      console.error('Missing Spotify environment variables:', {
        hasClientId: !!SPOTIFY_CLIENT_ID,
        hasClientSecret: !!SPOTIFY_CLIENT_SECRET,
        redirectUri: SPOTIFY_REDIRECT_URI
      });
      return NextResponse.json(
        { error: 'Spotify configuration is missing' },
        { status: 500 }
      );
    }

    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code is required' },
        { status: 400 }
      );
    }

    console.log('Attempting to exchange code for token with:', {
      redirectUri: SPOTIFY_REDIRECT_URI,
      hasCode: !!code
    });

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(
          `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
        ).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: SPOTIFY_REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Spotify token exchange error:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        errorData
      });
      return NextResponse.json(
        { error: `Failed to exchange authorization code for token: ${errorData}` },
        { status: 400 }
      );
    }

    const tokenData = await tokenResponse.json();
    console.log('Successfully exchanged code for token');

    return NextResponse.json({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in,
      token_type: tokenData.token_type,
    });
  } catch (error) {
    console.error('Error in Spotify token exchange:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 