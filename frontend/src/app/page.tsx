import Link from 'next/link';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0D1117] text-white font-sans overflow-x-hidden">

      {/* ── Grid background ── */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(200,162,82,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(200,162,82,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
      <div className="fixed top-0 right-0 w-[800px] h-[600px] bg-[#1B365D]/20 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
      <div className="fixed bottom-0 left-0 w-[600px] h-[400px] bg-[#C8A252]/8 rounded-full blur-[100px] pointer-events-none translate-y-1/2 -translate-x-1/4" />

      {/* ══════════════════ NAV ══════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 lg:px-12 py-4 flex justify-between items-center border-b border-white/[0.06] bg-[#0D1117]/80 backdrop-blur-xl">
        <Link href="/" className="flex items-center">
          <Image src="/logo.png" alt="FutbolIA" width={180} height={48} className="h-10 w-auto object-contain brightness-0 invert" priority />
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
          <a href="#metodologia" className="hover:text-white transition-colors">Metodología</a>
          <a href="#rendimiento" className="hover:text-white transition-colors">Rendimiento</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden sm:block px-4 py-2 text-sm font-semibold text-white/70 hover:text-white transition-colors">
            Iniciar sesión
          </Link>
          <Link
            href="/register"
            className="px-5 py-2.5 rounded-full text-sm font-bold bg-[#C8A252] text-[#0D1117] hover:bg-[#d4b06a] transition-all shadow-[0_0_20px_rgba(200,162,82,0.25)]"
          >
            Registrarse →
          </Link>
        </div>
      </nav>

      {/* ══════════════════ HERO ══════════════════ */}
      <section className="relative z-10 pt-36 lg:pt-44 pb-24 px-6 lg:px-12 max-w-6xl mx-auto">

        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#C8A252]/30 bg-[#C8A252]/10 text-[#C8A252] text-xs font-bold uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C8A252] animate-pulse" />
            La Liga 2026/27 · Análisis en tiempo real
          </div>
        </div>

        <h1 className="text-center text-5xl lg:text-7xl font-bold leading-[1.05] mb-6 tracking-tight">
          Predicción de fútbol{' '}
          <br className="hidden lg:block" />
          con{' '}
          <span className="text-[#C8A252]">Inteligencia Artificial</span>
        </h1>

        <p className="text-center text-lg lg:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
          Sistema de predicción de resultados deportivos basado en modelos de Machine Learning, Expected Goals (xG) y clasificaciones Elo dinámicas. Probabilidades 1X2 calculadas a partir de datos reales de La Liga.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
          <Link
            href="/register"
            className="px-8 py-4 rounded-full bg-[#C8A252] text-[#0D1117] font-bold text-base hover:bg-[#d4b06a] transition-all shadow-[0_0_40px_rgba(200,162,82,0.3)] flex items-center justify-center gap-2"
          >
            Crear cuenta
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <a
            href="#metodologia"
            className="px-8 py-4 rounded-full border border-white/15 text-white font-bold text-base hover:bg-white/5 transition-all flex items-center justify-center gap-2"
          >
            Ver metodología
          </a>
        </div>

        {/* ── Prediction card demo ── */}
        <div id="demo" className="relative max-w-3xl mx-auto">
          <div className="absolute inset-0 bg-gradient-to-b from-[#C8A252]/15 to-[#1B365D]/10 rounded-3xl blur-2xl" />
          <div className="relative bg-[#161B22] border border-white/10 rounded-3xl p-6 lg:p-10 overflow-hidden">

            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-white/40 text-xs uppercase tracking-widest mb-1">La Liga 2024/25 · Jornada 28</p>
                <h3 className="text-xl lg:text-2xl font-bold">Real Madrid vs Atlético de Madrid</h3>
                <p className="text-white/40 text-sm mt-1">9 mar 2025 · 21:00 h</p>
              </div>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#C8A252]/15 border border-[#C8A252]/30 text-[#C8A252] text-xs font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C8A252] animate-pulse" />
                Alta confianza
              </span>
            </div>

            {/* Probability bars */}
            <div className="grid grid-cols-3 gap-4 mb-6 p-5 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
              <div className="text-center">
                <p className="text-white/40 text-[10px] uppercase tracking-widest mb-2">Victoria local</p>
                <p className="text-2xl font-bold text-white mb-2">55%</p>
                <div className="h-1.5 bg-white/10 rounded-full">
                  <div className="h-full bg-[#C8A252] rounded-full" style={{ width: '55%' }} />
                </div>
              </div>
              <div className="text-center">
                <p className="text-white/40 text-[10px] uppercase tracking-widest mb-2">Empate</p>
                <p className="text-2xl font-bold text-white mb-2">22%</p>
                <div className="h-1.5 bg-white/10 rounded-full">
                  <div className="h-full bg-[#7BA7C9] rounded-full" style={{ width: '22%' }} />
                </div>
              </div>
              <div className="text-center">
                <p className="text-white/40 text-[10px] uppercase tracking-widest mb-2">Victoria visitante</p>
                <p className="text-2xl font-bold text-white mb-2">23%</p>
                <div className="h-1.5 bg-white/10 rounded-full">
                  <div className="h-full bg-white/30 rounded-full" style={{ width: '23%' }} />
                </div>
              </div>
            </div>

            {/* Model metrics */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'xG Local', value: '2.1' },
                { label: 'xG Visitante', value: '0.9' },
                { label: 'Elo Local', value: '1842' },
              ].map(({ label, value }) => (
                <div key={label} className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-center">
                  <p className="text-white/40 text-[10px] uppercase tracking-widest mb-1">{label}</p>
                  <p className="text-white font-bold text-sm">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════ METODOLOGÍA ══════════════════ */}
      <section id="metodologia" className="relative z-10 py-28 px-6 lg:px-12 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-[#C8A252] text-xs font-bold uppercase tracking-[0.25em] mb-4">Cómo funciona</p>
          <h2 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">Ciencia detrás de cada predicción</h2>
          <p className="text-white/50 max-w-2xl mx-auto">
            El modelo analiza más de 25 variables por partido para calcular probabilidades independientes basadas en datos históricos desde 2015.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[
            {
              num: '01',
              title: 'Ingesta de datos',
              desc: 'Actualizamos continuamente puntos Elo de clubes, estadísticas xG, historial de enfrentamientos directos, forma reciente de las últimas 6 jornadas, lesiones relevantes y contexto de competición.',
              highlight: '25+ variables por partido',
            },
            {
              num: '02',
              title: 'Modelo probabilístico',
              desc: 'Un ensamble de XGBoost y Random Forest calibrado con datos históricos de La Liga genera probabilidades para los resultados 1X2 y total de goles, midiendo la incertidumbre de cada predicción.',
              highlight: 'XGBoost + Random Forest',
            },
            {
              num: '03',
              title: 'Sistema Elo dinámico',
              desc: 'Cada equipo tiene una puntuación Elo que se actualiza tras cada partido según el resultado y el nivel del rival. Esta métrica captura la forma actual del equipo de forma cuantitativa.',
              highlight: 'Actualización jornada a jornada',
            },
            {
              num: '04',
              title: 'Validación continua',
              desc: 'Las predicciones se evalúan retrospectivamente usando el Brier Score, una métrica estándar de calibración probabilística que mide la precisión real de los porcentajes predichos.',
              highlight: 'Brier Score como métrica principal',
            },
          ].map(({ num, title, desc, highlight }) => (
            <div key={num} className="p-8 rounded-2xl bg-[#161B22] border border-white/[0.07] flex gap-6">
              <div className="shrink-0">
                <span className="text-4xl font-bold text-white/[0.06]">{num}</span>
              </div>
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1B365D]/30 border border-[#1B365D]/40 text-[#7BA7C9] text-[10px] font-bold uppercase tracking-widest mb-3">
                  {highlight}
                </div>
                <h3 className="font-bold text-lg text-white mb-2">{title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════ RENDIMIENTO ══════════════════ */}
      <section id="rendimiento" className="relative z-10 py-28 bg-[#0A0E13] border-y border-white/[0.05]">
        <div className="max-w-6xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <p className="text-[#C8A252] text-xs font-bold uppercase tracking-[0.25em] mb-4">Resultados</p>
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">Rendimiento del modelo</h2>
            <p className="text-white/50 max-w-xl mx-auto">
              Métricas de predicción validadas contra resultados reales de La Liga en los últimos tres meses.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {[
              { value: '82%', label: 'Precisión en partidos con alta confianza', color: 'text-[#C8A252]' },
              { value: '0.14', label: 'Brier Score promedio', color: 'text-white' },
              { value: '1.200+', label: 'Partidos analizados', color: 'text-white' },
              { value: '25+', label: 'Variables por partido', color: 'text-white' },
            ].map(({ value, label, color }) => (
              <div key={label} className="p-6 rounded-2xl bg-[#161B22] border border-white/[0.07] text-center">
                <div className={`text-4xl lg:text-5xl font-bold mb-2 ${color}`}>{value}</div>
                <div className="text-white/40 text-sm">{label}</div>
              </div>
            ))}
          </div>

          <div className="max-w-2xl mx-auto space-y-5">
            {[
              { label: 'Predicciones de alta confianza', pct: 82, color: 'bg-[#C8A252]', textColor: 'text-[#C8A252]' },
              { label: 'Predicciones de confianza media', pct: 71, color: 'bg-[#7BA7C9]', textColor: 'text-[#7BA7C9]' },
              { label: 'Predicciones de baja confianza', pct: 58, color: 'bg-white/30', textColor: 'text-white/50' },
            ].map(({ label, pct, color, textColor }) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/70 font-medium">{label}</span>
                  <span className={`font-bold ${textColor}`}>{pct}%</span>
                </div>
                <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                  <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ DATOS TÉCNICOS ══════════════════ */}
      <section className="relative z-10 py-28 px-6 lg:px-12 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-[#C8A252] text-xs font-bold uppercase tracking-[0.25em] mb-4">Tecnología</p>
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">Stack técnico</h2>
          <p className="text-white/50 max-w-xl mx-auto">
            Construido con herramientas modernas de análisis de datos y desarrollo web.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { name: 'Python', desc: 'Backend & ML' },
            { name: 'XGBoost', desc: 'Modelo principal' },
            { name: 'FastAPI', desc: 'API REST' },
            { name: 'Next.js', desc: 'Frontend' },
            { name: 'PostgreSQL', desc: 'Base de datos' },
            { name: 'Understat', desc: 'Fuente de datos' },
          ].map(({ name, desc }) => (
            <div key={name} className="p-5 rounded-2xl bg-[#161B22] border border-white/[0.07] text-center">
              <p className="font-bold text-white mb-1">{name}</p>
              <p className="text-white/40 text-xs">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════ FAQ ══════════════════ */}
      <section id="faq" className="relative z-10 py-28 px-6 lg:px-12 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-[#C8A252] text-xs font-bold uppercase tracking-[0.25em] mb-4">FAQ</p>
          <h2 className="text-4xl lg:text-5xl font-bold">Preguntas frecuentes</h2>
        </div>

        <div className="space-y-0 divide-y divide-white/[0.07]">
          {[
            {
              q: '¿Cómo calcula el modelo las probabilidades?',
              a: 'El modelo utiliza un ensamble de XGBoost y Random Forest alimentado con más de 25 variables por partido: Expected Goals (xG), clasificación Elo, historial de enfrentamientos, forma reciente, lesiones y ventaja local. La salida son probabilidades calibradas para los tres posibles resultados.',
            },
            {
              q: '¿Qué es el Brier Score?',
              a: 'El Brier Score es una métrica estándar para evaluar la calidad de las probabilidades predichas. Mide el error cuadrático medio entre la probabilidad estimada y el resultado real. Un Brier Score más bajo indica mayor precisión en las predicciones.',
            },
            {
              q: '¿Qué es el sistema Elo?',
              a: 'El sistema Elo es un método de clasificación desarrollado originalmente para el ajedrez. Aplicado al fútbol, asigna a cada equipo una puntuación numérica que sube o baja en función de los resultados y la fortaleza del rival. Permite medir la forma actual de cada equipo de forma cuantitativa.',
            },
            {
              q: '¿En qué competiciones está disponible?',
              a: 'Actualmente el sistema está especializado en La Liga española y cubre partidos de selecciones internacionales. Los datos se actualizan automáticamente tras cada jornada.',
            },
            {
              q: '¿Con qué frecuencia se actualiza el modelo?',
              a: 'El modelo se reentrena automáticamente tras cada jornada con los resultados más recientes. Las puntuaciones Elo y las métricas xG se actualizan en tiempo real después de cada partido.',
            },
          ].map(({ q, a }) => (
            <details key={q} className="group py-6 cursor-pointer list-none">
              <summary className="flex justify-between items-start gap-4 text-base font-semibold text-white list-none">
                <span>{q}</span>
                <svg className="w-5 h-5 text-white/40 shrink-0 mt-0.5 group-open:rotate-45 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
              </summary>
              <p className="mt-4 text-white/50 leading-relaxed text-sm pr-8">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ══════════════════ CTA FINAL ══════════════════ */}
      <section className="relative z-10 py-28 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1B365D]/10 via-[#C8A252]/5 to-transparent pointer-events-none" />
        <div className="relative max-w-3xl mx-auto">
          <p className="text-[#C8A252] text-xs font-bold uppercase tracking-[0.25em] mb-6">Empieza ahora</p>
          <h2 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
            El deporte{' '}
            <span className="text-white/40">son datos.</span>
          </h2>
          <p className="text-white/50 text-lg mb-10 max-w-xl mx-auto">
            Accede a las predicciones de La Liga basadas en modelos estadísticos y datos reales actualizados jornada a jornada.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="px-10 py-4 rounded-full bg-[#C8A252] text-[#0D1117] font-bold text-lg hover:bg-[#d4b06a] transition-all shadow-[0_0_50px_rgba(200,162,82,0.3)]"
            >
              Crear cuenta gratuita
            </Link>
            <Link
              href="/login"
              className="px-10 py-4 rounded-full border border-white/15 text-white font-bold text-lg hover:bg-white/5 transition-all"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════ FOOTER ══════════════════ */}
      <footer className="relative z-10 border-t border-white/[0.06] bg-[#0A0E13] py-16 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
            <div>
              <Image src="/logo.png" alt="FutbolIA" width={160} height={44} className="h-9 w-auto object-contain brightness-0 invert mb-4" />
              <p className="text-white/35 text-sm leading-relaxed max-w-xs">
                Sistema de predicción de resultados de fútbol basado en Machine Learning y estadísticas avanzadas.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-4">Plataforma</p>
                <ul className="space-y-3 text-sm text-white/35">
                  <li><a href="#metodologia" className="hover:text-white transition-colors">Metodología</a></li>
                  <li><a href="#rendimiento" className="hover:text-white transition-colors">Rendimiento</a></li>
                  <li><Link href="/register" className="hover:text-white transition-colors">Registrarse</Link></li>
                </ul>
              </div>
              <div>
                <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-4">Cuenta</p>
                <ul className="space-y-3 text-sm text-white/35">
                  <li><Link href="/login" className="hover:text-white transition-colors">Iniciar sesión</Link></li>
                  <li><Link href="/register" className="hover:text-white transition-colors">Crear cuenta</Link></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row justify-between items-center gap-4 text-white/25 text-xs">
            <span>© 2026 FutbolIA. Uso exclusivo para análisis estadístico.</span>
            <span>Datos: Understat · La Liga 2015–2026</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
