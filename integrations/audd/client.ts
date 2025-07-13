export async function recognizeSongsFromYouTube(youtubeUrl: string) {
  console.log('AudD client: Making request to /api/audd/recognize with URL:', youtubeUrl);
  
  // Force localhost in development
  const baseUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost' 
    ? 'http://localhost:3000' 
    : '';
  
  const response = await fetch(`${baseUrl}/api/audd/recognize`, {
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
    throw new Error(data.error || 'Failed to recognize songs from AudD');
  }

  // data.result is an array of recognized tracks (if multiple found)
  return data.result;
} 