import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import Button from '../components/Button';

const LOGIN_ATTEMPTS_STORAGE_KEY = 'loginAttemptsState';
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_LOCK_SECONDS = 120;

const LoginPage = () => {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockUntil, setLockUntil] = useState(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const savedState = localStorage.getItem(LOGIN_ATTEMPTS_STORAGE_KEY);
    if (!savedState) {
      return;
    }

    try {
      const parsedState = JSON.parse(savedState);
      if (typeof parsedState.failedAttempts === 'number') {
        setFailedAttempts(parsedState.failedAttempts);
      }

      if (typeof parsedState.lockUntil === 'number' && parsedState.lockUntil > Date.now()) {
        setLockUntil(parsedState.lockUntil);
      }
    } catch {
      localStorage.removeItem(LOGIN_ATTEMPTS_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (!lockUntil) {
      setRemainingSeconds(0);
      return;
    }

    const updateCountdown = () => {
      const secondsLeft = Math.max(0, Math.ceil((lockUntil - Date.now()) / 1000));
      setRemainingSeconds(secondsLeft);

      if (secondsLeft === 0) {
        setLockUntil(null);
        setFailedAttempts(0);
        localStorage.removeItem(LOGIN_ATTEMPTS_STORAGE_KEY);
      }
    };

    updateCountdown();
    const intervalId = setInterval(updateCountdown, 1000);

    return () => clearInterval(intervalId);
  }, [lockUntil]);

  const isLocked = useMemo(() => lockUntil && lockUntil > Date.now(), [lockUntil]);

  const persistAttemptsState = (attempts, lockTimestamp = null) => {
    localStorage.setItem(
      LOGIN_ATTEMPTS_STORAGE_KEY,
      JSON.stringify({
        failedAttempts: attempts,
        lockUntil: lockTimestamp,
      })
    );
  };

  const clearAttemptsState = () => {
    setFailedAttempts(0);
    setLockUntil(null);
    setRemainingSeconds(0);
    localStorage.removeItem(LOGIN_ATTEMPTS_STORAGE_KEY);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLocked) {
      setError(`Demasiados intentos fallidos. Intenta nuevamente en ${remainingSeconds}s.`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authService.login(userName, password);

      if (!response.data) {
        setError('No se recibio informacion de usuario.');
        return;
      }

      login(
        response.data,
        response.data.accessToken,
        response.data.refreshToken
      );

      clearAttemptsState();

      if (remember) {
        localStorage.setItem('rememberUserName', userName);
      } else {
        localStorage.removeItem('rememberUserName');
      }

      navigate('/dashboard');
    } catch (err) {
      console.error(err);

      const nextFailedAttempts = failedAttempts + 1;

      if (nextFailedAttempts >= MAX_LOGIN_ATTEMPTS) {
        const nextLockUntil = Date.now() + LOGIN_LOCK_SECONDS * 1000;
        setLockUntil(nextLockUntil);
        setFailedAttempts(0);
        persistAttemptsState(0, nextLockUntil);
        setError(`Demasiados intentos fallidos. Tu acceso se bloqueo por ${LOGIN_LOCK_SECONDS} segundos.`);
      } else {
        setFailedAttempts(nextFailedAttempts);
        persistAttemptsState(nextFailedAttempts, null);

        const attemptsRemaining = MAX_LOGIN_ATTEMPTS - nextFailedAttempts;
        const baseError = err.response?.data?.message || err.message || 'Credenciales invalidas';
        setError(`${baseError}. Intentos restantes: ${attemptsRemaining}.`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-5">
        <section className="relative hidden lg:col-span-3 lg:flex overflow-hidden bg-gradient-to-br from-[#0A5FFF] via-blue-600 to-[#7C3AED] p-12 text-white">
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/10 blur-2xl animate-pulse" />
          <div className="absolute -bottom-20 left-10 h-64 w-64 rounded-full bg-white/10 blur-2xl animate-pulse" />

          <div className="relative z-10 flex h-full w-full flex-col justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-blue-100">Palladium Parking</p>
              <h1 className="mt-4 text-5xl font-extrabold leading-tight">Control inteligente de parqueo</h1>
              <p className="mt-6 max-w-xl text-blue-100 text-lg leading-relaxed">
                Gestiona entradas, salidas, caja y suscripciones en un solo panel, con trazabilidad completa y cobro eficiente.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-xl">
              <div className="rounded-2xl bg-white/12 border border-white/20 p-4 backdrop-blur-sm">
                <p className="text-2xl">🚗</p>
                <p className="mt-2 font-semibold">Sesiones en tiempo real</p>
                <p className="text-sm text-blue-100 mt-1">Visualiza y cierra sesiones con cobro inmediato.</p>
              </div>
              <div className="rounded-2xl bg-white/12 border border-white/20 p-4 backdrop-blur-sm">
                <p className="text-2xl">💵</p>
                <p className="mt-2 font-semibold">Caja diaria</p>
                <p className="text-sm text-blue-100 mt-1">Apertura, cierre e historial de movimientos.</p>
              </div>
              <div className="rounded-2xl bg-white/12 border border-white/20 p-4 backdrop-blur-sm">
                <p className="text-2xl">🧾</p>
                <p className="mt-2 font-semibold">Suscripciones</p>
                <p className="text-sm text-blue-100 mt-1">Control de planes activos por placa.</p>
              </div>
              <div className="rounded-2xl bg-white/12 border border-white/20 p-4 backdrop-blur-sm">
                <p className="text-2xl">📊</p>
                <p className="mt-2 font-semibold">Métricas clave</p>
                <p className="text-sm text-blue-100 mt-1">Indicadores operativos para decisiones rápidas.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="col-span-1 lg:col-span-2 flex items-center justify-center p-6 md:p-10 bg-[#F9FAFB]">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-xl shadow-slate-200/60 p-8 md:p-10">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-[#1F2937]">Iniciar Sesión</h2>
              <p className="text-slate-500 mt-2">Ingresa para continuar al panel de control.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="userName" className="block text-sm font-medium text-[#1F2937] mb-2">Usuario o email</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21a8 8 0 0 0-16 0" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </span>
                  <input
                    id="userName"
                    name="userName"
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="correo@empresa.com"
                    required
                    disabled={loading || isLocked}
                    className="w-full pl-11 pr-4 py-3 bg-white text-[#1F2937] border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#1F2937] mb-2">Contraseña</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="4" y="11" width="16" height="9" rx="2" />
                      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                    </svg>
                  </span>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={loading || isLocked}
                    className="w-full pl-11 pr-4 py-3 bg-white text-[#1F2937] border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="inline-flex items-center gap-2 text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-[#0A5FFF] focus:ring-blue-400"
                  />
                  Recuérdame
                </label>
                <button type="button" className="text-slate-600 hover:text-[#0A5FFF] font-medium transition">¿Olvidaste tu contraseña?</button>
              </div>

              {!isLocked && failedAttempts > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl text-sm">
                  Intentos fallidos: {failedAttempts}/{MAX_LOGIN_ATTEMPTS}.
                </div>
              )}

              {isLocked && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-sm">
                  Login bloqueado temporalmente. Reintenta en {remainingSeconds}s.
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading || isLocked}
                loading={loading}
                className="w-full"
              >
                {isLocked ? `Bloqueado (${remainingSeconds}s)` : 'Ingresar'}
              </Button>

              <p className="text-center text-sm text-slate-600">
                ¿No tienes cuenta?{' '}
                <button type="button" className="font-semibold text-[#0A5FFF] hover:text-[#7C3AED] transition">
                  Crear cuenta
                </button>
              </p>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LoginPage;