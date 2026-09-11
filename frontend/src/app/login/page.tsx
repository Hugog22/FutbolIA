'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const res = await fetch(`/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: email, password }),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.detail || 'Credenciales incorrectas');
            }

            login();
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Error al iniciar sesión');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">

            <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-[#64748B] hover:text-[#1A1C1E] transition-colors z-20 group">
                <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="text-xs font-bold uppercase tracking-wider">Volver</span>
            </Link>

            <div className="max-w-md w-full z-10">
                <div className="text-center mb-10">
                    <Link href="/" className="inline-flex flex-col items-center gap-3 group">
                        <Image src="/logo.png" alt="FutbolIA" width={200} height={60} className="h-14 w-auto object-contain group-hover:scale-105 transition-transform" priority />
                    </Link>
                    <h2 className="mt-8 text-3xl font-bold text-[#1A1C1E]">Iniciar sesión</h2>
                    <p className="mt-2 text-sm text-[#64748B]">Accede a las predicciones de La Liga</p>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-[#E5E7EB] shadow-sm">
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm text-center" role="alert">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="text-xs font-semibold text-[#64748B] block mb-2">Correo electrónico</label>
                            <input
                                name="email"
                                type="email"
                                required
                                className="block w-full px-4 py-3 bg-[#F8F9FA] border border-[#E5E7EB] placeholder-[#CBD5E1] text-[#1A1C1E] rounded-xl focus:outline-none focus:border-[#1A1C1E] focus:ring-1 focus:ring-[#1A1C1E] transition-all"
                                placeholder="usuario@ejemplo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-xs font-semibold text-[#64748B]">Contraseña</label>
                                <Link href="/forgot-password" className="text-xs font-semibold text-[#1A1C1E] hover:underline">¿Olvidaste tu contraseña?</Link>
                            </div>
                            <input
                                name="password"
                                type="password"
                                required
                                className="block w-full px-4 py-3 bg-[#F8F9FA] border border-[#E5E7EB] placeholder-[#CBD5E1] text-[#1A1C1E] rounded-xl focus:outline-none focus:border-[#1A1C1E] focus:ring-1 focus:ring-[#1A1C1E] transition-all"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3.5 px-4 bg-[#1A1C1E] text-white font-bold rounded-xl hover:bg-[#2d3035] transition-all active:scale-95"
                        >
                            Entrar
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-[#64748B]">
                            ¿No tienes cuenta?{' '}
                            <Link href="/register" className="font-bold text-[#1A1C1E] hover:underline">Registrarse</Link>
                        </p>
                    </div>
                </div>

                <p className="mt-8 text-center text-[#94A3B8] text-xs">© 2026 FutbolIA</p>
            </div>
        </div>
    );
}
