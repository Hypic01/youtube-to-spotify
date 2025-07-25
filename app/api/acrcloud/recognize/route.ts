import { NextRequest, NextResponse } from 'next/server';

// POST /api/acrcloud/recognize
export async function POST(req: NextRequest) {
  try {
    const { youtubeUrl } = await req.json();
    if (!youtubeUrl) {
      return NextResponse.json({ error: 'Missing YouTube URL' }, { status: 400 });
    }

    console.log('ACRCloud recognize API route hit');
    console.log('YouTube URL:', youtubeUrl);

    // ACRCloud File Scanning API credentials
    const containerId = process.env.ACR_FS_CONTAINER_ID;
    const accessToken = process.env.ACR_FS_ACCESS_TOKEN;
    const baseUrl = process.env.ACR_FS_BASE_URL || 'https://api.acrcloud.com/v1/fs';

    console.log('ACRCloud credentials check:', {
      hasContainerId: !!containerId,
      hasAccessToken: !!accessToken,
      baseUrl
    });

    if (!containerId || !accessToken) {
      return NextResponse.json({ error: 'Server misconfiguration: missing ACRCloud FS credentials' }, { status: 500 });
    }

    // POST the YouTube URL to the File Scanning API
    // Try the correct endpoint format: /api/fs-containers/:id/files
    const requestBody = {
      url: youtubeUrl,
      platform: 'youtube',
    };

    const apiUrl = `${baseUrl}/containers/${containerId}/files`;
    console.log('Making ACRCloud FS API request:', {
      url: apiUrl,
      body: requestBody
    });

    const fsRes = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const fsData = await fsRes.json();
    console.log('ACRCloud FS API response:', {
      status: fsRes.status,
      statusText: fsRes.statusText,
      data: fsData
    });

    if (!fsRes.ok) {
      // If 404, try alternative endpoint format
      if (fsRes.status === 404) {
        console.log('Trying alternative ACRCloud endpoint format...');
        
        // Try alternative endpoint: /api/fs-containers/:id/files
        const altApiUrl = `${baseUrl.replace('/v1/fs', '')}/api/fs-containers/${containerId}/files`;
        console.log('Trying alternative URL:', altApiUrl);
        
        const altFsRes = await fetch(altApiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        const altFsData = await altFsRes.json();
        console.log('Alternative ACRCloud FS API response:', {
          status: altFsRes.status,
          statusText: altFsRes.statusText,
          data: altFsData
        });

        if (!altFsRes.ok) {
          return NextResponse.json({ 
            error: 'ACRCloud FS API error', 
            details: altFsData,
            status: altFsRes.status,
            statusText: altFsRes.statusText,
            triedUrls: [apiUrl, altApiUrl]
          }, { status: 502 });
        }

        return NextResponse.json({ status: 'success', result: altFsData });
      }

      return NextResponse.json({ 
        error: 'ACRCloud FS API error', 
        details: fsData,
        status: fsRes.status,
        statusText: fsRes.statusText
      }, { status: 502 });
    }

    return NextResponse.json({ status: 'success', result: fsData });
  } catch (error) {
    console.error('ACRCloud recognize API error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error?.toString() }, { status: 500 });
  }
} 