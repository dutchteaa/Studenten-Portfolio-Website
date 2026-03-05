'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleLogin() {
    try {
      const user = await login(email, password);
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const role = userDoc.data()?.role;
      router.push(role === 'admin' ? '/admin' : '/dashboard');
    } catch {
      setError('E-mailadres of wachtwoord onjuist');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Inloggen</h1>
        <input type="email" placeholder="E-mailadres" value={email} onChange={e => setEmail(e.target.value)}
          className="w-full border rounded-lg px-4 py-2 mb-4" />
        <input type="password" placeholder="Wachtwoord" value={password} onChange={e => setPassword(e.target.value)}
          className="w-full border rounded-lg px-4 py-2 mb-4" />
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <button onClick={handleLogin} className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700">
          Inloggen
        </button>
        <p className="text-center mt-4 text-sm text-gray-600">
          Nog geen account? <a href="/register" className="text-blue-600 hover:underline">Registreren</a>
        </p>
      </div>
    </div>
  );
}