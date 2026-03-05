'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { register } from '@/lib/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleRegister() {
    try {
      await register(email, password, name);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2 text-center">Account aanmaken</h1>
        <p className="text-center text-gray-500 text-sm mb-6">Registreer als student om projecten toe te voegen</p>
        <input type="text" placeholder="Volledige naam" value={name} onChange={e => setName(e.target.value)}
          className="w-full border rounded-lg px-4 py-2 mb-4" />
        <input type="email" placeholder="E-mailadres" value={email} onChange={e => setEmail(e.target.value)}
          className="w-full border rounded-lg px-4 py-2 mb-4" />
        <input type="password" placeholder="Wachtwoord (min. 6 tekens)" value={password} onChange={e => setPassword(e.target.value)}
          className="w-full border rounded-lg px-4 py-2 mb-4" />
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <button onClick={handleRegister} className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700">
          Registreren
        </button>
        <p className="text-center mt-4 text-sm text-gray-600">
          Al een account? <a href="/login" className="text-blue-600 hover:underline">Inloggen</a>
        </p>
      </div>
    </div>
  );
}