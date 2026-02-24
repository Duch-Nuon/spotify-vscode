import { SpotifyClient } from '../api/spotifyClient';
import { getAccessToken } from '../auth/authProvider.js';

export interface CurrentTrackInfo {
	name: string;
	artist: string;
	albumArtUrl: string;
	isPlaying?: boolean;
	isDeviceAvailable?: boolean;
}

export async function getCurrentTrackInfo(): Promise<CurrentTrackInfo | null> {
	const token = getAccessToken();
	const playback = await SpotifyClient.getPlayBackState(token);

	if (!playback || !playback.item){
        return null;
    } 

	const name = playback.item.name;
	const artist = playback.item.artists.map(a => a.name).join(', ');
	const albumArtUrl = playback.item.album.images[0]?.url || '';
	const isPlaying = playback.is_playing;
	const isDeviceAvailable = playback.device.is_active;

	return { name, artist, albumArtUrl, isPlaying, isDeviceAvailable };
}