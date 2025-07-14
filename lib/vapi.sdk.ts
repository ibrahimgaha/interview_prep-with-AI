import Vapi from '@vapi-ai/web';

// Validate the token exists
const webToken = process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN;

if (!webToken) {
    console.error('VAPI Web Token is missing. Please check your environment variables.');
}

console.log('Initializing VAPI with token:', webToken ? 'Token present' : 'Token missing');

export const vapi = new Vapi(webToken!);

