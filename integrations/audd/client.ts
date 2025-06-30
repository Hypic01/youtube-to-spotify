const AUDD_API_KEY = process.env.AUDD_API_KEY;

export async function recognizeSongsFromYouTube(youtubeUrl: string) {
  if (!AUDD_API_KEY) throw new Error('Missing AudD API key');

  const formData = new URLSearchParams();
  formData.append('api_token', AUDD_API_KEY);
  formData.append('url', youtubeUrl);
  formData.append('return', 'timecode,apple_music,spotify');

  const response = await fetch('https://api.audd.io/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
  });

  if (!response.ok) {
    throw new Error('Failed to recognize songs from AudD');
  }

  const data = await response.json();
  // data.result is an array of recognized tracks (if multiple found)
  return data.result;
} 