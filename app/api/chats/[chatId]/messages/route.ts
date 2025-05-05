import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    console.log('[Firebase] Initializing Firebase Admin...');
    try {
        const serviceAccount: admin.ServiceAccount = {
            projectId: process.env.FIREBASE_PROJECT_ID,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL
        };

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('[Firebase] Successfully initialized Firebase Admin');
    } catch (error) {
        console.error('[Firebase] Error initializing Firebase Admin:', error);
        throw error;
    }
}

const db = getFirestore();

// Helper function to handle Firebase connection errors
const handleFirebaseError = (error: any) => {
    console.error('[Firebase] Error:', error);
    if (error.code === 14 || error.message?.includes('ETIMEDOUT')) {
        return {
            error: 'Connection to database timed out. Please try again.',
            status: 503
        };
    }
    return {
        error: 'An error occurred while accessing the database.',
        status: 500
    };
};

export async function GET(request: NextRequest) {
    try {
        const chatId = request.nextUrl.pathname.split('/').at(-2);
        if (!chatId) {
            return NextResponse.json(
                { error: 'Chat ID is required' },
                { status: 400 }
            );
        }

        // After null check, we can safely assert chatId is string
        const validChatId = chatId as string;

        console.log('chatId', validChatId);
        console.log('[API] Getting messages for chatId:', validChatId);
        console.log('[Firebase] Querying Firestore...');

        // Query Firestore for messages
        const messagesRef = db.collection('chats').doc(validChatId).collection('messages');
        const snapshot = await messagesRef.orderBy('timestamp', 'asc').get();

        console.log('[Firebase] Query completed. Number of messages:', snapshot.size);

        const messages = snapshot.docs.map((doc: admin.firestore.QueryDocumentSnapshot) => {
            const data = doc.data();
            console.log('[Firebase] Message data:', data);
            return {
                role: data.role,
                content: data.content,
                timestamp: data.timestamp
            };
        });

        console.log('[API] Retrieved messages:', messages);

        return NextResponse.json({
            messages
        });
    } catch (error) {
        const { error: errorMessage, status } = handleFirebaseError(error);
        return NextResponse.json(
            { error: errorMessage },
            { status }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const chatId = request.nextUrl.pathname.split('/').at(-2);
        if (!chatId) {
            return NextResponse.json(
                { error: 'Chat ID is required' },
                { status: 400 }
            );
        }

        // After null check, we can safely assert chatId is string
        const validChatId = chatId as string;

        console.log('chatId', validChatId);
        const { messages } = await request.json();
        console.log('[API] Received messages to save:', messages);
        console.log('[Firebase] Adding messages to Firestore...');

        // Get a batch write
        const batch = db.batch();
        const messagesRef = db.collection('chats').doc(validChatId).collection('messages');

        // Delete existing messages
        const existingMessages = await messagesRef.get();
        existingMessages.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });

        // Add new messages
        messages.forEach((message: any) => {
            const docRef = messagesRef.doc();
            batch.set(docRef, {
                role: message.role,
                content: message.content,
                timestamp: new Date().toISOString()
            });
        });

        // Commit the batch
        await batch.commit();

        console.log('[Firebase] Messages saved successfully');

        return NextResponse.json({
            success: true,
            message: 'Messages saved successfully'
        });
    } catch (error) {
        const { error: errorMessage, status } = handleFirebaseError(error);
        return NextResponse.json(
            { error: errorMessage },
            { status }
        );
    }
} 