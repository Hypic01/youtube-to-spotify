import { NextRequest, NextResponse } from 'next/server';

interface ACRCloudArtist {
  name?: string;
}
interface ACRCloudAlbum {
  name?: string;
}
interface ACRCloudExternalIds {
  spotify?: { track_id?: string };
}
interface ACRCloudTrack {
  title?: string;
  artists?: ACRCloudArtist[];
  album?: ACRCloudAlbum;
  release_date?: string;
  external_ids?: ACRCloudExternalIds;
}

export async function POST(req: NextRequest) {
  console.log('ACRCloud recognize API route hit');
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

    // Prepare form data for ACRCloud
    const formData = new URLSearchParams();
    formData.append('url', youtubeUrl);
    formData.append('data_type', 'url');
    formData.append('signature_version', '1');
    formData.append('access_key', accessKey);
    formData.append('timestamp', Math.floor(Date.now() / 1000).toString());
    // If signature is required, add: formData.append('signature', signature);

    // ACRCloud API call
    const acrRes = await fetch(`https://${host}/v1/identify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
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
    const musicResults = Array.isArray(acrData.metadata.music)
      ? (acrData.metadata.music as ACRCloudTrack[]).map((track) => ({
          title: track.title || 'Unknown Title',
          artist:
            (track.artists && track.artists[0] && track.artists[0].name) ||
            'Unknown Artist',
          album: track.album?.name,
          release_date: track.release_date,
          spotify: track.external_ids?.spotify?.track_id
            ? { uri: `spotify:track:${track.external_ids.spotify.track_id}` }
            : undefined,
        }))
      : [];

    console.log(`ACRCloud recognized ${musicResults.length} songs`);
    return NextResponse.json({
      status: 'success',
      result: musicResults
    });
  } catch (error) {
    console.error('Error in /api/acrcloud/recognize:', error);
    return NextResponse.json({ error: 'Internal server error', details: error?.toString() }, { status: 500 });
  }
  // Fallback: always return JSON
  return NextResponse.json({ error: 'Unknown error: no response returned' }, { status: 500 });
} 