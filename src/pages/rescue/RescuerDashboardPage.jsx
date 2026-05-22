import { useState, useEffect } from 'react';
import { MapPin, Clock, Loader2, ChevronRight, CheckCircle2, AlertTriangle, X } from 'lucide-react';

const STATUS_MAPPER = {
    pending: { label: "Reportado", color: "bg-red-50 text-red-600 border-red-100" },
    in_progress: { label: "En Rescate", color: "bg-amber-50 text-amber-600 border-amber-100" },
    rescued: { label: "Rescatado", color: "bg-teal-50 text-teal-600 border-teal-100" },
    in_shelter: { label: "En Refugio", color: "bg-blue-50 text-blue-600 border-blue-100" },
    adopted: { label: "Adoptado", color: "bg-purple-50 text-purple-600 border-purple-100" },
    not_found: { label: "No Localizado", color: "bg-slate-100 text-slate-500 border-slate-200" }
};

const RescuerDashboardPage = () => {
    const [allCases, setAllCases] = useState([]);
    const [activeSubTab, setActiveSubTab] = useState('radar');
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);

    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        title: '',
        description: '',
        confirmLabel: '',
        confirmColor: '',
        action: null
    });

    useEffect(() => {
        fetchServerEmergencies();
    }, []);

    const fetchServerEmergencies = async () => {
        try {
            const response = await fetch('http://localhost:8000/rescues');
            if (!response.ok) throw new Error();
            const data = await response.json();
            setAllCases(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const triggerStatusModal = (reportId, nextStatus, title, description, confirmLabel, confirmColor) => {
        setModalConfig({
            isOpen: true,
            title,
            description,
            confirmLabel,
            confirmColor,
            action: () => handleUpdateCaseStatus(reportId, nextStatus)
        });
    };

    const handleUpdateCaseStatus = async (reportId, nextStatus) => {
        setProcessingId(reportId);
        setModalConfig(prev => ({ ...prev, isOpen: false }));
        const cleanIntegerId = reportId.replace('report_', '');
        try {
            const response = await fetch(`http://localhost:8000/rescues/${cleanIntegerId}/status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: nextStatus })
            });
            if (response.ok) {
                setAllCases(prev => prev.map(c => c.id === reportId ? { ...c, status: nextStatus } : c));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setProcessingId(null);
        }
    };

    const filterCasesByActiveTab = () => {
        if (activeSubTab === 'radar') {
            return allCases.filter(c => c.status === 'pending');
        }
        if (activeSubTab === 'progress') {
            return allCases.filter(c => c.status === 'in_progress');
        }
        return allCases.filter(c => ['rescued', 'in_shelter', 'adopted', 'not_found'].includes(c.status));
    };

    const displayedCases = filterCasesByActiveTab();

    if (loading) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-slate-50 gap-2">
                <Loader2 size={28} className="text-orange-500 animate-spin" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sincronizando Radar...</span>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-slate-50 overflow-y-auto pb-8 relative">
            <div className="bg-white border-b border-slate-100 px-4 pt-4 sticky top-0 z-40 shadow-sm space-y-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">Radar de Rescate</h1>
                    <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mt-0.5">Operaciones de Campo</p>
                </div>

                <div className="flex border-t border-slate-100 pt-1">
                    {[
                        { id: 'radar', label: 'Radar (Alertas)' },
                        { id: 'progress', label: 'En Curso' },
                        { id: 'history', label: 'Historial' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveSubTab(tab.id)}
                            className={`flex-1 text-center py-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 ${activeSubTab === tab.id
                                    ? 'border-orange-500 text-orange-600'
                                    : 'border-transparent text-slate-400'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-4 max-w-sm w-full mx-auto flex flex-col gap-4">
                {displayedCases.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                        <CheckCircle2 size={36} className="text-slate-300 mx-auto mb-2" />
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">No hay casos en este segmento</p>
                    </div>
                ) : (
                    displayedCases.map((caseItem) => (
                        <div key={caseItem.id} className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden flex flex-col">
                            <div className="w-full aspect-video bg-slate-100 relative">
                                <img
                                    src={caseItem.imageUrl || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop-60&w=800"}
                                    alt="Contexto de la emergencia"
                                    className="w-full h-full object-cover"
                                />
                                <span className={`absolute top-3 right-3 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border shadow-md ${STATUS_MAPPER[caseItem.status]?.color}`}>
                                    {STATUS_MAPPER[caseItem.status]?.label}
                                </span>
                            </div>

                            <div className="p-4 space-y-3">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                                        <MapPin size={14} className="text-orange-500 shrink-0" />
                                        <span className="truncate">{caseItem.location}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-5">
                                        <Clock size={12} /> {caseItem.timeAgo}
                                    </div>
                                </div>

                                {caseItem.description && (
                                    <p className="text-xs font-medium text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100/40">
                                        {caseItem.description}
                                    </p>
                                )}

                                <div className="flex flex-wrap gap-1.5 pt-0.5">
                                    {caseItem.tags && caseItem.tags.map((tag, idx) => (
                                        <span key={idx} className="text-[9px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md border border-slate-200/30 uppercase tracking-wide">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>

                                <div className="pt-1">
                                    {caseItem.status === 'pending' && (
                                        <button
                                            onClick={() => triggerStatusModal(
                                                caseItem.id,
                                                'in_progress',
                                                '¿Atender esta emergencia?',
                                                'Al confirmar, el caso se asignará a tu perfil en curso y la comunidad sabrá que el rescate va en camino.',
                                                'Confirmar',
                                                'bg-orange-500 hover:bg-orange-600'
                                            )}
                                            disabled={processingId === caseItem.id}
                                            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-widest rounded-2xl transition-all active:scale-[0.99] flex items-center justify-center gap-1 shadow-sm"
                                        >
                                            {processingId === caseItem.id ? <Loader2 size={14} className="animate-spin" /> : 'Atender Caso'}
                                        </button>
                                    )}

                                    {caseItem.status === 'in_progress' && (
                                        <div className="flex flex-col gap-2">
                                            <button
                                                onClick={() => triggerStatusModal(
                                                    caseItem.id,
                                                    'rescued',
                                                    '¿Declarar caso Rescatado?',
                                                    'Confirma que has resguardado al animal de forma segura y exitosa para actualizar el reporte.',
                                                    'Rescatado',
                                                    'bg-teal-500 hover:bg-teal-600'
                                                )}
                                                disabled={processingId === caseItem.id}
                                                className="w-full py-3 bg-teal-500 hover:bg-teal-600 text-white font-bold text-xs uppercase tracking-widest rounded-2xl transition-all active:scale-[0.99] flex items-center justify-center gap-1 shadow-sm"
                                            >
                                                {processingId === caseItem.id ? <Loader2 size={14} className="animate-spin" /> : 'Marcar como Rescatado'}
                                            </button>
                                            <button
                                                onClick={() => triggerStatusModal(
                                                    caseItem.id,
                                                    'not_found',
                                                    '¿Animal no localizado?',
                                                    'Utiliza esta opción si acudiste al sector del reporte pero el animal ya no se encuentra en el lugar.',
                                                    'No Localizado',
                                                    'bg-slate-500 hover:bg-slate-600'
                                                )}
                                                disabled={processingId === caseItem.id}
                                                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold text-xs uppercase tracking-widest rounded-2xl transition-all active:scale-[0.99] flex items-center justify-center gap-1 border border-slate-200/60"
                                            >
                                                Animal No Localizado
                                            </button>
                                        </div>
                                    )}

                                    {caseItem.status === 'rescued' && (
                                        <button
                                            onClick={() => triggerStatusModal(
                                                caseItem.id,
                                                'in_shelter',
                                                '¿Ingresar a un Refugio?',
                                                'Confirma el traslado y entrada física de la mascota a las instalaciones de una fundación asociada.',
                                                'Ingresar',
                                                'bg-blue-500 hover:bg-blue-600'
                                            )}
                                            disabled={processingId === caseItem.id}
                                            className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs uppercase tracking-widest rounded-2xl transition-all active:scale-[0.99] flex items-center justify-center gap-1 shadow-sm"
                                        >
                                            {processingId === caseItem.id ? <Loader2 size={14} className="animate-spin" /> : 'Ingresar a un Refugio'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {modalConfig.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-150">
                    <div className="bg-white w-full max-w-[280px] rounded-3xl p-5 space-y-4 shadow-2xl border border-slate-50 animate-in zoom-in-95 duration-150 ease-out">
                        <div className="flex items-center justify-between">
                            <div className="w-9 h-9 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center border border-orange-100/60">
                                <AlertTriangle size={18} />
                            </div>
                            <button
                                onClick={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                                className="w-7 h-7 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center border border-slate-100 active:scale-95 transition-transform"
                            >
                                <X size={14} />
                            </button>
                        </div>

                        <div className="space-y-1.5">
                            <h3 className="text-sm font-black text-slate-800 tracking-tight">{modalConfig.title}</h3>
                            <p className="text-[11px] font-medium text-slate-400 leading-relaxed">
                                {modalConfig.description}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1">
                            <button
                                onClick={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                                className="py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-500 font-bold text-[11px] uppercase tracking-wider rounded-xl transition-all border border-slate-200/60 active:scale-95"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={modalConfig.action}
                                className={`py-2.5 text-white font-bold text-[11px] uppercase tracking-wider rounded-xl transition-all shadow-sm active:scale-95 ${modalConfig.confirmColor}`}
                            >
                                {modalConfig.confirmLabel}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RescuerDashboardPage;