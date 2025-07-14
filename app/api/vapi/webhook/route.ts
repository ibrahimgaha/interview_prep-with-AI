import { NextRequest, NextResponse } from 'next/server';
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { getRandomInterviewCover } from "@/lib/utils";
import { db } from "@/firebase/admin";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        console.log('VAPI Webhook received:', body);

        // Handle different types of webhook events
        const { message, call } = body;

        // Check if this is a function call from the workflow
        if (message?.type === 'function-call') {
            const { functionCall } = message;
            
            if (functionCall.name === 'generateInterview') {
                const { role, level, techstack, type, amount, userId } = functionCall.parameters;
                
                try {
                    // Generate interview questions using AI
                    const { text: questions } = await generateText({
                        model: google('gemini-2.0-flash-001'),
                        prompt: `Prepare questions for a job interview.
                        The job role is ${role}.
                        The job experience level is ${level}.
                        The tech stack used in the job is: ${techstack}.
                        The focus between behavioural and technical questions should lean towards: ${type}.
                        The amount of questions required is: ${amount}.
                        Please return only the questions, without any additional text.
                        The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
                        Return the questions formatted like this:
                        ["Question 1", "Question 2", "Question 3"]
                        
                        Thank you! <3`,
                    });

                    // Save interview to database
                    const interview = {
                        role,
                        type,
                        level,
                        techstack: techstack.split(','),
                        amount,
                        questions: JSON.parse(questions),
                        userid: userId,
                        finalized: true,
                        coverImage: getRandomInterviewCover(),
                        createdAt: new Date().toISOString(),
                    };

                    const docRef = await db.collection('interviews').add(interview);
                    
                    // Return the result to VAPI
                    return NextResponse.json({
                        result: {
                            success: true,
                            interviewId: docRef.id,
                            questionsGenerated: interview.questions.length,
                            message: `Great! I've generated ${interview.questions.length} ${type} interview questions for a ${level} ${role} position. The interview has been saved and you can access it from your dashboard.`
                        }
                    });
                    
                } catch (error) {
                    console.error('Error generating interview:', error);
                    return NextResponse.json({
                        result: {
                            success: false,
                            error: 'Failed to generate interview questions. Please try again.'
                        }
                    });
                }
            }
        }

        // Handle call status updates
        if (call) {
            console.log('Call status:', call.status);
            // You can add logic here to handle call start, end, etc.
        }

        // Default response for other webhook events
        return NextResponse.json({ received: true });
        
    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        );
    }
}

// Handle GET requests (for webhook verification if needed)
export async function GET() {
    return NextResponse.json({ 
        message: 'VAPI Webhook endpoint is active',
        timestamp: new Date().toISOString()
    });
}
