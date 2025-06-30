import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { youtubeUrl } = await req.json();
    if (!youtubeUrl) {
      return NextResponse.json({ error: 'Missing YouTube URL' }, { status: 400 });
    }

    const apiKey = process.env.AUDD_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Server misconfiguration: missing AudD API key' }, { status: 500 });
    }

    // Call AudD API with YouTube link
    const auddRes = await fetch('https://api.audd.io/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_token: apiKey,
        url: youtubeUrl,
        return: 'apple_music,spotify',
      }),
    });

    const auddData = await auddRes.json();
    if (!auddRes.ok) {
      console.error('AudD API error:', auddData);
      return NextResponse.json({ error: 'AudD API error', details: auddData }, { status: 502 });
    }

    return NextResponse.json(auddData);
  } catch (error) {
    console.error('Error in /api/audd/recognize:', error);
    return NextResponse.json({ error: 'Internal server error', details: error?.toString() }, { status: 500 });
  }
} 