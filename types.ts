export type NowListeningObject = {
    listening: false;
} | {
    listening: true;
    track: {
        name: string;
        artist: string;
        albumArt: {
            small: string;
            medium: string;
            large: string;
        };
        urls: {
            lastfm: string;
            spotify?: string;
        };
    };
};