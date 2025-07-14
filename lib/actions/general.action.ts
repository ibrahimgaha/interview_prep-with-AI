import { db } from "@/firebase/admin";

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