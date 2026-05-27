import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Settings, Shield, LogOut, Loader2, CheckCircle2, ShieldAlert } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const ProfilePage = ({ onNavigateToPrivacy }) => {
    const { user, logout, refreshUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState(false);

    const [size, setSize] = useState([]);
    const [energyLevel, setEnergyLevel] = useState([]);
    const [lifeStage, setLifeStage] = useState([]);
    const [hasYard, setHasYard] = useState(false);

    useEffect(() => {
        if (user) {
            setSize(user.preferences?.size || []);
            setEnergyLevel(user.preferences?.energy_level || []);
            setLifeStage(user.preferences?.life_stage || []);
            setHasYard(!!user.preferences?.has_yard);
            setLoading(false);
        }
    }, [user]);

    const handleTogglePreference = (value, currentArray, setArray) => {
        if (currentArray.includes(value)) {
            setArray(currentArray.filter(item => item !== value));
        } else {
            setArray([...currentArray, value]);
        }
    };

    const handleSaveChanges = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${API_BASE_URL}/users/profile/preferences`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    size,
                    energy_level: energyLevel,
                    life_stage: lifeStage,
                    has_yard: hasYard,
                    role: user.role
                })
            });

            if (response.ok) {
                setSuccessMessage(true);
                await refreshUser();
                setTimeout(() => setSuccessMessage(false), 2500);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-slate-50 gap-2">
                <Loader2 size={28} className="text-slate-400 animate-spin" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cargando Perfil...</span>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-slate-50 overflow-y-auto pb-8">
            <div className="bg-white border-b border-slate-100 px-4 py-4 shrink-0">
                <h1 className="text-2xl font-black text-slate-800 tracking-tight">Mi Perfil</h1>
                <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mt-0.5">Configuraciones</p>
            </div>

            <div className="p-4 flex flex-col gap-6 max-w-sm w-full mx-auto">
                <div className="flex flex-col items-center text-center mt-2">
                    <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center text-3xl border-4 border-white shadow-md mb-3 text-slate-500">
                        👤
                    </div>
                    <h2 className="text-lg font-black text-slate-800 tracking-tight">{user?.name}</h2>
                    <span className="text-[11px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md mt-1">
                        @{user?.username} ({user?.role === 'standard' ? 'Adoptante' : user?.role === 'rescuer' ? 'Rescatista' : 'Fundación'})
                    </span>
                </div>

                {user?.role === 'foundation' ? (
                    <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-[0_4px_12px_rgba(0,0,0,0.02)] flex flex-col items-center text-center gap-2">
                        <ShieldAlert size={28} className="text-teal-500" />
                        <h3 className="text-sm font-black text-slate-800 tracking-tight">Cuenta Institucional</h3>
                        <p className="text-xs font-medium text-slate-400 leading-relaxed max-w-[240px]">
                            Las fundaciones gestionan reportes de emergencia y el catálogo de adopciones. No requieren configurar preferencias de afinidad.
                        </p>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl border border-slate-100 p-4 shadow-[0_4px_12px_rgba(0,0,0,0.02)] space-y-5">
                        <div className="flex items-center gap-2 border-b border-slate-50 pb-2">
                            <Settings size={18} className="text-teal-500" />
                            <h3 className="text-sm font-black text-slate-800 tracking-tight">Preferencias de Búsqueda</h3>
                        </div>

                        <div className="space-y-2 text-left">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Tamaño</span>
                            <div className="grid grid-cols-3 gap-2">
                                {['small', 'medium', 'large'].map((opt) => (
                                    <button
                                        key={opt}
                                        onClick={() => handleTogglePreference(opt, size, setSize)}
                                        className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${size.includes(opt) ? 'border-orange-500 text-orange-600 bg-orange-50/10 font-black' : 'border-slate-100 text-slate-400 bg-white'
                                            }`}
                                    >
                                        {opt === 'small' ? 'Pequeño' : opt === 'medium' ? 'Mediano' : 'Grande'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2 text-left">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Nivel de Energía</span>
                            <div className="grid grid-cols-3 gap-2">
                                {['low', 'medium', 'high'].map((opt) => (
                                    <button
                                        key={opt}
                                        onClick={() => handleTogglePreference(opt, energyLevel, setEnergyLevel)}
                                        className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${energyLevel.includes(opt) ? 'border-orange-500 text-orange-600 bg-orange-50/10 font-black' : 'border-slate-100 text-slate-400 bg-white'
                                            }`}
                                    >
                                        {opt === 'low' ? 'Baja' : opt === 'medium' ? 'Media' : 'Alta'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2 text-left">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Etapa de Vida</span>
                            <div className="grid grid-cols-3 gap-2">
                                {['young', 'adult', 'senior'].map((opt) => (
                                    <button
                                        key={opt}
                                        onClick={() => handleTogglePreference(opt, lifeStage, setLifeStage)}
                                        className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${lifeStage.includes(opt) ? 'border-orange-500 text-orange-600 bg-orange-50/10 font-black' : 'border-slate-100 text-slate-400 bg-white'
                                            }`}
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

                        {successMessage && (
                            <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold p-3 rounded-xl flex items-center gap-2 animate-in fade-in duration-200">
                                <CheckCircle2 size={16} />
                                <span>Cambios guardados con éxito.</span>
                            </div>
                        )}

                        <button
                            onClick={handleSaveChanges}
                            disabled={saving}
                            className="w-full py-3.5 bg-slate-800 text-white font-bold rounded-2xl text-sm transition-all hover:bg-slate-900 active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {saving && <Loader2 size={16} className="animate-spin" />}
                            Guardar Cambios
                        </button>
                    </div>
                )}

                <div className="space-y-2.5">
                    <button
                        onClick={onNavigateToPrivacy}
                        className="w-full bg-white border border-slate-100 p-4 rounded-2xl shadow-sm flex items-center justify-between text-left hover:bg-slate-100/50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center border border-slate-100">
                                <Shield size={16} />
                            </div>
                            <span className="text-xs font-bold text-slate-700">Privacidad de la cuenta</span>
                        </div>
                    </button>

                    <button
                        onClick={logout}
                        className="w-full bg-white border border-slate-100 p-4 rounded-2xl shadow-sm flex items-center justify-between text-left hover:bg-red-50/30 transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-red-50/50 text-red-500 flex items-center justify-center border border-red-100/50">
                                <LogOut size={16} />
                            </div>
                            <span className="text-xs font-bold text-red-500 group-hover:text-red-600">Cerrar Sesión</span>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;