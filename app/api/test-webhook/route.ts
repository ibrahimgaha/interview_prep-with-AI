import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        message: 'Webhook endpoint is accessible',
        timestamp: new Date().toISOString(),
        status: 'OK'
    });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log('Test webhook received:', body);
        
        return NextResponse.json({
            message: 'Webhook received successfully',
            receivedData: body,
            timestamp: new Date().toISOString(),
            status: 'OK'
        });
    } catch (error) {
        console.error('Test webhook error:', error);
        return NextResponse.json({
            message: 'Webhook error',
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
            status: 'ERROR'
        }, { status: 500 });
    }
}
