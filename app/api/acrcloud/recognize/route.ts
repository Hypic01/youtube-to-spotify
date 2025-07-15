import { NextRequest, NextResponse } from 'next/server';

// POST /api/acrcloud/recognize
export async function POST(req: NextRequest) {
  try {
    const { youtubeUrl } = await req.json();
    if (!youtubeUrl) {
      return NextResponse.json({ error: 'Missing YouTube URL' }, { status: 400 });
    }

    // ACRCloud File Scanning API credentials
    const containerId = process.env.ACR_FS_CONTAINER_ID;
    const accessToken = process.env.ACR_FS_ACCESS_TOKEN;
    const baseUrl = process.env.ACR_FS_BASE_URL || 'https://api.acrcloud.com/v1/fs';

    if (!containerId || !accessToken) {
      return NextResponse.json({ error: 'Server misconfiguration: missing ACRCloud FS credentials' }, { status: 500 });
    }

    // POST the YouTube URL to the File Scanning API
    const fsRes = await fetch(`${baseUrl}/containers/${containerId}/files`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: youtubeUrl,
        platform: 'youtube',
      }),
    });

    const fsData = await fsRes.json();

    if (!fsRes.ok) {
      return NextResponse.json({ error: 'ACRCloud FS API error', details: fsData }, { status: 502 });
    }

    return NextResponse.json({ status: 'success', result: fsData });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: error?.toString() }, { status: 500 });
  }
} 