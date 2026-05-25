import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Lock, Phone, ShieldCheck, Loader2, CheckCircle2 } from 'lucide-react';
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const PrivacySettingsPage = ({ onBack }) => {
    const { user, refreshUser } = useAuth();
    const [menuSelection, setMenuSelection] = useState(null);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPhone, setNewPhone] = useState(user?.phone || '');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!currentPassword.trim()) {
            setError('Debe introducir su contraseña actual para confirmar el cambio.');
            return;
        }

        if (menuSelection === 'phone') {
            const phoneRegex = /^(?:\+?58|0)?(?:412|414|424|416|426)\d{7}$/;
            if (!phoneRegex.test(newPhone.trim())) {
                setError('El formato del número telefónico ingresado no es válido (Ej: 04121234567).');
                return;
            }
        }

        if (menuSelection === 'password') {
            if (!newPassword.trim() || newPassword.length < 6) {
                setError('La nueva contraseña debe tener un mínimo de 6 caracteres.');
                return;
            }
            if (newPassword !== confirmNewPassword) {
                setError('La nueva contraseña y su confirmación no coinciden.');
                return;
            }
        }

        setProcessing(true);

        const payload = {
            current_password: currentPassword,
            new_phone: menuSelection === 'phone' ? newPhone.trim() : null,
            new_password: menuSelection === 'password' ? newPassword : null
        };

        try {
            const response = await fetch(`${API_BASE_URL}/users/profile/privacy`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                credentials: 'include'
            });

            if (response.ok) {
                setSuccess(true);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmNewPassword('');
                await refreshUser();
                setTimeout(() => {
                    setSuccess(false);
                    setMenuSelection(null);
                }, 2000);
            } else {
                const data = await response.json();
                setError(data.detail || 'Error al procesar el cambio de seguridad.');
            }
        } catch (err) {
            setError('Error de comunicación con el servidor.');
        } finally {
            setProcessing(false);
        }
    };

    const handleBackAction = () => {
        if (menuSelection) {
            setError('');
            setMenuSelection(null);
        } else {
            onBack();
        }
    };

    return (
        <div className="h-full flex flex-col bg-slate-50 overflow-y-auto pb-8">
            <div className="bg-white border-b border-slate-100 px-4 py-4 shrink-0 shadow-sm flex items-center gap-3">
                <button
                    onClick={handleBackAction}
                    className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 active:scale-95 transition-transform"
                >
                    <ArrowLeft size={16} />
                </button>
                <div className="text-left">
                    <h1 className="text-xl font-black text-slate-800 tracking-tight">Seguridad</h1>
                    <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">Privacidad de la cuenta</p>
                </div>
            </div>

            <div className="p-4 flex flex-col gap-4 max-w-sm w-full mx-auto flex-1 justify-center">
                {!menuSelection ? (
                    <div className="space-y-3 animate-in fade-in duration-150">
                        <div className="text-center mb-6">
                            <div className="w-14 h-14 bg-teal-50 border border-teal-100 rounded-2xl mx-auto flex items-center justify-center text-teal-500 shadow-sm mb-2">
                                <ShieldCheck size={24} />
                            </div>
                            <h2 className="text-base font-black text-slate-800">¿Qué deseas modificar?</h2>
                            <p className="text-xs font-medium text-slate-400 mt-1">Selecciona una opción de resguardo</p>
                        </div>

                        <button
                            onClick={() => setMenuSelection('phone')}
                            className="w-full bg-white border border-slate-100 p-4 rounded-2xl shadow-sm flex items-center justify-between hover:border-teal-300 transition-all text-left"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center border border-orange-100/40">
                                    <Phone size={16} />
                                </div>
                                <div>
                                    <span className="text-xs font-black text-slate-700 block">Número Telefónico</span>
                                    <span className="text-[10px] font-semibold text-slate-400 block mt-0.5">Actual: {user?.phone || 'No registrado'}</span>
                                </div>
                            </div>
                        </button>

                        <button
                            onClick={() => setMenuSelection('password')}
                            className="w-full bg-white border border-slate-100 p-4 rounded-2xl shadow-sm flex items-center justify-between hover:border-teal-300 transition-all text-left"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center border border-purple-100/40">
                                    <Lock size={16} />
                                </div>
                                <div>
                                    <span className="text-xs font-black text-slate-700 block">Contraseña de acceso</span>
                                    <span className="text-[10px] font-semibold text-slate-400 block mt-0.5">Cambia tus credenciales de entrada</span>
                                </div>
                            </div>
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleFormSubmit} className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm space-y-4 text-left animate-in zoom-in-95 duration-150">
                        <h3 className="text-sm font-black text-slate-800 tracking-tight pb-2 border-b border-slate-50 uppercase tracking-wide text-teal-600">
                            {menuSelection === 'phone' ? 'Modificar Teléfono' : 'Modificar Contraseña'}
                        </h3>

                        {menuSelection === 'phone' && (
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Nuevo número telefónico</label>
                                <div className="relative">
                                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        value={newPhone}
                                        onChange={(e) => setNewPhone(e.target.value)}
                                        placeholder="Ej: 04121234567..."
                                        className="w-full bg-slate-50 border border-slate-100 pl-8 pr-3 py-2.5 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:border-teal-400"
                                    />
                                </div>
                            </div>
                        )}

                        {menuSelection === 'password' && (
                            <>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Nueva Contraseña</label>
                                    <div className="relative">
                                        <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Mínimo 6 caracteres..."
                                            className="w-full bg-slate-50 border border-slate-100 pl-8 pr-3 py-2.5 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:border-teal-400"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Confirmar Nueva Contraseña</label>
                                    <div className="relative">
                                        <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="password"
                                            value={confirmNewPassword}
                                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                                            placeholder="Repite la nueva clave..."
                                            className="w-full bg-slate-50 border border-slate-100 pl-8 pr-3 py-2.5 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:border-teal-400"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="space-y-1 border-t border-slate-50 pt-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider text-orange-500">Contraseña Actual (Validación)</label>
                            <div className="relative">
                                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="Introduce tu contraseña actual..."
                                    className="w-full bg-slate-50 border border-slate-100 pl-8 pr-3 py-2.5 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:border-teal-400"
                                />
                            </div>
                        </div>

                        {error && (
                            <p className="text-[10px] font-bold text-red-500 bg-red-50 border border-red-100 p-2 rounded-xl text-center">
                                {error}
                            </p>
                        )}

                        {success && (
                            <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold p-2.5 rounded-xl flex items-center gap-1.5 justify-center">
                                <CheckCircle2 size={14} />
                                <span>Cambio guardado con éxito.</span>
                            </div>
                        )}

                        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-50">
                            <button
                                type="button"
                                onClick={() => setMenuSelection(null)}
                                className="col-span-1 py-2.5 bg-slate-50 text-slate-500 font-bold text-[11px] uppercase tracking-wider rounded-xl border border-slate-200/60"
                            >
                                Volver
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="col-span-2 py-2.5 bg-slate-800 text-white font-bold text-[11px] uppercase tracking-wider rounded-xl shadow-sm flex items-center justify-center gap-1"
                            >
                                {processing && <Loader2 size={12} className="animate-spin" />}
                                Aplicar Cambio
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default PrivacySettingsPage;