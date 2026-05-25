import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Loader2, Lock, User, FileText, Phone, ArrowRight, ArrowLeft } from 'lucide-react';

const RegisterPage = ({ onNavigateToLogin }) => {
    const { login } = useAuth();
    const [step, setStep] = useState(1);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
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
        if (!username.trim() || !password.trim() || !name.trim()) return;
        setError('');

        if (phone.trim()) {
            const phoneRegex = /^(?:\+?58|0)?(?:412|414|424|416|426)\d{7}$/;
            if (!phoneRegex.test(phone.trim())) {
                setError('El número telefónico no es válido. Usa un formato correcto (Ej: 04121234567).');
                return;
            }
        }

        if (role === 'foundation') {
            executeFinalRegistrationWorkflow();
        } else {
            setStep(2);
        }
    };

    const executeFinalRegistrationWorkflow = async () => {
        setProcessing(true);
        setError('');

        const finalPayload = {
            username: username.trim(),
            password,
            name: name.trim(),
            role,
            phone: phone.trim() || null,
            size_preference: role !== 'foundation' ? size.join(',') : null,
            energy_preference: role !== 'foundation' ? energyLevel.join(',') : null,
            stage_preference: role !== 'foundation' ? lifeStage.join(',') : null,
            has_yard: role !== 'foundation' ? hasYard : false
        };

        try {
            const response = await fetch('http://localhost:8000/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(finalPayload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Error al procesar el registro');
            }

            await login(username.trim(), password);
        } catch (err) {
            setError(err.message);
            setProcessing(false);
        }
    };

    return (
        <div className="h-full flex flex-col justify-center bg-slate-50 p-6 max-w-sm w-full mx-auto select-none overflow-y-auto">
            <div className="text-center space-y-2 mb-6 mt-4">
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">Patitas<span className="text-teal-500">Match</span></h1>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {step === 1 ? 'Crea tu Cuenta' : 'Preferencias de Búsqueda'}
                </p>
            </div>

            {step === 1 ? (
                <form onSubmit={handleValidateStepOne} className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm space-y-3.5 text-left">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Nombre Completo / Institución</label>
                        <div className="relative">
                            <FileText size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Ej: Juan Pérez o Refugio Patitas..."
                                className="w-full bg-slate-50 border border-slate-100 pl-10 pr-4 py-2.5 rounded-2xl text-xs font-medium text-slate-700 focus:outline-none focus:border-teal-400"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Nombre de Usuario</label>
                        <div className="relative">
                            <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Elige un identificador..."
                                className="w-full bg-slate-50 border border-slate-100 pl-10 pr-4 py-2.5 rounded-2xl text-xs font-medium text-slate-700 focus:outline-none focus:border-teal-400"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Teléfono de Contacto</label>
                        <div className="relative">
                            <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="Ej: 04121234567..."
                                className="w-full bg-slate-50 border border-slate-100 pl-10 pr-4 py-2.5 rounded-2xl text-xs font-medium text-slate-700 focus:outline-none focus:border-teal-400"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Contraseña</label>
                        <div className="relative">
                            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Mínimo 6 caracteres..."
                                className="w-full bg-slate-50 border border-slate-100 pl-10 pr-4 py-2.5 rounded-2xl text-xs font-medium text-slate-700 focus:outline-none focus:border-teal-400"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Tipo de Perfil</label>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { id: 'standard', label: 'Adoptante' },
                                { id: 'rescuer', label: 'Rescatista' },
                                { id: 'foundation', label: 'Fundación' }
                            ].map((opt) => (
                                <button
                                    type="button"
                                    key={opt.id}
                                    onClick={() => setRole(opt.id)}
                                    className={`py-2 px-1 rounded-xl text-[10px] font-bold uppercase border transition-all ${role === opt.id
                                        ? 'border-teal-500 bg-teal-50 text-teal-600 font-black'
                                        : 'border-slate-200 text-slate-400 bg-white'
                                        }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <p className="text-[11px] font-bold text-red-500 bg-red-50 border border-red-100 p-2 rounded-xl text-center">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full py-3.5 bg-slate-800 text-white font-bold rounded-2xl text-sm transition-all hover:bg-slate-900 active:scale-[0.99] flex items-center justify-center gap-2 shadow-md"
                    >
                        {processing ? <Loader2 size={16} className="animate-spin" /> : (role === 'foundation' ? 'Registrar' : 'Siguiente')}
                        {role !== 'foundation' && <ArrowRight size={14} />}
                    </button>
                </form>
            ) : (
                <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm space-y-4 text-left">
                    <div className="space-y-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Tamaño Preferido</span>
                        <div className="grid grid-cols-3 gap-2">
                            {['small', 'medium', 'large'].map((opt) => (
                                <button
                                    type="button"
                                    key={opt}
                                    onClick={() => handleToggleArrayPreference(opt, size, setSize)}
                                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${size.includes(opt) ? 'border-orange-500 text-orange-600 bg-orange-50/10 font-black' : 'border-slate-100 text-slate-400 bg-white'}`}
                                >
                                    {opt === 'small' ? 'Pequeño' : opt === 'medium' ? 'Mediano' : 'Grande'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Nivel de Energía</span>
                        <div className="grid grid-cols-3 gap-2">
                            {['low', 'medium', 'high'].map((opt) => (
                                <button
                                    type="button"
                                    key={opt}
                                    onClick={() => handleToggleArrayPreference(opt, energyLevel, setEnergyLevel)}
                                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${energyLevel.includes(opt) ? 'border-orange-500 text-orange-600 bg-orange-50/10 font-black' : 'border-slate-100 text-slate-400 bg-white'}`}
                                >
                                    {opt === 'low' ? 'Baja' : opt === 'medium' ? 'Media' : 'Alta'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Etapa de Vida</span>
                        <div className="grid grid-cols-3 gap-2">
                            {['young', 'adult', 'senior'].map((opt) => (
                                <button
                                    type="button"
                                    key={opt}
                                    onClick={() => handleToggleArrayPreference(opt, lifeStage, setLifeStage)}
                                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${lifeStage.includes(opt) ? 'border-orange-500 text-orange-600 bg-orange-50/10 font-black' : 'border-slate-100 text-slate-400 bg-white'}`}
                                >
                                    {opt === 'young' ? 'Joven' : opt === 'adult' ? 'Adulto' : 'Mayor'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-50 pt-3">
                        <span className="text-xs font-bold text-slate-600">¿Tienes patio en casa?</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={hasYard}
                                onChange={(e) => setHasYard(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                        </label>
                    </div>

                    {error && (
                        <p className="text-[11px] font-bold text-red-500 bg-red-50 border border-red-100 p-2 rounded-xl text-center">
                            {error}
                        </p>
                    )}

                    <div className="grid grid-cols-3 gap-2 pt-2">
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