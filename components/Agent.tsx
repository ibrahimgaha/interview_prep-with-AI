"use client";

import { cn } from '@/lib/utils';
import Image from 'next/image'
import React, { useState } from 'react'

enum CallStatus {
    INACTIVE = 'INACTIVE',
    CONNECTING = 'CONNECTING',
    ACTIVE = 'ACTIVE',
    FINISHED = 'FINISHED',
}

const Agent = ({userName, type = "interview", userId, interviewId, feedbackId, questions}: AgentProps) => {
    const isSpeaking = true;
    // Use state for dynamic status - demo purposes
    const [callStatus] = useState<CallStatus>(CallStatus.INACTIVE);
    const messages = [
        'Hello! Welcome to your AI-powered interview session.',
        'What\'s your name?',
        'My name is Ibrahim Gaha, nice to meet you!',
        'Great! Let\'s begin with some questions about your experience.',
    ];

    const lastMessage = messages[messages.length - 1];

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
                            key={lastMessage}
                            className={cn(
                                'transition-opacity duration-500 opacity-0',
                                'animate-fadeIn opacity-100'
                            )}
                        >
                            {lastMessage}
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
                    <button className={cn(
                        'btn-disconnect',
                        'transition-all duration-300 hover:scale-105 hover:bg-red-600'
                    )}>
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
