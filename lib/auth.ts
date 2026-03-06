import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

// Registreren — alleen voor studenten met @novacollege.nl e-mail
export async function register(email: string, password: string, name: string) {
  if (!email.toLowerCase().endsWith('@novacollege.nl')) {
    throw new Error('Alleen @novacollege.nl e-mailadressen zijn toegestaan om te registreren.');
  }
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  await sendEmailVerification(user);
  await setDoc(doc(db, 'users', user.uid), {
    uid: user.uid,
    email,
    name,
    role: 'student',
    createdAt: new Date().toISOString(),
  });
  return user;
}

// Inloggen — voor studenten én admin
export async function login(email: string, password: string) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

// Uitloggen
export async function logout() {
  await signOut(auth);
}