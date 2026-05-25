import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Loader2, Lock, User, FileText, Phone, ArrowRight, ArrowLeft } from 'lucide-react';
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const RegisterPage = ({ onNavigateToLogin }) => {
    const { login } = useAuth();
    const [step, setStep] = useState(1);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [role, setRole] = useState('standard');

    const [size, setSize] = useState(['medium']);
    const [energyLevel, setEnergyLevel] = useState(['medium']);
    const [lifeStage, setLifeStage] = useState(['adult']);
    const [hasYard, setHasYard] = useState(false);

    const [error, setError] = useState('');
    const [processing, setProcessing] = useState(false);

    const handleToggleArrayPreference = (value, currentArray, setArray) => {
        if (currentArray.includes(value)) {
            setArray(currentArray.filter(item => item !== value));
        } else {
            setArray([...currentArray, value]);
        }
    };

    const handleValidateStepOne = (e) => {
        e.preventDefault();
        if (!username.trim() || !password.trim() || !confirmPassword.trim() || !name.trim()) return;
        setError('');

        if (password !== confirmPassword) {
            setError('Las contraseñas ingresadas no coinciden.');
            return;
        }

        if (phone.trim()) {
            const phoneRegex = /^(?:\+?58|0)?(?:412|414|424|416|426)\d{7}$/;
            if (!phoneRegex.test(phone.trim())) {
                setError('El formato del número telefónico no es válido (Ej: 04121234567).');
                return;
            }
        }

        setStep(2);
    };

    const executeFinalRegistrationWorkflow = async () => {
        setError('');
        setProcessing(true);

        try {
            const registrationPayload = {
                username: username.trim(),
                password: password,
                name: name.trim(),
                role: role,
                phone: phone.trim() || null,
                preferences: role === 'standard' ? {
                    size,
                    energy_level: energyLevel,
                    life_stage: lifeStage,
                    has_yard: hasYard
                } : null
            };

            const registrationResponse = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(registrationPayload)
            });

            if (!registrationResponse.ok) {
                const failureContext = await registrationResponse.json();
                throw new Error(failureContext.detail || 'Ocurrió un error inesperado durante el registro.');
            }

            await login(username.trim(), password);

        } catch (apiError) {
            setError(apiError.message);
            setProcessing(false);
        }
    };

    return (
        <div className="w-full max-w-sm bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100/40 text-slate-700 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center justify-center text-center gap-1.5 mb-6">
                <div className="w-11 h-11 bg-teal-50 text-teal-500 rounded-2xl flex items-center justify-center text-xl font-black border border-teal-100 shadow-inner">
                    🐾
                </div>
                <h1 className="text-xl font-black text-slate-800 tracking-tight">Crea tu cuenta</h1>
                <p className="text-xs font-semibold text-slate-400">Paso {step} de 2 — {step === 1 ? 'Datos de perfil' : 'Tus preferencias'}</p>
            </div>

            {error && (
                <div className="mb-4 bg-red-50 border border-red-100 text-red-500 text-[11px] font-bold px-4 py-3 rounded-xl text-left">
                    {error}
                </div>
            )}

            {step === 1 && (
                <form onSubmit={handleValidateStepOne} className="space-y-3.5">
                    <div className="space-y-1 text-left">
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 pl-1">Nombre Completo</label>
                        <div className="relative">
                            <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Ej. Juan Pérez"
                                className="w-full bg-slate-50 border border-slate-100/80 rounded-xl pl-10 pr-4 py-3 text-xs font-medium focus:outline-none focus:border-teal-400 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400/80"
                            />
                        </div>
                    </div>

                    <div className="space-y-1 text-left">
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 pl-1">Nombre de Usuario</label>
                        <div className="relative">
                            <FileText size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Ej. juan99"
                                className="w-full bg-slate-50 border border-slate-100/80 rounded-xl pl-10 pr-4 py-3 text-xs font-medium focus:outline-none focus:border-teal-400 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400/80"
                            />
                        </div>
                    </div>

                    <div className="space-y-1 text-left">
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 pl-1">Teléfono Móvil (Opcional)</label>
                        <div className="relative">
                            <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="Ej. 04121234567"
                                className="w-full bg-slate-50 border border-slate-100/80 rounded-xl pl-10 pr-4 py-3 text-xs font-medium focus:outline-none focus:border-teal-400 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400/80"
                            />
                        </div>
                    </div>

                    <div className="space-y-1 text-left">
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 pl-1">Contraseña</label>
                        <div className="relative">
                            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Mínimo 6 caracteres"
                                className="w-full bg-slate-50 border border-slate-100/80 rounded-xl pl-10 pr-4 py-3 text-xs font-medium focus:outline-none focus:border-teal-400 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400/80"
                            />
                        </div>
                    </div>

                    <div className="space-y-1 text-left">
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 pl-1">Confirmar Contraseña</label>
                        <div className="relative">
                            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Repite tu contraseña"
                                className="w-full bg-slate-50 border border-slate-100/80 rounded-xl pl-10 pr-4 py-3 text-xs font-medium focus:outline-none focus:border-teal-400 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400/80"
                            />
                        </div>
                    </div>

                    <div className="space-y-1 text-left">
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 pl-1">Tipo de Perfil</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setRole('standard')}
                                className={`py-3 text-xs font-bold rounded-xl border transition-all ${role === 'standard' ? 'bg-teal-50 border-teal-300 text-teal-600 shadow-sm' : 'bg-slate-50 border-slate-100 hover:bg-slate-100 text-slate-500'}`}
                            >
                                Adoptante
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('rescuer')}
                                className={`py-3 text-xs font-bold rounded-xl border transition-all ${role === 'rescuer' ? 'bg-teal-50 border-teal-300 text-teal-600 shadow-sm' : 'bg-slate-50 border-slate-100 hover:bg-slate-100 text-slate-500'}`}
                            >
                                Rescatista / Fundación
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={!username.trim() || !password.trim() || !confirmPassword.trim() || !name.trim()}
                        className="w-full py-3.5 bg-teal-500 hover:bg-teal-600 disabled:opacity-40 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 shadow-lg shadow-teal-500/10 active:scale-[0.98] transition-all mt-2"
                    >
                        Siguiente Paso <ArrowRight size={14} />
                    </button>
                </form>
            )}

            {step === 2 && (
                <div className="space-y-5 animate-in fade-in duration-200">
                    {role === 'standard' ? (
                        <div className="space-y-4">
                            <p className="text-left text-[11px] font-semibold text-slate-400 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                                Cuéntanos qué buscas en tu compañero ideal. Usaremos estos datos para alimentar nuestro algoritmo inteligente de compatibilidad.
                            </p>

                            <div className="space-y-1.5 text-left">
                                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 pl-1">Tamaño preferido</label>
                                <div className="grid grid-cols-3 gap-1.5">
                                    {['small', 'medium', 'large'].map((s) => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => handleToggleArrayPreference(s, size, setSize)}
                                            className={`py-2 text-[11px] font-bold rounded-lg border uppercase tracking-wider transition-all ${size.includes(s) ? 'bg-slate-800 border-slate-800 text-white shadow-sm' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                                        >
                                            {s === 'small' ? 'Pequeño' : s === 'medium' ? 'Mediano' : 'Grande'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-1.5 text-left">
                                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 pl-1">Nivel de Energía</label>
                                <div className="grid grid-cols-3 gap-1.5">
                                    {['low', 'medium', 'high'].map((e) => (
                                        <button
                                            key={e}
                                            type="button"
                                            onClick={() => handleToggleArrayPreference(e, energyLevel, setEnergyLevel)}
                                            className={`py-2 text-[11px] font-bold rounded-lg border uppercase tracking-wider transition-all ${energyLevel.includes(e) ? 'bg-slate-800 border-slate-800 text-white shadow-sm' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                                        >
                                            {e === 'low' ? 'Bajo' : e === 'medium' ? 'Moderado' : 'Alto'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-1.5 text-left">
                                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 pl-1">Etapa de Vida</label>
                                <div className="grid grid-cols-3 gap-1.5">
                                    {['puppy', 'adult', 'senior'].map((l) => (
                                        <button
                                            key={l}
                                            type="button"
                                            onClick={() => handleToggleArrayPreference(l, lifeStage, setLifeStage)}
                                            className={`py-2 text-[11px] font-bold rounded-lg border uppercase tracking-wider transition-all ${lifeStage.includes(l) ? 'bg-slate-800 border-slate-800 text-white shadow-sm' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                                        >
                                            {l === 'puppy' ? 'Cachorro' : l === 'adult' ? 'Adulto' : 'Senior'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-1.5 text-left">
                                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 pl-1">Entorno del Hogar</label>
                                <button
                                    type="button"
                                    onClick={() => setHasYard(!hasYard)}
                                    className={`w-full py-2.5 text-xs font-bold rounded-xl border transition-all ${hasYard ? 'bg-teal-50 border-teal-200 text-teal-600 shadow-sm' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                                >
                                    {hasYard ? '✓ Tengo patio o jardín espacioso' : 'No poseo patio / vivo en apartamento'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3 py-6 text-center">
                            <p className="text-xs font-semibold text-slate-500 leading-relaxed max-w-[260px] mx-auto">
                                Como cuenta de <span className="text-teal-500 font-bold">Rescatista / Fundación</span>, tendrás acceso al panel para publicar animales rescatados en tiempo real y gestionar reportes ciudadanos basados en Inteligencia Artificial.
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-50">
                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="col-span-1 py-3 bg-slate-50 border border-slate-100 hover:bg-slate-100 text-slate-500 font-bold rounded-xl text-xs flex items-center justify-center gap-1 active:scale-[0.98] transition-all"
                        >
                            <ArrowLeft size={14} /> Atrás
                        </button>
                        <button
                            type="button"
                            onClick={executeFinalRegistrationWorkflow}
                            disabled={processing}
                            className="col-span-2 py-3 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 shadow-md shadow-teal-500/10 active:scale-[0.98] transition-all"
                        >
                            {processing && <Loader2 size={14} className="animate-spin" />}
                            Finalizar Registro
                        </button>
                    </div>
                </div>
            )}

            <p className="text-xs font-semibold text-slate-400 mt-4 mb-4 text-center">
                ¿Ya tienes una cuenta?{' '}
                <button onClick={onNavigateToLogin} className="text-teal-500 font-bold hover:underline">
                    Inicia sesión
                </button>
            </p>
        </div>
    );
};

export default RegisterPage;