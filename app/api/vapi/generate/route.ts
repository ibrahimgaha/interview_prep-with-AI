import {generateText} from "ai"
import {google} from "@ai-sdk/google"
import { getRandomInterviewCover } from "@/lib/utils";
import { db } from "@/firebase/admin";
export async function GET(){
    return Response.json({
        success: "true",data:"Thank you"
    }   ,{status: 200});
}

export async function POST(request: Request){
    try {
        const body = await request.json();
        console.log('Received VAPI request:', body);

        const { type, role, level, techstack, amount, userid } = body;

        // Validate required parameters
        if (!type || !role || !level || !techstack || !amount || !userid) {
            return Response.json({
                success: false,
                error: 'Missing required parameters',
                required: ['type', 'role', 'level', 'techstack', 'amount', 'userid']
            }, { status: 400 });
        }
    const {text:questions} = await generateText({

        model : google('gemini-2.0-flash-001'),
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
        
        Thank you! <3
    `,

    });


   const interview = {
    role,
    type,
    level,
    techstack:techstack.split(','),
    amount,
    questions : JSON.parse(questions),
    userid:userid,
    finalized: true,
    coverImage : getRandomInterviewCover(),
    createdAt: new Date().toISOString(),
   }

        const docRef = await db.collection('interviews').add(interview);

        return Response.json({
            success: true,
            message: `Interview generated successfully with ${interview.questions.length} questions`,
            interviewId: docRef.id
        }, { status: 200 });

    } catch (error) {
        console.error('Error in VAPI generate endpoint:', error);
        return Response.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}