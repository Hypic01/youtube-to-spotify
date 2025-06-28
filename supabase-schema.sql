-- Create table for storing Spotify tokens
CREATE TABLE IF NOT EXISTS user_spotify_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  spotify_user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique index to ensure one Spotify connection per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_spotify_tokens_user_id ON user_spotify_tokens(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE user_spotify_tokens ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to only access their own tokens
CREATE POLICY "Users can only access their own Spotify tokens" ON user_spotify_tokens
  FOR ALL USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_spotify_tokens_updated_at 
  BEFORE UPDATE ON user_spotify_tokens 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 