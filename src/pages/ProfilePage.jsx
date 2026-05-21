import { useState } from 'react';
import { Settings, Shield, LogOut, CheckCircle, Loader2, Home, Activity, Ruler, CalendarHeart } from 'lucide-react';
import { setPreferences } from '../services/api';

const MultiSelectOption = ({ label, value, currentArray, onToggle }) => {
    const isSelected = currentArray.includes(value);

    return (
        <button
            onClick={() => onToggle(value)}
            className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-bold border-2 transition-all ${isSelected
                    ? 'border-orange-500 bg-orange-50 text-orange-600 shadow-sm'
                    : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'
                }`}
        >
            {label}
        </button>
    );
};

const ProfilePage = () => {
    const [preferredSize, setPreferredSize] = useState(['medium']);
    const [preferredEnergy, setPreferredEnergy] = useState(['high']);
    const [preferredAge, setPreferredAge] = useState(['adult']);
    const [hasYard, setHasYard] = useState(false);
    const [saveStatus, setSaveStatus] = useState('idle');

    const toggleArrayItem = (array, setArray, value) => {
        if (array.includes(value)) {
            setArray(array.filter(item => item !== value));
        } else {
            setArray([...array, value]);
        }
    };

    const handleSavePreferences = async () => {
        setSaveStatus('saving');
        try {
            await setPreferences("user_tester_2026", {
                preferred_size: preferredSize,
                preferred_energy: preferredEnergy,
                preferred_age: preferredAge,
                has_yard: hasYard
            });
            setSaveStatus('success');
            setTimeout(() => setSaveStatus('idle'), 3000);
        } catch (error) {
            setSaveStatus('error');
            setTimeout(() => setSaveStatus('idle'), 3000);
        }
    };

    return (
        <div className="h-full flex flex-col bg-slate-50 overflow-hidden">
            <div className="bg-white border-b border-slate-100 px-4 py-4 flex items-center justify-between shrink-0 shadow-sm">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">Mi Perfil</h1>
                    <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mt-0.5">Configuraciones</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 max-w-sm w-full mx-auto space-y-6">
                <div className="flex flex-col items-center py-4">
                    <div className="w-20 h-20 bg-slate-200 rounded-full mb-3 border-4 border-white shadow-md flex items-center justify-center text-3xl select-none">
                        👤
                    </div>
                    <h2 className="text-lg font-black text-slate-800">Usuario Evaluador</h2>
                    <p className="text-slate-400 text-[10px] font-mono mt-1 bg-slate-100 px-2 py-0.5 rounded-md">ID: user_tester_2026</p>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-5">
                    <div className="flex items-center gap-2 mb-1">
                        <Settings size={18} className="text-orange-500" />
                        <h3 className="font-bold text-slate-700 text-sm">Preferencias de Adopción</h3>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-1">
                            <span className="flex items-center gap-1.5"><Ruler size={14} /> Tamaño</span>
                        </div>
                        <div className="flex gap-2">
                            <MultiSelectOption label="Pequeño" value="small" currentArray={preferredSize} onToggle={(v) => toggleArrayItem(preferredSize, setPreferredSize, v)} />
                            <MultiSelectOption label="Mediano" value="medium" currentArray={preferredSize} onToggle={(v) => toggleArrayItem(preferredSize, setPreferredSize, v)} />
                            <MultiSelectOption label="Grande" value="large" currentArray={preferredSize} onToggle={(v) => toggleArrayItem(preferredSize, setPreferredSize, v)} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-1">
                            <span className="flex items-center gap-1.5"><Activity size={14} /> Nivel de Energía</span>
                        </div>
                        <div className="flex gap-2">
                            <MultiSelectOption label="Baja" value="low" currentArray={preferredEnergy} onToggle={(v) => toggleArrayItem(preferredEnergy, setPreferredEnergy, v)} />
                            <MultiSelectOption label="Media" value="medium" currentArray={preferredEnergy} onToggle={(v) => toggleArrayItem(preferredEnergy, setPreferredEnergy, v)} />
                            <MultiSelectOption label="Alta" value="high" currentArray={preferredEnergy} onToggle={(v) => toggleArrayItem(preferredEnergy, setPreferredEnergy, v)} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-1">
                            <span className="flex items-center gap-1.5"><CalendarHeart size={14} /> Etapa de Vida</span>
                        </div>
                        <div className="flex gap-2">
                            <MultiSelectOption label="Cachorro" value="puppy" currentArray={preferredAge} onToggle={(v) => toggleArrayItem(preferredAge, setPreferredAge, v)} />
                            <MultiSelectOption label="Adulto" value="adult" currentArray={preferredAge} onToggle={(v) => toggleArrayItem(preferredAge, setPreferredAge, v)} />
                            <MultiSelectOption label="Mayor" value="senior" currentArray={preferredAge} onToggle={(v) => toggleArrayItem(preferredAge, setPreferredAge, v)} />
                        </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                            <Home size={16} className="text-slate-400" />
                            ¿Tienes patio en casa?
                        </div>
                        <button
                            onClick={() => setHasYard(!hasYard)}
                            className={`w-12 h-6 rounded-full p-1 transition-colors ${hasYard ? 'bg-orange-500' : 'bg-slate-200'}`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${hasYard ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    {saveStatus === 'success' && (
                        <div className="bg-green-50 text-green-700 text-xs font-bold p-3 rounded-xl flex items-center justify-center gap-2 animate-in fade-in">
                            <CheckCircle size={16} /> Preferencias actualizadas
                        </div>
                    )}

                    {saveStatus === 'error' && (
                        <div className="bg-red-50 text-red-700 text-xs font-bold p-3 rounded-xl flex items-center justify-center gap-2 animate-in fade-in">
                            Error al guardar datos
                        </div>
                    )}

                    <button
                        onClick={handleSavePreferences}
                        disabled={saveStatus === 'saving' || saveStatus === 'success'}
                        className="w-full py-3.5 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm mt-4"
                    >
                        {saveStatus === 'saving' ? <Loader2 size={16} className="animate-spin" /> : "Guardar Cambios"}
                    </button>
                </div>

                <div className="space-y-3 pb-4">
                    <button className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm active:scale-95 transition-all">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-slate-50 text-slate-500"><Shield size={18} /></div>
                            <span className="font-bold text-slate-700 text-sm">Privacidad de la cuenta</span>
                        </div>
                    </button>
                    <button className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm active:scale-95 transition-all">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-red-50 text-red-400"><LogOut size={18} /></div>
                            <span className="font-bold text-red-500 text-sm">Cerrar Sesión</span>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;