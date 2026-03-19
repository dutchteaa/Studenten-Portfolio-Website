import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    // Verify the caller is an admin via their Firebase ID token
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const callerToken = await getAdminAuth().verifyIdToken(token);

    // Check caller is admin
    const callerDoc = await getAdminDb().collection('users').doc(callerToken.uid).get();
    if (callerDoc.data()?.role !== 'admin') {
      return NextResponse.json({ error: 'Geen admin rechten' }, { status: 403 });
    }

    const { uid } = await req.json();
    if (!uid || typeof uid !== 'string') {
      return NextResponse.json({ error: 'Gebruiker ID ontbreekt' }, { status: 400 });
    }

    // Don't allow deleting yourself
    if (uid === callerToken.uid) {
      return NextResponse.json({ error: 'Je kunt je eigen account niet verwijderen' }, { status: 400 });
    }

    // Delete from Firebase Authentication
    try {
      await getAdminAuth().deleteUser(uid);
    } catch (err: unknown) {
      // User might not exist in Auth (e.g. already deleted), continue to delete Firestore doc
      const message = err instanceof Error ? err.message : '';
      if (!message.includes('auth/user-not-found')) {
        throw err;
      }
    }

    // Delete from Firestore
    await getAdminDb().collection('users').doc(uid).delete();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Delete user error:', err);
    return NextResponse.json({ error: 'Verwijderen mislukt' }, { status: 500 });
  }
}
