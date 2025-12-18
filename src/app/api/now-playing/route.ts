import { NextRequest, NextResponse } from 'next/server';
import querystring from 'querystring';

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const refresh_token = process.env.SPOTIFY_REFRESH_TOKEN;

const getAccessToken = async () => {
    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            Authorization: `Basic ${Buffer.from(`${client_id}:${client_secret}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: querystring.stringify({
            grant_type: 'refresh_token',
            refresh_token,
        }),
    });

    return response.json();
};

const getNowPlaying = async () => {
    const { access_token } = await getAccessToken();

    return fetch('https://api.spotify.com/v1/me/player/currently-playing', {
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
    });
};

const getRecentlyPlayed = async () => {
    const { access_token } = await getAccessToken();

    return fetch('https://api.spotify.com/v1/me/player/recently-played?limit=1', {
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
    });
};

export async function GET(req: NextRequest) {
    const response = await getNowPlaying();

    if (response.status === 204 || response.status > 400) {
        // No song currently playing, try to get the last played song
        const recentlyPlayedResponse = await getRecentlyPlayed();
        if (recentlyPlayedResponse.status === 200) {
            const data = await recentlyPlayedResponse.json();
            if (data.items && data.items.length > 0) {
                const track = data.items[0].track;
                return NextResponse.json({
                    isPlaying: false,
                    title: track.name,
                    artist: track.artists.map((_artist: any) => _artist.name).join(', '),
                    album: track.album.name,
                    albumImageUrl: track.album.images[0].url,
                    songUrl: track.external_urls.spotify,
                    uri: track.uri,
                });
            }
        }
        return NextResponse.json({ isPlaying: false });
    }

    const song = await response.json();

    if (song.item) {
        return NextResponse.json({
            isPlaying: song.is_playing,
            title: song.item.name,
            artist: song.item.artists.map((_artist: any) => _artist.name).join(', '),
            album: song.item.album.name,
            albumImageUrl: song.item.album.images[0].url,
            songUrl: song.item.external_urls.spotify,
            uri: song.item.uri,
        });
    }

    return NextResponse.json({ isPlaying: false });
}
