import { NextRequest, NextResponse } from 'next/server';
import querystring from 'querystring';

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const redirect_uri = 'https://ngducnhat.vercel.app/api/spotify-auth/callback';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code') || null;
    const error = searchParams.get('error') || null;

    if (error) {
        return NextResponse.json({ error: `An error occurred: ${error}` }, { status: 400 });
    }

    if (code === null) {
        return NextResponse.json({ error: 'Missing code' }, { status: 400 });
    }

    const authOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization:
                'Basic ' +
                Buffer.from(client_id + ':' + client_secret).toString('base64'),
        },
        body: querystring.stringify({
            code: code,
            redirect_uri: redirect_uri,
            grant_type: 'authorization_code',
        }),
    };

    const response = await fetch('https://accounts.spotify.com/api/token', authOptions);
    const data = await response.json();

    if (data.error) {
        return NextResponse.json({ error: data.error_description }, { status: 400 });
    }

    return NextResponse.json({ refresh_token: data.refresh_token });
}
