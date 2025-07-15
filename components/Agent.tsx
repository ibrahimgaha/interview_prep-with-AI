"use client";

import { cn } from '@/lib/utils';
import Image from 'next/image'
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { vapi } from '@/lib/vapi.sdk';
import { interviewer } from '@/constants';
// Note: createFeedback is imported dynamically to avoid server-side imports in client component

// VAPI Message type definition
interface Message {
    type: string;
    transcriptType?: string;
    role: "user" | "system" | "assistant";
    transcript: string;
}

enum CallStatus {
    INACTIVE = 'INACTIVE',
    CONNECTING = 'CONNECTING',
    ACTIVE = 'ACTIVE',
    FINISHED = 'FINISHED',
}

interface SavedMessage {
    role: "user" | "system" | "assistant";
    content: string;
}

const Agent = ({ userName, userId, type, interviewId, questions }: AgentProps) => {
    const router = useRouter();
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [callStatus, setCallStatus] = useState(CallStatus.INACTIVE);
    const [messages, setMessages] = useState<SavedMessage[]>([]);
    const [retryCount, setRetryCount] = useState(0);
    const lastMessage = messages[messages.length - 1];

 

    useEffect(() => {
        const onCallStart = () => {
            setCallStatus(CallStatus.ACTIVE);
            setRetryCount(0); // Reset retry count on successful call
        };

        const onCallEnd = () => {
            setCallStatus(CallStatus.FINISHED);
        };

        const onMessage = (message: Message) => {
            if (message.type === 'transcript' && message.transcriptType === 'final') {
                const newMessage = { role: message.role, content: message.transcript };
                setMessages(prevMessages => [...prevMessages, newMessage]);
            }
        };

        const onSpeechStart = () => {
            setIsSpeaking(true);
        };

        const onSpeechEnd = () => {
            setIsSpeaking(false);
        };

        const onError = (error: any) => {
            console.error('VAPI Error Details:', {
                error,
                message: error?.message,
                code: error?.code,
                details: error?.details,
                stack: error?.stack,
                type: error?.error?.type,
                stage: error?.error?.stage,
                response: error?.error?.response
            });

            // Log the full error object for debugging
            console.error('Full VAPI Error Object:', JSON.stringify(error, null, 2));

            // Handle specific error types
            if (error?.error?.type === 'no-room' ||
                error?.error?.type === 'ejected' ||
                error?.errorMsg?.includes('Meeting has ended') ||
                error?.errorMsg?.includes('WebSocket connection')) {
                console.log('Network/WebSocket issue detected...');
                setCallStatus(CallStatus.INACTIVE);

                // Show specific error message for network issues
                alert(`Network connection issue detected. This might be due to:

1. Firewall blocking WebSocket connections
2. Corporate network restrictions
3. VPN interference
4. Antivirus software blocking connections

Please try:
- Disabling VPN temporarily
- Using a different network (mobile hotspot)
- Checking firewall settings
- Contacting your network administrator

The issue is with connecting to VAPI's voice servers, not your code.`);
                return;
            }

            setCallStatus(CallStatus.INACTIVE);
        };

        vapi.on('call-start', onCallStart);
        vapi.on('call-end', onCallEnd);
        vapi.on('message', onMessage);
        vapi.on('speech-start', onSpeechStart);
        vapi.on('speech-end', onSpeechEnd);
        vapi.on('error', onError);

        return () => {
            vapi.off('call-start', onCallStart);
            vapi.off('call-end', onCallEnd);
            vapi.off('message', onMessage);
            vapi.off('speech-start', onSpeechStart);
            vapi.off('speech-end', onSpeechEnd);
            vapi.off('error', onError);
        };
    }, []);

    const handleGenerateFeedback = async (messages: SavedMessage[]) => {
        console.log("Generate FeedBack here.");
        try {
            // Dynamic import to avoid server-side imports in client component
            const { createFeedback } = await import('@/lib/actions/general.action');

            const { success, feedbackId: id } = await createFeedback({
                interviewId: interviewId!,
                userId: userId!,
                transcript: messages,
            });

            if (success && id) {
                router.push(`/interview/${interviewId}/feedback/${id}`);
            } else {
                console.log("Error saving feedback.");
                router.push("/");
            }
        } catch (error) {
            console.error("Error creating feedback:", error);
            router.push("/");
        }
    };

    useEffect(() => {
        if (callStatus === CallStatus.FINISHED) {
            if (type === "generate") {
                router.push('/');
            } else {
                handleGenerateFeedback(messages);
            }
        }
    }, [messages, callStatus, type, userId, router, interviewId]);

    const handleCall = async () => {
        try {
            setCallStatus(CallStatus.CONNECTING);

            // Check network connectivity first
            if (!navigator.onLine) {
                throw new Error('No internet connection detected');
            }

            // Stop any existing call first and clear any cached connections
            try {
                vapi.stop();
                await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds for cleanup
            } catch (e) {
                console.log('No active call to stop');
            }

            // Check if we can reach VAPI servers
            try {
                const response = await fetch('https://api.vapi.ai/health', {
                    method: 'GET',
                    signal: AbortSignal.timeout(5000) // 5 second timeout
                });
                if (!response.ok) {
                    throw new Error('VAPI servers unreachable');
                }
                console.log('VAPI servers are reachable');
            } catch (e) {
                console.error('Cannot reach VAPI servers:', e);
                throw new Error('Network connection to VAPI failed. Please check your internet connection and firewall settings.');
            }

            // Validate environment variables
            const workflowId = process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID;
            const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
            const webToken = process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN;

            console.log('🔍 Environment Variables Debug:', {
                workflowId: workflowId || 'MISSING',
                assistantId: assistantId || 'MISSING',
                webToken: webToken ? 'Set' : 'MISSING',
                allEnvVars: Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_VAPI'))
            });

            console.log('VAPI Configuration:', {
                workflowId: workflowId ? 'Set' : 'Missing',
                assistantId: assistantId ? 'Set' : 'Missing',
                webToken: webToken ? 'Set' : 'Missing',
                type,
                userName,
                userId
            });

            if (!webToken) {
                throw new Error('VAPI Web Token is missing');
            }

            // Validate ID formats
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (type === "generate" && workflowId && !uuidRegex.test(workflowId)) {
                throw new Error('Invalid workflow ID format');
            }
            if (type !== "generate" && assistantId && !uuidRegex.test(assistantId)) {
                throw new Error('Invalid assistant ID format');
            }

            // Use the workflow ID for interview generation
            if (type === "generate") {
                if (!workflowId) {
                    throw new Error('VAPI Workflow ID is missing');
                }
                console.log('Starting workflow with ID:', workflowId);

                // Add retry logic for network issues
                console.log('Attempting to start VAPI call...');

                const startCall = async (retryCount = 0) => {
                    try {
                        console.log('Starting VAPI workflow with configuration:', {
                            workflowId,
                            userName,
                            userId
                        });

                        // Use the correct VAPI start method signature for workflows
                        console.log('Attempting workflow start with correct signature...');

                        // Configuration for VAPI workflow
                        const startConfig = {
                            variableValues: {
                                username: userName,
                                userid: userId,
                                // Don't send the interview parameters - let the AI ask for them
                                // The workflow will extract these through conversation:
                                // role, type, level, amount, techstack
                            }
                        };

                        // Add a test mode bypass for network issues
                        if (process.env.NODE_ENV === 'development' && window.location.search.includes('test=true')) {
                            console.log('TEST MODE: Simulating VAPI workflow call...');
                            setCallStatus(CallStatus.ACTIVE);

                            // Simulate the workflow API call directly
                            setTimeout(async () => {
                                try {
                                    const response = await fetch('/api/vapi/generate', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                            userid: userId,
                                            role: 'Frontend Developer',
                                            type: 'Technical',
                                            level: 'junior',  // lowercase to match your workflow
                                            amount: 5,
                                            techstack: 'React,TypeScript,Next.js'  // comma-separated as expected
                                        })
                                    });
                                    const result = await response.json();
                                    console.log('🧪 TEST MODE: API call result:', result);

                                    if (result.success) {
                                        alert(`✅ TEST MODE SUCCESS!\n\nGenerated: ${result.message}\nInterview ID: ${result.interviewId}\n\nCheck your Firebase console and home page!`);
                                    } else {
                                        alert(`❌ TEST MODE ERROR: ${result.error || 'Unknown error'}`);
                                    }
                                    setCallStatus(CallStatus.FINISHED);
                                } catch (e) {
                                    console.error('🧪 TEST MODE: API call failed:', e);
                                    alert(`❌ TEST MODE: API call failed - ${e instanceof Error ? e.message : 'Unknown error'}`);
                                    setCallStatus(CallStatus.INACTIVE);
                                }
                            }, 2000);
                            return;
                        }

                        await vapi.start(
                            undefined,
                            undefined,
                            undefined,
                            workflowId,
                            startConfig
                        );
                    } catch (err: unknown) {
                        console.error(`Call attempt ${retryCount + 1} failed:`, err);
                        const errorMessage = err instanceof Error ? err.message : String(err);

                        // Check if it's a 400 error (bad request) - don't retry these
                        if (errorMessage.includes('400') || errorMessage.includes('Bad Request')) {
                            setCallStatus(CallStatus.INACTIVE);
                            alert('Invalid workflow configuration. Please check your VAPI workflow settings.');
                            return;
                        }

                        // Only retry network errors
                        if (retryCount < 2 && (errorMessage.includes('ERR_NETWORK') || errorMessage.includes('network'))) {
                            console.log(`Retrying in ${(retryCount + 1) * 2} seconds...`);
                            setTimeout(() => startCall(retryCount + 1), (retryCount + 1) * 2000);
                        } else {
                            setCallStatus(CallStatus.INACTIVE);
                            alert('Failed to start the call. Please try again.');
                        }
                    }
                };

                startCall();
            } else {
                // Use assistant ID for regular interviews
                if (!assistantId) {
                    throw new Error('VAPI Assistant ID is missing');
                }
                console.log('Starting assistant with ID:', assistantId);

                // Add retry logic for assistant calls too
                const startAssistantCall = async (retryCount = 0) => {
                    try {
                        console.log('Starting VAPI assistant with configuration:', {
                            assistantId,
                            userName,
                            userId,
                            questionsCount: questions?.length || 0
                        });

                        // Use the correct VAPI start method signature for assistants
                        console.log('Attempting assistant start...');

                        // Format questions for the assistant
                        let formattedQuestions = "";
                        if (questions) {
                            formattedQuestions = questions.map(question => `- ${question}`).join('\n');
                        }

                        await vapi.start(interviewer, {
                            variableValues: {
                                username: userName,
                                userid: userId,
                                questions: formattedQuestions,
                            },
                        });
                    } catch (err: unknown) {
                        console.error(`Assistant call attempt ${retryCount + 1} failed:`, err);
                        const errorMessage = err instanceof Error ? err.message : String(err);

                        // Check if it's a 400 error (bad request) - don't retry these
                        if (errorMessage.includes('400') || errorMessage.includes('Bad Request')) {
                            setCallStatus(CallStatus.INACTIVE);
                            alert('Invalid assistant configuration. Please check your VAPI assistant settings.');
                            return;
                        }

                        // Only retry network errors
                        if (retryCount < 2 && (errorMessage.includes('ERR_NETWORK') || errorMessage.includes('network'))) {
                            console.log(`Retrying assistant call in ${(retryCount + 1) * 2} seconds...`);
                            setTimeout(() => startAssistantCall(retryCount + 1), (retryCount + 1) * 2000);
                        } else {
                            setCallStatus(CallStatus.INACTIVE);
                            alert('Failed to start the assistant call. Please try again.');
                        }
                    }
                };

                startAssistantCall();
            }
        } catch (error) {
            console.error('Error starting VAPI call:', error);
            setCallStatus(CallStatus.INACTIVE);
        }
    }

    const handleDisconnect = async () => {
        setCallStatus(CallStatus.FINISHED);
        vapi.stop();
    };

    // Get status-specific styling
    const getStatusColor = () => {
        switch (callStatus) {
            case CallStatus.ACTIVE:
                return 'border-success-100';
            case CallStatus.CONNECTING:
                return 'border-yellow-400';
            case CallStatus.FINISHED:
                return 'border-gray-400';
            default:
                return 'border-primary-200/50';
        }
    };

    return (
        <>
            <div className='call-view'>
                <div className={cn('card-interviewer', getStatusColor())}>
                    <div className='avatar'>
                        <Image
                            src='/ai-avatar.png'
                            alt='AI Interviewer'
                            height={120}
                            width={120}
                            className={cn('rounded-full object-cover size-[60px] z-20')}
                        />
                        {isSpeaking && <span className='animate-speak'></span>}
                    </div>
                    <h3>AI Interviewer</h3>
                    <div className={cn(
                        'text-xs px-3 py-1 rounded-full font-medium',
                        callStatus === CallStatus.ACTIVE && 'bg-success-100/20 text-success-100',
                        callStatus === CallStatus.CONNECTING && 'bg-yellow-400/20 text-yellow-400',
                        callStatus === CallStatus.FINISHED && 'bg-gray-400/20 text-gray-400',
                        callStatus === CallStatus.INACTIVE && 'bg-primary-200/20 text-primary-200'
                    )}>
                        {callStatus}
                    </div>
                </div>

                <div className='card-border'>
                    <div className='card-content'>
                        <Image
                            src='/user-avatar.png'
                            alt={`${userName} avatar`}
                            height={120}
                            width={120}
                            className='rounded-full object-cover size-[120px]'
                        />
                        <h3>{userName}</h3>
                        <div className='text-sm text-gray-400 capitalize'>
                            {type} Session
                        </div>
                    </div>
                </div>
            </div>

            {messages.length > 0 && (
                <div className='transcript-border'>
                    <div className='transcript'>
                        <p
                            key={lastMessage?.content}
                            className={cn(
                                'transition-opacity duration-500 opacity-0',
                                'animate-fadeIn opacity-100'
                            )}
                        >
                            {lastMessage?.content}
                        </p>
                    </div>
                </div>
            )}

            <div className='w-full flex justify-center mt-8'>
                {callStatus !== CallStatus.ACTIVE ? (
                    <button
                        className={cn(
                            'relative btn-call flex-center',
                            'transition-all duration-300 hover:scale-105',
                            callStatus === CallStatus.CONNECTING && 'animate-pulse-slow'
                        )}
                        disabled={callStatus === CallStatus.CONNECTING}
                        onClick={handleCall}
                    >
                        {callStatus === CallStatus.CONNECTING && (
                            <span className={cn(
                                'absolute animate-ping rounded-full opacity-75',
                                'bg-success-100 h-[85%] w-[85%]'
                            )} />
                        )}
                        <span className='relative z-10 flex items-center gap-2'>
                            {callStatus === CallStatus.CONNECTING && (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            )}
                            {callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED ? "Start Call" : "Connecting..."}
                        </span>
                    </button>
                ) : (
                    <button
                        className={cn(
                            'btn-disconnect',
                            'transition-all duration-300 hover:scale-105 hover:bg-red-600'
                        )}
                        onClick={handleDisconnect}
                    >
                        <span className='flex items-center gap-2'>
                            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                            End Call
                        </span>
                    </button>
                )}
            </div>
        </>
    )
}

export default Agent
