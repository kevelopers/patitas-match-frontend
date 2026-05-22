import { useState, useEffect } from 'react';
import { Plus, Loader2, Filter, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

const FoundationDashboardPage = () => {
    const [animals, setAnimals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRefugeAnimals();
    }, []);

    const fetchRefugeAnimals = async () => {
        try {
            const response = await fetch('http://localhost:8000/rescues');
            if (response.ok) {
                setAnimals([
                    { id: 1, name: 'Max', type: 'Perro', size: 'Mediano', age: 'Adulto', status: 'Disponible', matches: 12 },
                    { id: 2, name: 'Bella', type: 'Perro', size: 'Pequeño', age: 'Cachorro', status: 'Disponible', matches: 24 },
                    { id: 3, name: 'Rocky', type: 'Perro', size: 'Grande', age: 'Adulto', status: 'En Proceso', matches: 5 },
                    { id: 4, name: 'Kira', type: 'Perro', size: 'Mediano', age: 'Senior', status: 'Adoptado', matches: 0 }
                ]);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-slate-50 gap-2">
                <Loader2 size={28} className="text-teal-500 animate-spin" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cargando Panel de Control...</span>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-slate-50 overflow-y-auto pb-8">
            <div className="bg-white border-b border-slate-100 px-4 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">Refugio Panel</h1>
                    <p className="text-xs font-bold text-teal-500 uppercase tracking-widest mt-0.5">Gestión de Adopciones</p>
                </div>
                <button className="w-10 h-10 bg-teal-500 text-white rounded-2xl flex items-center justify-center shadow-md hover:bg-teal-600 transition-colors active:scale-95">
                    <Plus size={20} />
                </button>
            </div>

            <div className="p-4 max-w-sm w-full mx-auto space-y-4">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0 select-none">
                    <button className="flex items-center gap-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 shadow-sm">
                        <Filter size={12} /> Todos
                    </button>
                    <button className="flex items-center gap-1 px-3 py-2 bg-white border border-slate-100 rounded-xl text-xs font-semibold text-slate-400">
                        Disponibles
                    </button>
                    <button className="flex items-center gap-1 px-3 py-2 bg-white border border-slate-100 rounded-xl text-xs font-semibold text-slate-400">
                        En Proceso
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-3">
                    {animals.map((animal) => (
                        <div
                            key={animal.id}
                            className="bg-white border border-slate-100 p-4 rounded-3xl shadow-[0_4px_12px_rgba(0,0,0,0.01)] flex items-center justify-between transition-all hover:border-slate-200/80"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center text-xl border border-teal-100/60 font-sans">
                                    🐶
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-sm tracking-tight">{animal.name}</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                                        {animal.size} • {animal.age}
                                    </p>
                                    {animal.matches > 0 && (
                                        <span className="text-[9px] font-black text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded-md inline-block mt-1">
                                            {animal.matches} interesados
                                        </span>
                                    )}
                                </div>
                            </div>

                            <span className={`text-[10px] font-black border px-2.5 py-1 rounded-full uppercase tracking-wider ${animal.status === 'Disponible' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                    animal.status === 'En Proceso' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                        'bg-slate-100 text-slate-400 border-slate-200'
                                }`}>
                                {animal.status}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FoundationDashboardPage;