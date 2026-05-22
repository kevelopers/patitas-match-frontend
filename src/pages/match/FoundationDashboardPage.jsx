import { useState, useEffect } from 'react';
import { Plus, Search, X, Heart, ShieldCheck, RefreshCw, Calendar, FileText, ArrowRight, CheckCircle2, Loader2, Camera } from 'lucide-react';

const STATUS_CONFIG = {
    available: { label: "Disponible", classes: "bg-emerald-50 text-emerald-600 border-emerald-100" },
    in_progress: { label: "En Proceso", classes: "bg-amber-50 text-amber-600 border-amber-100" },
    adopted: { label: "Adoptado", classes: "bg-purple-50 text-purple-600 border-purple-100" }
};

const FoundationDashboardPage = () => {
    const foundationId = "foundation_01";
    const [animals, setAnimals] = useState([]);
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);

    const [selectedAnimal, setSelectedAnimal] = useState(null);
    const [logTitle, setLogTitle] = useState('');
    const [logText, setLogText] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState('');

    const [formData, setFormData] = useState({
        name: '', type: '', size: 'medium', energyLevel: 'medium', age: 'young', description: '', status: 'available'
    });

    const fetchAnimalsData = async () => {
        try {
            const response = await fetch(`http://localhost:8000/animals/foundation/${foundationId}`);
            if (response.ok) {
                const data = await response.json();
                setAnimals(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnimalsData();
    }, []);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setImagePreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleOpenCreateModal = () => {
        setFormData({ name: '', type: '', size: 'medium', energyLevel: 'medium', age: 'young', description: '', status: 'available' });
        setSelectedFile(null);
        setImagePreviewUrl('');
        setIsCreateModalOpen(true);
    };

    const handleOpenEditModal = (animal) => {
        setSelectedAnimal(animal);
        setFormData({
            name: animal.name,
            type: animal.type,
            size: animal.size,
            energyLevel: animal.energyLevel,
            age: animal.age,
            description: animal.description,
            status: animal.status
        });
        setSelectedFile(null);
        setImagePreviewUrl(animal.photo && animal.photo !== '🐾' ? animal.photo : '');
        setIsEditModalOpen(true);
    };

    const handleOpenFollowUpModal = (animal) => {
        setSelectedAnimal(animal);
        setLogTitle('');
        setLogText('');
        setIsFollowUpModalOpen(true);
    };

    const handleCreateAnimal = async () => {
        if (!formData.name || formData.name.trim() === '') return;
        setProcessing(true);

        const multipartBody = new FormData();
        multipartBody.append('foundation_id', foundationId);
        multipartBody.append('name', formData.name);
        multipartBody.append('animal_type', formData.type || 'Desconocido');
        multipartBody.append('size', formData.size);
        multipartBody.append('energy_level', formData.energyLevel);
        multipartBody.append('age', formData.age);
        multipartBody.append('description', formData.description);
        multipartBody.append('status', formData.status);
        if (selectedFile) {
            multipartBody.append('image', selectedFile);
        }

        try {
            const response = await fetch('http://localhost:8000/animals', {
                method: 'POST',
                body: multipartBody
            });
            if (response.ok) {
                await fetchAnimalsData();
                setIsCreateModalOpen(false);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setProcessing(false);
        }
    };

    const handleUpdateAnimal = async () => {
        if (!selectedAnimal) return;
        setProcessing(true);

        const multipartBody = new FormData();
        multipartBody.append('name', formData.name);
        multipartBody.append('animal_type', formData.type);
        multipartBody.append('size', formData.size);
        multipartBody.append('energy_level', formData.energyLevel);
        multipartBody.append('age', formData.age);
        multipartBody.append('description', formData.description);
        multipartBody.append('status', formData.status);
        if (selectedFile) {
            multipartBody.append('image', selectedFile);
        }

        try {
            const response = await fetch(`http://localhost:8000/animals/${selectedAnimal.id}/update`, {
                method: 'POST',
                body: multipartBody
            });
            if (response.ok) {
                await fetchAnimalsData();
                setIsEditModalOpen(false);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setProcessing(false);
        }
    };

    const handleDirectStatusChange = async (animal, nextStatus) => {
        const multipartBody = new FormData();
        multipartBody.append('name', animal.name);
        multipartBody.append('animal_type', animal.type);
        multipartBody.append('size', animal.size);
        multipartBody.append('energy_level', animal.energyLevel);
        multipartBody.append('age', animal.age);
        multipartBody.append('description', animal.description);
        multipartBody.append('status', nextStatus);

        try {
            const response = await fetch(`http://localhost:8000/animals/${animal.id}/update`, {
                method: 'POST',
                body: multipartBody
            });
            if (response.ok) {
                await fetchAnimalsData();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleAddFollowUpEntry = async () => {
        if (!logTitle.trim() || !logText.trim() || !selectedAnimal) return;
        setProcessing(true);

        const multipartBody = new FormData();
        multipartBody.append('title', logTitle);
        multipartBody.append('text', logText);

        try {
            const response = await fetch(`http://localhost:8000/animals/${selectedAnimal.id}/logs`, {
                method: 'POST',
                body: multipartBody
            });
            if (response.ok) {
                const newLog = await response.json();
                setSelectedAnimal(prev => ({
                    ...prev,
                    followUpLogs: [newLog, ...prev.followUpLogs]
                }));
                setAnimals(prev => prev.map(item => {
                    if (item.id === selectedAnimal.id) {
                        return { ...item, followUpLogs: [newLog, ...item.followUpLogs] };
                    }
                    return item;
                }));
                setLogTitle('');
                setLogText('');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setProcessing(false);
        }
    };

    const executeFilteringWorkflow = () => {
        return animals.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                item.type.toLowerCase().includes(searchQuery.toLowerCase());

            if (activeTab === 'all') return matchesSearch;
            return matchesSearch && item.status === activeTab;
        });
    };

    const filteredAnimals = executeFilteringWorkflow();

    if (loading) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-slate-50 gap-2">
                <Loader2 size={28} className="text-teal-500 animate-spin" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sincronizando Catálogo...</span>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-slate-50 overflow-y-auto pb-8 relative">
            <div className="bg-white border-b border-slate-100 px-4 py-4 sticky top-0 z-40 shadow-sm space-y-3 shrink-0">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Refugio Panel</h1>
                        <p className="text-xs font-bold text-teal-500 uppercase tracking-widest mt-0.5">Gestión de Adopciones</p>
                    </div>
                    <button
                        onClick={handleOpenCreateModal}
                        className="w-10 h-10 bg-teal-500 text-white rounded-2xl flex items-center justify-center shadow-md active:scale-95 transition-transform"
                    >
                        <Plus size={20} />
                    </button>
                </div>

                <div className="relative w-full">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, tipo o rasgos..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 pl-10 pr-4 py-2.5 rounded-2xl text-xs font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:border-teal-400 focus:bg-white transition-all"
                    />
                </div>

                <div className="flex border-t border-slate-100 pt-1 shrink-0 overflow-x-auto select-none">
                    {[
                        { id: 'all', label: 'Todos' },
                        { id: 'available', label: 'Disponibles' },
                        { id: 'in_progress', label: 'En Curso' },
                        { id: 'adopted', label: 'Adoptados' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 text-center py-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 whitespace-nowrap px-2 ${activeTab === tab.id
                                    ? 'border-teal-500 text-teal-600'
                                    : 'border-transparent text-slate-400'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-4 max-w-sm w-full mx-auto flex flex-col gap-3">
                {filteredAnimals.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">No se encontraron registros</p>
                    </div>
                ) : (
                    filteredAnimals.map((animal) => (
                        <div
                            key={animal.id}
                            onClick={() => handleOpenEditModal(animal)}
                            className="bg-white border border-slate-100 p-4 rounded-3xl shadow-sm flex flex-col gap-3 cursor-pointer transition-all hover:border-slate-200/80 group"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center text-xl border border-teal-100/60 font-sans group-hover:scale-105 transition-transform overflow-hidden shrink-0">
                                        {animal.photo && animal.photo.startsWith('http') ? (
                                            <img src={animal.photo} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            animal.photo || '🐾'
                                        )}
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-bold text-slate-800 text-sm tracking-tight group-hover:text-teal-600 transition-colors">{animal.name}</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                                            {animal.type} • {animal.size === 'small' ? 'Pequeño' : animal.size === 'medium' ? 'Mediano' : 'Grande'}
                                        </p>
                                    </div>
                                </div>
                                <span className={`text-[9px] font-black border px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0 ${STATUS_CONFIG[animal.status]?.classes}`}>
                                    {STATUS_CONFIG[animal.status]?.label}
                                </span>
                            </div>

                            {animal.description && (
                                <p className="text-xs font-medium text-slate-500 leading-relaxed bg-slate-50/60 p-2.5 rounded-xl border border-slate-100/40 text-left">
                                    {animal.description}
                                </p>
                            )}

                            <div className="flex items-center justify-between border-t border-slate-50 pt-2 gap-2">
                                {animal.status === 'adopted' ? (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleOpenFollowUpModal(animal); }}
                                        className="py-2 px-3 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all border border-purple-200/40 flex items-center gap-1 shrink-0"
                                    >
                                        <FileText size={12} /> Seguimiento
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-1 text-[10px] font-black text-teal-600 bg-teal-50/60 px-2 py-1 rounded-lg border border-teal-100/30 shrink-0">
                                        <Heart size={12} className="fill-current" /> {animal.matchesCount} interesados
                                    </div>
                                )}

                                <div className="flex items-center gap-1.5 ml-auto">
                                    {animal.status === 'available' && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDirectStatusChange(animal, 'in_progress'); }}
                                            className="py-1.5 px-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all flex items-center gap-1 shadow-sm shrink-0"
                                        >
                                            Proceso <ArrowRight size={10} />
                                        </button>
                                    )}

                                    {animal.status === 'in_progress' && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDirectStatusChange(animal, 'adopted'); }}
                                            className="py-1.5 px-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all flex items-center gap-1 shadow-sm shrink-0"
                                        >
                                            Adoptado <CheckCircle2 size={10} />
                                        </button>
                                    )}

                                    {animal.status !== 'available' && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDirectStatusChange(animal, 'available'); }}
                                            className="py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all border border-slate-200/60 flex items-center gap-1 shrink-0"
                                        >
                                            <RefreshCw size={10} /> Reactivar
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {(isCreateModalOpen || isEditModalOpen) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
                    <div className="bg-white w-full max-w-[280px] rounded-3xl p-4 space-y-3 shadow-2xl border border-slate-50 animate-in zoom-in-95 duration-150 ease-out my-auto max-h-[92vh] overflow-y-auto shrink-0 flex flex-col justify-start">
                        <div className="flex items-center justify-between border-b border-slate-50 pb-1.5 shrink-0">
                            <h3 className="text-sm font-black text-slate-800 tracking-tight">
                                {isCreateModalOpen ? 'Registrar Mascota' : 'Editar Perfil'}
                            </h3>
                            <button
                                onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }}
                                className="w-7 h-7 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center border border-slate-100 active:scale-95 transition-transform text-xs font-bold"
                            >
                                X
                            </button>
                        </div>

                        <div className="space-y-2.5 text-left flex-1">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Foto de Perfil</label>
                                <label className="w-full aspect-[16/9] border-2 border-dashed border-slate-200 bg-slate-50 rounded-2xl flex flex-col items-center justify-center gap-1 cursor-pointer text-slate-400 hover:bg-slate-100/50 transition-colors overflow-hidden relative shrink-0">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="sr-only"
                                    />
                                    {imagePreviewUrl ? (
                                        <div className="absolute inset-0 w-full h-full">
                                            <img src={imagePreviewUrl} alt="Preview" className="w-full h-full object-cover" />
                                            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider backdrop-blur-sm">Cambiar</div>
                                        </div>
                                    ) : (
                                        <>
                                            <Camera size={20} className="text-slate-300" />
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Seleccionar Imagen</span>
                                        </>
                                    )}
                                </label>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Nombre</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    placeholder="Ej: Max, Luna..."
                                    className="w-full bg-slate-50 border border-slate-100 p-2 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:border-teal-400"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Especie / Tipo de Animal</label>
                                <input
                                    type="text"
                                    value={formData.type}
                                    onChange={(e) => handleInputChange('type', e.target.value)}
                                    placeholder="Ej: Perro, Gato, Ave, Conejo..."
                                    className="w-full bg-slate-50 border border-slate-100 p-2 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:border-teal-400"
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                <div className="space-y-1 col-span-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Tamaño</label>
                                    <select
                                        value={formData.size}
                                        onChange={(e) => handleInputChange('size', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-100 p-2 rounded-xl text-[11px] font-bold text-slate-600 focus:outline-none"
                                    >
                                        <option value="small">Pequeño</option>
                                        <option value="medium">Mediano</option>
                                        <option value="large">Grande</option>
                                    </select>
                                </div>
                                <div className="space-y-1 col-span-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Energía</label>
                                    <select
                                        value={formData.energyLevel}
                                        onChange={(e) => handleInputChange('energyLevel', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-100 p-2 rounded-xl text-[11px] font-bold text-slate-600 focus:outline-none"
                                    >
                                        <option value="low">Baja</option>
                                        <option value="medium">Media</option>
                                        <option value="high">Alta</option>
                                    </select>
                                </div>
                                <div className="space-y-1 col-span-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Etapa</label>
                                    <select
                                        value={formData.age}
                                        onChange={(e) => handleInputChange('age', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-100 p-2 rounded-xl text-[11px] font-bold text-slate-600 focus:outline-none"
                                    >
                                        <option value="young">Joven</option>
                                        <option value="adult">Adulto</option>
                                        <option value="senior">Mayor</option>
                                    </select>
                                </div>
                            </div>

                            {!isCreateModalOpen && (
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Estatus</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => handleInputChange('status', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-100 p-2 rounded-xl text-xs font-bold text-slate-600 focus:outline-none"
                                    >
                                        <option value="available">Disponible</option>
                                        <option value="in_progress">En Proceso</option>
                                        <option value="adopted">Adoptado</option>
                                    </select>
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Descripción</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    placeholder="Historial médico, temperamento..."
                                    className="w-full h-12 p-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:border-teal-400 resize-none"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-50 shrink-0">
                            <button
                                onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }}
                                className="py-2 bg-slate-50 hover:bg-slate-100 text-slate-500 font-bold text-[11px] uppercase tracking-wider rounded-xl transition-all border border-slate-200/60 active:scale-95"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={isCreateModalOpen ? handleCreateAnimal : handleUpdateAnimal}
                                disabled={processing}
                                className="py-2 bg-teal-500 hover:bg-teal-600 text-white font-bold text-[11px] uppercase tracking-wider rounded-xl transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1"
                            >
                                {processing && <Loader2 size={12} className="animate-spin" />}
                                Guardar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isFollowUpModalOpen && selectedAnimal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
                    <div className="bg-white w-full max-w-[280px] rounded-3xl p-5 space-y-4 shadow-2xl border border-slate-50 animate-in zoom-in-95 duration-150 ease-out my-auto max-h-[85vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-slate-50 pb-1">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center border border-purple-100/60">
                                    <ShieldCheck size={16} />
                                </div>
                                <div className="text-left">
                                    <h3 className="text-xs font-black text-slate-800 tracking-tight">Seguimiento</h3>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{selectedAnimal.name}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsFollowUpModalOpen(false)}
                                className="w-7 h-7 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center border border-slate-100 active:scale-95 transition-transform"
                            >
                                X
                            </button>
                        </div>

                        <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1">
                            {selectedAnimal.followUpLogs && selectedAnimal.followUpLogs.length === 0 ? (
                                <p className="text-[11px] font-medium text-slate-400 italic text-center py-4">Sin anotaciones en la bitácora todavía.</p>
                            ) : (
                                selectedAnimal.followUpLogs && selectedAnimal.followUpLogs.map((log) => (
                                    <div key={log.id} className="bg-slate-50 border border-slate-100/80 p-2.5 rounded-xl space-y-1 text-left relative overflow-hidden">
                                        <div className="flex items-center justify-between gap-2 text-[9px] font-black uppercase tracking-wide">
                                            <span className="text-slate-500 flex items-center gap-1">
                                                <Calendar size={10} /> {log.title}
                                            </span>
                                            <span className="text-slate-400 font-mono">
                                                {log.date}
                                            </span>
                                        </div>
                                        <p className="text-[11px] font-medium text-slate-600 leading-normal">{log.text}</p>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="border-t border-slate-100 pt-3 space-y-2.5 text-left">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Nueva Entrada</span>
                            <div className="space-y-2 bg-slate-50/50 p-2.5 rounded-2xl border border-slate-100">
                                <input
                                    type="text"
                                    placeholder="Título (Ej: Control de 3 Meses)..."
                                    value={logTitle}
                                    onChange={(e) => setLogTitle(e.target.value)}
                                    className="w-full bg-white border border-slate-100 p-2 rounded-xl text-[11px] font-bold text-slate-700 focus:outline-none focus:border-purple-400"
                                />
                                <textarea
                                    placeholder="Detalles sobre el estado del animal, fotos recibidas..."
                                    value={logText}
                                    onChange={(e) => setLogText(e.target.value)}
                                    className="w-full h-14 bg-white border border-slate-100 p-2 rounded-xl text-[11px] font-medium text-slate-600 focus:outline-none focus:border-purple-400 resize-none"
                                />
                                <button
                                    onClick={handleAddFollowUpEntry}
                                    disabled={processing}
                                    className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1"
                                >
                                    {processing && <Loader2 size={12} className="animate-spin" />}
                                    Agregar a Bitácora
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsFollowUpModalOpen(false)}
                            className="w-full py-2.5 bg-slate-800 text-white font-bold text-[11px] uppercase tracking-wider rounded-xl transition-all shadow-sm active:scale-95"
                        >
                            Cerrar Historial
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FoundationDashboardPage;