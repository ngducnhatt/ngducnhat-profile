import { NextResponse } from 'next/server';
import querystring from 'querystring';

const client_id = process.env.SPOTIFY_CLIENT_ID;
const redirect_uri = 'https://ngducnhat.vercel.app/api/spotify-auth/callback';

export async function GET() {
    const scope = 'user-read-currently-playing user-read-recently-played';
    return NextResponse.redirect(
        'https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: client_id,
            scope: scope,
            redirect_uri: redirect_uri,
        })
    );
}
