import { NextResponse } from 'next/server';

// GET /api/test-acrcloud - Test ACRCloud credentials
export async function GET() {
  try {
    const containerId = process.env.ACR_FS_CONTAINER_ID;
    const accessToken = process.env.ACR_FS_ACCESS_TOKEN;
    const baseUrl = process.env.ACR_FS_BASE_URL || 'https://api.acrcloud.com/v1/fs';

    console.log('Testing ACRCloud credentials:', {
      hasContainerId: !!containerId,
      hasAccessToken: !!accessToken,
      baseUrl,
      containerIdLength: containerId?.length,
      accessTokenLength: accessToken?.length
    });

    if (!containerId || !accessToken) {
      return NextResponse.json({ 
        error: 'Missing credentials',
        hasContainerId: !!containerId,
        hasAccessToken: !!accessToken
      }, { status: 500 });
    }

    // Test the container access by trying to get container info
    const testUrl = `${baseUrl}/containers/${containerId}`;
    console.log('Testing container access:', testUrl);

    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    console.log('Container test response:', {
      status: response.status,
      statusText: response.statusText,
      data
    });

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      data,
      credentials: {
        hasContainerId: !!containerId,
        hasAccessToken: !!accessToken,
        baseUrl
      }
    });

  } catch (error) {
    console.error('ACRCloud test error:', error);
    return NextResponse.json({ 
      error: 'Test failed', 
      details: error?.toString() 
    }, { status: 500 });
  }
} 