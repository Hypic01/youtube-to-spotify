export async function recognizeSongsFromYouTube(youtubeUrl: string) {
  console.log('AudD client: Making request to /api/acrcloud/recognize with URL:', youtubeUrl);
  
  // Force localhost in development
  const baseUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost' 
    ? 'http://localhost:3000' 
    : '';
  
  const response = await fetch(`${baseUrl}/api/acrcloud/recognize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ youtubeUrl }),
  });

  console.log('AudD client: Response status:', response.status);
  console.log('AudD client: Response URL:', response.url);
  
  const data = await response.json();
  console.log('AudD client: Response data:', data);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(data.message || 'No songs were recognized in this video. Try a different video with clearer music.');
    }
    
    // Show more detailed error information
    if (data.details) {
      console.error('ACRCloud API error details:', data.details);
      if (typeof data.details === 'object') {
        throw new Error(`ACRCloud API error: ${JSON.stringify(data.details)}`);
      } else {
        throw new Error(`ACRCloud API error: ${data.details}`);
      }
    }
    
    throw new Error(data.error || 'Failed to recognize songs from ACRCloud');
  }

  // data.result is an array of recognized tracks (if multiple found)
  return data.result;
} 