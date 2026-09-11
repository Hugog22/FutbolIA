'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmitEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!acceptedTerms) {
            setError('Debes aceptar las condiciones.');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const res = await fetch(`/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                    name: "Usuario"
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.detail || data.message || 'Error al registrar usuario');
            }

            // Successful registration, login automatically
            const loginRes = await fetch(`/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    username: email,
                    password: password,
                }),
            });

            if (loginRes.ok) {
                const loginData = await loginRes.json();
                login(loginData.access_token);
                router.push('/dashboard');
            } else {
                router.push('/login?registered=true');
            }
        } catch (err: any) {
            setError(err.message || 'Error de registro');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FCF9F1] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
            
            {/* Background Texture/Art */}
            <div className="absolute top-0 left-0 w-1/2 h-full bg-[#064E3B]/[0.02] skew-x-12 transform origin-top-left"></div>

            {/* Back Button */}
            <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-[#64748B] hover:text-[#1A1C1E] transition-colors z-20 group">
                <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="text-xs font-bold uppercase tracking-wider">Volver</span>
            </Link>
            
            <div className="max-w-md w-full z-10">
                <div className="text-center mb-12">
                    <Link href="/" className="inline-flex flex-col items-center gap-3 group">
                        <Image src="/logo.png" alt="QuantStake Logo" width={240} height={70} className="h-16 w-auto object-contain group-hover:scale-105 transition-transform" priority />
                    </Link>
                    <h2 className="mt-8 text-4xl font-editorial font-bold text-[#1A1C1E]">
                        Nueva <span className="italic font-light">Cuenta</span>
                    </h2>
                    <div className="mt-4 inline-flex items-center gap-2 bg-[#064E3B] text-slate-900 px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-lg shadow-[#064E3B]/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#1B365D] animate-pulse"></div>
                        Acceso libre — Portafolio Académico
                    </div>
                </div>

                <div className="bg-white p-10 rounded-[2.5rem] border border-[#E5E7EB] shadow-[0_20px_50px_rgba(0,0,0,0.04)]">
                    <form className="space-y-6" onSubmit={handleSubmitEvent}>
                        {error && (
                            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest text-center" role="alert">
                                {error}
                            </div>
                        )}

                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] uppercase tracking-[0.2em] font-black text-[#64748B] block mb-2 ml-1">Correo Electrónico</label>
                                <input
                                    id="email-address"
                                    name="email"
                                    type="email"
                                    required
                                    className="appearance-none block w-full px-5 py-4 bg-[#F8F9FA] border border-[#E5E7EB] placeholder-[#94A3B8] text-[#1A1C1E] rounded-2xl focus:outline-none focus:border-slate-300 focus:ring-1 focus:ring-[#064E3B] transition-all font-medium"
                                    placeholder="usuario@ejemplo.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] uppercase tracking-[0.2em] font-black text-[#64748B] block mb-2 ml-1">Contraseña</label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="appearance-none block w-full px-5 py-4 bg-[#F8F9FA] border border-[#E5E7EB] placeholder-[#94A3B8] text-[#1A1C1E] rounded-2xl focus:outline-none focus:border-slate-300 focus:ring-1 focus:ring-[#064E3B] transition-all font-medium"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex items-start mt-4 mb-2">
                            <div className="flex items-center h-5">
                                <input
                                    id="terms"
                                    name="terms"
                                    type="checkbox"
                                    checked={acceptedTerms}
                                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                                    className="w-4 h-4 rounded border-[#E5E7EB] text-[#064E3B] focus:ring-[#064E3B] bg-[#F8F9FA] transition-all cursor-pointer accent-[#064E3B]"
                                />
                            </div>
                            <div className="ml-3 text-xs">
                                <label htmlFor="terms" className="font-medium text-[#64748B] cursor-pointer">
                                    Entiendo que este es un{' '}
                                    <Link href="/terminos" target="_blank" className="text-[#064E3B] hover:underline font-bold">
                                        proyecto de portafolio sin fines de lucro
                                    </Link>{' '}
                                    y los datos son simulados o de investigación{' '}
                                    <Link href="/cookies" target="_blank" className="text-[#064E3B] hover:underline font-bold">
                                        
                                    </Link>
                                </label>
                            </div>
                        </div>

                        <div className="pt-4 space-y-3">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full flex justify-center items-center py-5 px-4 bg-[#064E3B] text-white text-xs uppercase tracking-[0.2em] font-black rounded-2xl hover:bg-[#043327] shadow-xl shadow-[#064E3B]/20 transition-all active:scale-95 group disabled:opacity-70"
                            >
                                {isSubmitting ? 'Creando cuenta...' : 'Crear Cuenta'}
                            </button>
                        </div>
                    </form>
                    
                    <div className="mt-8 text-center">
                        <Link href="/login" className="text-[10px] uppercase tracking-[0.2em] font-black text-[#64748B] hover:text-[#064E3B] transition-colors inline-flex items-center gap-2">
                            <span>¿Ya eres miembro?</span>
                            <span className="text-[#064E3B] border-b-2 border-[#FFD700]">Retornar al Acceso</span>
                        </Link>
                    </div>
                </div>

                <p className="mt-12 text-center text-[#94A3B8] text-[9px] uppercase tracking-[0.4em] font-medium">
                    Sports Analytics Portfolio &copy; 2026
                </p>
            </div>
        </div>
    );
}
