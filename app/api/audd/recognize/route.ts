import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { youtubeUrl } = await req.json();
    if (!youtubeUrl) {
      return NextResponse.json({ error: 'Missing YouTube URL' }, { status: 400 });
    }

    console.log('AudD API called with URL:', youtubeUrl);

    const apiKey = process.env.AUDD_API_KEY;
    if (!apiKey) {
      console.error('Missing AudD API key');
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
    console.log('AudD API response:', JSON.stringify(auddData, null, 2));

    if (!auddRes.ok) {
      console.error('AudD API error:', auddData);
      return NextResponse.json({ error: 'AudD API error', details: auddData }, { status: 502 });
    }

    // Check if AudD returned any results
    if (!auddData.result || auddData.result.length === 0) {
      console.log('No songs recognized by AudD');
      return NextResponse.json({ 
        error: 'No songs recognized', 
        details: auddData,
        message: 'AudD could not identify any songs in this video. This might be because the video contains no music, the audio quality is poor, or the content is not supported.'
      }, { status: 404 });
    }

    console.log(`AudD recognized ${auddData.result.length} songs`);
    return NextResponse.json(auddData);
  } catch (error) {
    console.error('Error in /api/audd/recognize:', error);
    return NextResponse.json({ error: 'Internal server error', details: error?.toString() }, { status: 500 });
  }
} 