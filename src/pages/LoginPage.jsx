import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Loader2, Lock, User, Eye, EyeOff } from 'lucide-react';

const LoginPage = ({ onNavigateToRegister }) => {
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [processing, setProcessing] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username.trim() || !password.trim()) return;
        setProcessing(true);
        setError('');
        try {
            await login(username, password);
        } catch (err) {
            setError(err.message);
        } disableFinally: {
            setProcessing(false);
        }
    };

    return (
        <div className="h-full flex flex-col justify-center bg-slate-50 p-6 max-w-sm w-full mx-auto select-none">
            <div className="text-center space-y-2 mb-8">
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">Patitas<span className="text-teal-500">Match</span></h1>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Inicia Sesión para Continuar</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm space-y-4 text-left">
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Usuario</label>
                    <div className="relative">
                        <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Introduce tu usuario..."
                            className="w-full bg-slate-50 border border-slate-100 pl-10 pr-4 py-3 rounded-2xl text-xs font-medium text-slate-700 focus:outline-none focus:border-teal-400"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Contraseña</label>
                    <div className="relative">
                        <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Introduce tu contraseña..."
                            className="w-full bg-slate-50 border border-slate-100 pl-10 pr-12 py-3 rounded-2xl text-xs font-medium text-slate-700 focus:outline-none focus:border-teal-400"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>

                {error && (
                    <p className="text-[11px] font-bold text-red-500 bg-red-50 border border-red-100 p-2.5 rounded-xl text-center">
                        {error === "Incorrect credentials" ? "Usuario o clave invalida" : error}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full py-3.5 bg-slate-800 text-white font-bold rounded-2xl text-sm transition-all hover:bg-slate-900 active:scale-[0.99] flex items-center justify-center gap-2 shadow-md"
                >
                    {processing && <Loader2 size={16} className="animate-spin" />}
                    Ingresar
                </button>
            </form>

            <p className="text-xs font-semibold text-slate-400 mt-6 text-center">
                ¿No tienes cuenta?{' '}
                <button onClick={onNavigateToRegister} className="text-teal-500 font-bold hover:underline">
                    Regístrate aquí
                </button>
            </p>
        </div>
    );
};

export default LoginPage;