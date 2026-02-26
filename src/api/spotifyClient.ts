interface SpotifyPlaybackState {
    device: {
        id: string;
        name: string;
        type: string;
        is_active: boolean;
        volume_percent: number;
    };
    is_playing: boolean;
    shuffle_state: boolean;
    repeat_state: string;
    progress_ms: number;
    item: {
        id: string;
        name: string;
        duration_ms: number;
        album: {
            name: string;
            images: { url: string; height: number; width: number }[];
        };
        artists: { id: string; name: string }[];
    } | null;
}

export interface SpotifyUserQueueItem {
    
    currently_playing: {
        album: {
            name: string;
            images: { url: string; height: number; width: number }[];
            url: string;
        },
        artists: { id: string; name: string }[];
    },
    queue: [
            {
            album: {
                name: string;
                images: { url: string; height: number; width: number }[];
                url: string;
            },
            artists: { id: string; name: string }[];
            }
        ];
}

export class SpotifyClient {

    static async getPlayBackState(token: Promise<string | null>): Promise<SpotifyPlaybackState | null> {

        const resolvedToken = await token;

        if (!resolvedToken) {
            return null;
        }

        try {

            const response = await fetch('https://api.spotify.com/v1/me/player', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${resolvedToken}` }
            });

            if (response.status === 204) {
                // No active playback
                return null;
            }
            if (!response.ok) {
                throw new Error(`Spotify API error: ${response.status} ${await response.text()}`);
            }

            const data = await response.json() as SpotifyPlaybackState;
            return data;

        } catch (error) {
            console.error('Error fetching playback state:', error);
            return null;
        }
    }

    static async getAvailableDevices(token: Promise<string | null>): Promise<{ id: string; name: string }[]> {

        const resolvedToken = await token;

        if (!resolvedToken) {
            return [];
        }

        try {

            const response = await fetch('https://api.spotify.com/v1/me/player/devices', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${resolvedToken}` }
            });

            if (!response.ok) {
                throw new Error(`Spotify API error: ${response.status} ${await response.text()}`);
            }

            const data = await response.json() as { devices: { id: string; name: string }[] };
            return data.devices;

        } catch (error) {
            console.error('Error fetching available devices:', error);
            return [];
        }
    }

    static async skipToNext(token: Promise<string | null>): Promise<boolean> {

        const resolvedToken = await token;

        if (!resolvedToken) {
            return false;
        }

        try {

            const response = await fetch('https://api.spotify.com/v1/me/player/next', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${resolvedToken}` }
            });

            if (!response.ok) {
                throw new Error(`Spotify API error: ${response.status}` + ` ${await response.text()}`);
            }

            return true;

        } catch (error) {
            console.error('Error skipping to next track:', error);
            return false;
        }
    }

    static async skipToPrevious(token: Promise<string | null>): Promise<boolean> {

        const resolvedToken = await token;

        if (!resolvedToken) {
            return false;
        }

        try {

            const response = await fetch('https://api.spotify.com/v1/me/player/previous', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${resolvedToken}` }
            });

            if (!response.ok) {
                throw new Error(`Spotify API error: ${response.status}` + ` ${await response.text()}`);
            }

            return true;

        } catch (error) {
            console.error('Error skipping to previous track:', error);
            return false;
        }
    }

    static async togglePlayPause(token: Promise<string | null>, isPlaying: boolean): Promise<boolean> {

        const resolvedToken = await token;

        if (!resolvedToken) {
            return false;
        }

        try {

            const endpoint = isPlaying ? 'pause' : 'play';
            const response = await fetch(`https://api.spotify.com/v1/me/player/${endpoint}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${resolvedToken}` }
            });

            if (!response.ok) {
                throw new Error(`Spotify API error: ${response.status}` + ` ${await response.text()}`);
            }

            return true;

        } catch (error) {
            console.error('Error toggling play/pause:', error);
            return false;
        }
    }

    static async getUserQueue(token: Promise<string | null>): Promise<SpotifyUserQueueItem | null> {    
        const resolvedToken = await token;

        if (!resolvedToken) {
            return null;
        }

        try {

            const response = await fetch('https://api.spotify.com/v1/me/player/queue', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${resolvedToken}` }
            });

            if (!response.ok) {
                throw new Error(`Spotify API error: ${response.status}` + ` ${await response.text()}`);
            }

            const data = await response.json() as SpotifyUserQueueItem;
            return data;

        } catch (error) {
            console.error('Error fetching user queue:', error);
            return null;
        }

    }

    static async playNextInQueue(token: Promise<string | null>, trackUri: string): Promise<boolean> {
        const resolvedToken = await token;

        if (!resolvedToken) {
            return false;
        }

        try {

            const response = await fetch('https://api.spotify.com/v1/me/player/play', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${resolvedToken}` },
                body: JSON.stringify({ context_uri: trackUri })
            });

            if (!response.ok) {
                throw new Error(`Spotify API error: ${response.status}` + ` ${await response.text()}`);
            }

            return true;

        } catch (error) {
            console.error('Error playing track:', error);
            return false;
        }
    }
}