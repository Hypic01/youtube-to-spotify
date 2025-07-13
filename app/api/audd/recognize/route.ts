import { NextRequest, NextResponse } from 'next/server';

interface ACRCloudTrack {
  title?: string;
  artists?: { name?: string }[];
  album?: { name?: string };
  release_date?: string;
  external_ids?: { spotify?: { track_id?: string } };
}

export async function POST(req: NextRequest) {
  try {
    const { youtubeUrl } = await req.json();
    if (!youtubeUrl) {
      return NextResponse.json({ error: 'Missing YouTube URL' }, { status: 400 });
    }

    console.log('ACRCloud API called with URL:', youtubeUrl);

    // ACRCloud credentials - you'll need to get these from ACRCloud
    const accessKey = process.env.ACRCLOUD_ACCESS_KEY;
    const accessSecret = process.env.ACRCLOUD_ACCESS_SECRET;
    const host = process.env.ACRCLOUD_HOST || 'identify-eu-west-1.acrcloud.com';

    if (!accessKey || !accessSecret) {
      console.error('Missing ACRCloud credentials');
      return NextResponse.json({ error: 'Server misconfiguration: missing ACRCloud credentials' }, { status: 500 });
    }

    // ACRCloud API call
    const acrRes = await fetch(`https://${host}/v1/identify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access-key': accessKey,
        'access-secret': accessSecret,
      },
      body: JSON.stringify({
        url: youtubeUrl,
        data_type: 'url',
        signature_version: '1',
        timestamp: Math.floor(Date.now() / 1000)
      }),
    });

    const acrData = await acrRes.json();
    console.log('ACRCloud API response:', JSON.stringify(acrData, null, 2));

    if (!acrRes.ok) {
      console.error('ACRCloud API error:', acrData);
      return NextResponse.json({ error: 'ACRCloud API error', details: acrData }, { status: 502 });
    }

    // Check if ACRCloud returned any results
    if (!acrData.status || acrData.status.code !== 0 || !acrData.metadata || !acrData.metadata.music) {
      console.log('No songs recognized by ACRCloud');
      return NextResponse.json({ 
        error: 'No songs recognized', 
        details: acrData,
        message: 'ACRCloud could not identify any songs in this video. This might be because the video contains no music, the audio quality is poor, or the content is not supported.'
      }, { status: 404 });
    }

    // Convert ACRCloud response to our expected format
    const musicResults = (acrData.metadata.music as ACRCloudTrack[]).map((track) => ({
      title: track.title || 'Unknown Title',
      artist: track.artists?.[0]?.name || (typeof track.artists?.[0] === 'string' ? track.artists[0] : 'Unknown Artist'),
      album: track.album?.name,
      release_date: track.release_date,
      spotify: track.external_ids?.spotify?.track_id
        ? { uri: `spotify:track:${track.external_ids.spotify.track_id}` }
        : undefined,
    }));

    console.log(`ACRCloud recognized ${musicResults.length} songs`);
    return NextResponse.json({
      status: 'success',
      result: musicResults
    });
  } catch (error) {
    console.error('Error in /api/audd/recognize:', error);
    return NextResponse.json({ error: 'Internal server error', details: error?.toString() }, { status: 500 });
  }
} 