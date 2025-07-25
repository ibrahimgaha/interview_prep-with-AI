'use server'

import { feedbackSchema } from "@/constants";
import { db } from "@/firebase/admin";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";

export async function getInterviewsByUserId(userId: string): Promise<Interview[] | null> {
    try {
        console.log('Fetching interviews for userId:', userId);

        const interviews = await db
            .collection('interviews')
            .where('userid', '==', userId)  // Changed from 'userId' to 'userid' to match your API
            .orderBy('createdAt', 'desc')
            .get();

        console.log('Found interviews:', interviews.docs.length);

        const interviewData = interviews.docs.map((doc) => {
            const data = doc.data();
            console.log('Interview data:', data);
            return {
                id: doc.id,
                ...data,
                userId: data.userid, // Map userid to userId for consistency
            };
        }) as Interview[];

        return interviewData;
    } catch (error) {
        console.error('Error fetching interviews:', error);
        return [];
    }
}

export async function getLatestInterviews(params: GetLatestInterviewsParams): Promise<Interview[] | null> {
    const { userId, limit = 20 } = params;

    try {
        console.log('Fetching latest interviews excluding userId:', userId);

        const interviews = await db
            .collection('interviews')
            .where('finalized', '==', true)
            .where('userid', '!=', userId)  // Changed from 'userId' to 'userid'
            .orderBy('userid')  // Need to order by the field we're filtering on
            .orderBy('createdAt', 'desc')
            .limit(limit)
            .get();

        console.log('Found latest interviews:', interviews.docs.length);

        const interviewData = interviews.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                userId: data.userid, // Map userid to userId for consistency
            };
        }) as Interview[];

        return interviewData;
    } catch (error) {
        console.error('Error fetching latest interviews:', error);
        return [];
    }
}

export async function getInterviewsById(id: string): Promise<Interview| null> {

        const interview = await db
            .collection('interviews')
            .doc(id)
            .get();
        return interview.data() as Interview | null;
   
}

export async function createFeedback(params: CreateFeedbackParams) {
  const { interviewId, userId, transcript, feedbackId } = params;

  try {
    const formattedTranscript = transcript
      .map(
        (sentence: { role: string; content: string }) =>
          `- ${sentence.role}: ${sentence.content}\n`
      )
      .join("");

    const { object } = await generateObject({
      model: google("gemini-2.0-flash-001", {
        structuredOutputs: false,
      }),
      schema: feedbackSchema,
      prompt: `
        You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
        Transcript:
        ${formattedTranscript}

        Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
        - **Communication Skills**: Clarity, articulation, structured responses.
        - **Technical Knowledge**: Understanding of key concepts for the role.
        - **Problem-Solving**: Ability to analyze problems and propose solutions.
        - **Cultural & Role Fit**: Alignment with company values and job role.
        - **Confidence & Clarity**: Confidence in responses, engagement, and clarity.
        `,
      system:
        "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories",
    });

    const feedback = {
      interviewId: interviewId,
      userId: userId,
      totalScore: object.totalScore,
      categoryScores: object.categoryScores,
      strengths: object.strengths,
      areasForImprovement: object.areasForImprovement,
      finalAssessment: object.finalAssessment,
      createdAt: new Date().toISOString(),
    };

    let feedbackRef;

    if (feedbackId) {
      feedbackRef = db.collection("feedback").doc(feedbackId);
    } else {
      feedbackRef = db.collection("feedback").doc();
    }

    await feedbackRef.set(feedback);

    return { success: true, feedbackId: feedbackRef.id };
  } catch (error) {
    console.error("Error saving feedback:", error);
    return { success: false };
  }
}

export async function getFeedbackByInterviewId(params: GetFeedbackByInterviewIdParams): Promise<Feedback | null> {
    const { interviewId, userId } = params;

    console.log('🔍 Searching for feedback with:', { interviewId, userId });

    const feedback = await db
        .collection('feedback')
        .where('interviewId', '==', interviewId)
        .where('userId', '==', userId)
        .limit(1)
        .get();

    console.log('📊 Feedback query result:', {
        empty: feedback.empty,
        size: feedback.size,
        docs: feedback.docs.map(doc => ({ id: doc.id, data: doc.data() }))
    });

    if (feedback.empty) {
        console.log('❌ No feedback found');
        return null;
    }

    const feedbackDoc = feedback.docs[0];
    const result = {
        id: feedbackDoc.id,
        ...feedbackDoc.data(),
    } as Feedback;

    console.log('✅ Returning feedback:', result);
    return result;
}

export async function getFeedbackById(feedbackId: string): Promise<Feedback | null> {
    try {
        console.log('🔍 Fetching feedback by ID:', feedbackId);

        const feedbackDoc = await db
            .collection('feedback')
            .doc(feedbackId)
            .get();

        if (!feedbackDoc.exists) {
            console.log('❌ Feedback not found');
            return null;
        }

        const result = {
            id: feedbackDoc.id,
            ...feedbackDoc.data(),
        } as Feedback;

        console.log('✅ Returning feedback by ID:', result);
        return result;
    } catch (error) {
        console.error('Error fetching feedback by ID:', error);
        return null;
    }
}

