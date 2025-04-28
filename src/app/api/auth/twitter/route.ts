import { NextResponse } from 'next/server';
import crypto from 'crypto';

function generateCodeVerifier() {
  const verifier = crypto.randomBytes(32).toString('base64url');
  return verifier.replace(/[^a-zA-Z0-9]/g, '').substring(0, 43);
}

function generateCodeChallenge(verifier: string) {
  const challenge = crypto
    .createHash('sha256')
    .update(verifier)
    .digest('base64url');
  return challenge.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

export async function POST(request: Request) {
  try {
    // Add debug logging for environment variables
    console.log('Twitter auth environment variables check:', {
      hasClientId: !!process.env.TWITTER_CLIENT_ID,
      hasClientSecret: !!process.env.TWITTER_CLIENT_SECRET,
      appUrl: process.env.NEXT_PUBLIC_APP_URL
    });

    // Get the base URL with a fallback
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nexura-eight.vercel.app';
    
    // Make sure the baseUrl doesn't end with a trailing slash
    const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    
    // Ensure we have the required environment variables
    if (!process.env.TWITTER_CLIENT_ID) {
      throw new Error('Missing TWITTER_CLIENT_ID environment variable');
    }

    // Extract user ID from request headers
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Generate code verifier and challenge
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    // Construct the authorization URL with explicit values
    const authUrl = new URL('https://twitter.com/i/oauth2/authorize');
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('client_id', process.env.TWITTER_CLIENT_ID);
    authUrl.searchParams.append('redirect_uri', `${normalizedBaseUrl}/api/auth/twitter/callback`);
    authUrl.searchParams.append('scope', 'tweet.read tweet.write users.read offline.access');
    authUrl.searchParams.append('state', userId);
    authUrl.searchParams.append('code_challenge', codeChallenge);
    authUrl.searchParams.append('code_challenge_method', 'S256');

    // Log the constructed URL for debugging
    console.log('Constructed Twitter auth URL:', {
      url: authUrl.toString(),
      clientIdPresent: !!process.env.TWITTER_CLIENT_ID,
      redirectUri: `${normalizedBaseUrl}/api/auth/twitter/callback`
    });

    // Set the code verifier as a cookie
    const response = NextResponse.json({ url: authUrl.toString() });
    response.cookies.set('code_verifier', codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 10 // 10 minutes
    });

    return response;
  } catch (error) {
    console.error('Twitter auth error:', error);
    return NextResponse.json({ error: 'Failed to initialize Twitter authentication' }, { status: 500 });
  }
}