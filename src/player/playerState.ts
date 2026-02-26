import { SpotifyClient } from '../api/spotifyClient';
import { getAccessToken } from '../auth/authProvider.js';

export interface CurrentTrackInfo {
	name: string;
	artist: string;
	albumArtUrl: string;
	isPlaying?: boolean;
	isDeviceAvailable?: boolean;
}

export interface QueueInfo {
	currently_playing: {
		title: string;
		artist: string;
		albumArtUrl: string;
		isPlaying?: boolean;
		context_uri: string;
	};
	queue: {
		title: string;			
		artist: string;
		albumArtUrl: string;
		context_uri: string;
	}[];
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

export async function getQueueInfo(): Promise<QueueInfo | null> {

	const token = getAccessToken();
	const queue = await SpotifyClient.getUserQueue(token);

	if (!queue || !queue.currently_playing || !queue.queue){ 
		return null;
	}

	const currently_playing = {
		title: queue.currently_playing.album.name,
		artist: queue.currently_playing.artists.map(a => a.name).join(', '),
		albumArtUrl: queue.currently_playing.album.images[0]?.url || '',
		isPlaying: true,
		context_uri: queue.currently_playing.album.url
	};

	const queueItems = queue.queue.map(item => ({
		title: item.album.name,
		artist: item.artists.map(a => a.name).join(', '),
		albumArtUrl: item.album.images[0]?.url || '',
		context_uri: item.album.url
	}));

	return { currently_playing, queue: queueItems };
}