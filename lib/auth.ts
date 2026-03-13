import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export async function register(email: string, password: string, name: string) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  await setDoc(doc(db, 'users', user.uid), {
    uid: user.uid,
    email,
    name,
    role: 'student',
    approved: false,
    createdAt: new Date().toISOString(),
  });
  // Sign out immediately — user can't use the app until approved
  await signOut(auth);
  return user;
}

// Inloggen — voor studenten én admin
export async function login(email: string, password: string) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Check if account is approved
  const userDoc = await getDoc(doc(db, 'users', user.uid));
  const data = userDoc.data();

  if (data && data.approved === false) {
    await signOut(auth);
    throw new Error('ACCOUNT_NOT_APPROVED');
  }

  return user;
}

// Uitloggen
export async function logout() {
  await signOut(auth);
}
