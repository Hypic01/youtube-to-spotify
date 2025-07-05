export async function recognizeSongsFromYouTube(youtubeUrl: string) {
  const response = await fetch('/api/audd/recognize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ youtubeUrl }),
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(data.message || 'No songs were recognized in this video. Try a different video with clearer music.');
    }
    throw new Error(data.error || 'Failed to recognize songs from AudD');
  }

  // data.result is an array of recognized tracks (if multiple found)
  return data.result;
} 