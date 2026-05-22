import { useState, useEffect } from 'react';
import MatchCard from '../../components/MatchCard';
import { MatchSkeleton } from '../../components/Skeleton';
import { fetchMatchStack } from '../../services/api';
import { AlertCircle, RefreshCw, MessageCircle } from 'lucide-react';

const MatchSuccessModal = ({ animalName, foundationPhone, onClose }) => {
    const templateMessage = encodeURIComponent(
        `¡Hola! Hice match con ${animalName} en PatitasMatch. ¡Me gustaría iniciar el proceso de adopción!`
    );
    const whatsappUrl = `https://wa.me/${foundationPhone || '584125799911'}?text=${templateMessage}`;

    return (
        <div className="fixed inset-0 z-[10000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl max-w-xs w-full p-6 text-center flex flex-col items-center animate-in zoom-in-95 duration-300">
                <div className="w-16 h-16 bg-teal-50 text-teal-500 rounded-full flex items-center justify-center text-3xl mb-4 border border-teal-100 shadow-inner">
                    🎉
                </div>
                <h3 className="font-black text-slate-800 text-xl tracking-tight">¡Conexión Exitosa!</h3>
                <p className="text-slate-400 text-xs font-semibold mt-2 mb-6 leading-relaxed">
                    ¡Felicidades! Has iniciado formalmente el contacto para la adopción de <span className="text-slate-700 font-bold">{animalName}</span>.
                </p>
                <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:brightness-105 active:scale-[0.98] transition-all text-sm mb-3"
                >
                    <MessageCircle size={18} className="fill-current" />
                    Comunicarte con la fundación
                </a>
                <button
                    onClick={onClose}
                    className="w-full py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 text-xs font-bold rounded-xl transition-colors"
                >
                    Seguir buscando
                </button>
            </div>
        </div>
    );
};

const MatchPage = () => {
    const queryParams = new URLSearchParams(window.location.search);
    const activeUserId = queryParams.get('user') || 'user_tester_2026';

    const [animals, setAnimals] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [matchedAnimal, setMatchedAnimal] = useState(null);
    const [foundationPhone, setFoundationPhone] = useState('');

    const loadMatchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const matchStack = await fetchMatchStack(activeUserId);
            setAnimals(matchStack);
        } catch (err) {
            setError(err.message || "Error connecting to the server");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadMatchData();
    }, [activeUserId]);

    const handleNext = () => setAnimals(prev => prev.slice(1));

    const handleMatch = async () => {
        const targetAnimal = animals[0];
        try {
            const response = await fetch(`http://localhost:8000/animals/${targetAnimal.id}/match`, {
                method: "POST"
            });
            if (response.ok) {
                const result = await response.json();
                setFoundationPhone(result.phone || '');
                setMatchedAnimal(targetAnimal);
            }
        } catch (err) {
            console.error(err);
            setMatchedAnimal(targetAnimal);
        }
    };

    const handleReject = async () => {
        const targetAnimal = animals[0];
        handleNext();
        try {
            await fetch("http://localhost:8000/matches/reject", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: activeUserId,
                    animal_id: targetAnimal.id
                })
            });
        } catch (err) {
            console.error(err);
        }
    };

    const handleCloseModal = () => {
        setMatchedAnimal(null);
        handleNext();
    };

    if (isLoading) {
        return (
            <div className="h-full flex flex-col bg-slate-50 overflow-hidden">
                <div className="w-full bg-white border-b border-slate-100 px-4 py-4 flex items-center justify-between shrink-0 shadow-sm">
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Encuentra tu par</h1>
                        <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mt-0.5">Radar de Afinidad</p>
                    </div>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-50">
                    <MatchSkeleton />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-slate-50 p-10 text-center">
                <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6 text-red-500 shadow-inner border border-red-100">
                    <AlertCircle size={48} />
                </div>
                <h2 className="text-2xl font-black text-slate-800 mb-2">Oops!</h2>
                <p className="text-slate-400 text-xs font-semibold max-w-[240px] mb-8 leading-relaxed">{error}</p>
                <button
                    onClick={loadMatchData}
                    className="px-8 py-3.5 bg-slate-800 text-white font-bold rounded-2xl shadow-lg hover:bg-slate-700 active:scale-95 transition-all flex items-center gap-2 text-sm"
                >
                    <RefreshCw size={18} /> Reintentar
                </button>
            </div>
        );
    }

    if (animals.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-slate-50 p-10 text-center">
                <div className="w-24 h-24 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mb-6 shadow-inner border border-orange-100 text-3xl">
                    ✨
                </div>
                <h2 className="text-2xl font-black text-slate-800 mb-2">¡Todo listo!</h2>
                <p className="text-slate-400 text-xs font-semibold max-w-[240px] leading-relaxed">
                    Has revisado todos los perritos compatibles por hoy.
                </p>
                <button
                    onClick={loadMatchData}
                    className="mt-8 px-8 py-3.5 bg-orange-500 text-white font-bold rounded-2xl shadow-lg shadow-orange-500/20 active:scale-95 transition-all text-sm"
                >
                    Refrescar radar
                </button>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-slate-50 overflow-hidden">
            <div className="w-full bg-white border-b border-slate-100 px-4 py-4 flex items-center justify-between shrink-0 shadow-sm">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">Encuentra tu par</h1>
                    <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mt-0.5">Desliza para conectar</p>
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-4 min-h-0 relative select-none">
                <div className="w-full max-w-sm aspect-[3/4] max-h-[65vh] relative">
                    <MatchCard
                        key={animals[0].id}
                        animal={animals[0]}
                        onReject={handleReject}
                        onAccept={handleMatch}
                    />
                </div>
            </div>

            {matchedAnimal && (
                <MatchSuccessModal
                    animalName={matchedAnimal.name}
                    foundationPhone={foundationPhone}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
};

export default MatchPage;