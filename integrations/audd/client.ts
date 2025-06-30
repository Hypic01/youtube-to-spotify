export async function recognizeSongsFromYouTube(youtubeUrl: string) {
  const response = await fetch('/api/audd/recognize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ youtubeUrl }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to recognize songs from AudD');
  }

  const data = await response.json();
  // data.result is an array of recognized tracks (if multiple found)
  return data.result;
} 