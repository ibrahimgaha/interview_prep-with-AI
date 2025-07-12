'use server'

import { auth, db } from "@/firebase/admin";
import { cookies } from "next/headers";

interface AuthUser {
    uid: string;
    email: string;
    name: string;
    createdAt: string;
}

const ONE_WEEK = 60 * 60 * 24 * 7; // 1 week in seconds

export async function signUp(params: SignUpParams) {
    const { uid, name, email } = params;
    try {
        const userRecord = await db.collection('users').doc(uid).get();
        if (userRecord.exists) {
            return {
                success: false,
                message: "User already exists with this email."
            };
        }

        await db.collection('users').doc(uid).set({
            name,
            email,
            createdAt: new Date().toISOString(),
        });

        return {
            success: true,
            message: "Account created successfully! Please sign in."
        };
    } catch (e: unknown) {
        console.error("Error signing up:", e);
        if (e && typeof e === 'object' && 'code' in e && e.code === 'auth/email-already-exists') {
            return {
                success: false,
                message: "Email already exists. Please use a different email."
            };
        }
        return {
            success: false,
            message: "An error occurred during sign up. Please try again later."
        };
    }
}

export async function signIn(params: SignInParams) {
    const { idToken } = params;
    try {
        // Verify the ID token first
        const decodedToken = await auth.verifyIdToken(idToken);

        if (!decodedToken) {
            return {
                success: false,
                message: "Invalid token. Please try again."
            };
        }

        // Check if user exists in our database
        const userRecord = await db.collection('users').doc(decodedToken.uid).get();

        if (!userRecord.exists) {
            return {
                success: false,
                message: "User not found. Please sign up first."
            };
        }

        await setSessionCookie(idToken);
        return {
            success: true,
            message: "Signed in successfully!"
        };
    } catch (e: unknown) {
        console.error("Error signing in:", e);
        return {
            success: false,
            message: "An error occurred during sign in. Please try again later."
        };
    }
}

export async function setSessionCookie(idToken: string) {
    try {
        const cookieStore = await cookies();
        const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn: ONE_WEEK * 1000 });

        cookieStore.set('session', sessionCookie, {
            maxAge: ONE_WEEK,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
        });

        return { success: true };
    } catch (error) {
        console.error("Error setting session cookie:", error);
        return { success: false };
    }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;

    if (!sessionCookie) {
        return null;
    }

    try {
        const decodedToken = await auth.verifySessionCookie(sessionCookie, true);
        const userRecord = await db.collection('users').doc(decodedToken.uid).get();

        if (!userRecord.exists) {
            return null;
        }

        const userData = userRecord.data();
        return {
            uid: decodedToken.uid,
            email: userData?.email || '',
            name: userData?.name || '',
            createdAt: userData?.createdAt || '',
        } as AuthUser;
    } catch (error) {
        console.error("Error verifying session cookie:", error);
        return null;
    }
}

export async function isAuthenticated(): Promise<boolean> {
    const user = await getCurrentUser();
    return !!user;
}
