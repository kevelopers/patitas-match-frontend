import { useState, useEffect, useRef } from 'react';
import { MapPin, Clock, Heart, Share2, AlertCircle, CheckCircle, Navigation, Loader2 } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const STATUS_DICTIONARY = {
    pending: {
        IconComponent: AlertCircle,
        label: "Emergencia Reportada",
        colorClasses: "bg-red-50 text-red-600 border-red-200"
    },
    in_progress: {
        IconComponent: Navigation,
        label: "Rescate en Camino",
        colorClasses: "bg-amber-50 text-amber-600 border-amber-200"
    },
    rescued: {
        IconComponent: CheckCircle,
        label: "Animal Rescatado",
        colorClasses: "bg-teal-50 text-teal-600 border-teal-200"
    },
    in_shelter: {
        IconComponent: CheckCircle,
        label: "En Refugio",
        colorClasses: "bg-blue-50 text-blue-600 border-blue-200"
    },
    adopted: {
        IconComponent: CheckCircle,
        label: "Adoptado",
        colorClasses: "bg-purple-50 text-purple-600 border-purple-200"
    },
    not_found: {
        IconComponent: AlertCircle,
        label: "No Localizado",
        colorClasses: "bg-slate-100 text-slate-500 border-slate-200"
    }
};

const StatusBadge = ({ status }) => {
    const configuration = STATUS_DICTIONARY[status];
    if (!configuration) return null;

    const { IconComponent, label, colorClasses } = configuration;

    return (
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${colorClasses}`}>
            <IconComponent size={14} />
            <span>{label}</span>
        </div>
    );
};

const TagPill = ({ tag }) => (
    <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide">
        #{tag}
    </span>
);

const FeedPost = ({ post }) => {
    const [isLiked, setIsLiked] = useState(post.hasLiked || false);
    const [currentLikes, setCurrentLikes] = useState(post.likeCount || 0);
    const [showHeartOverlay, setShowHeartOverlay] = useState(false);
    const lastClickTimeRef = useRef(0);

    useEffect(() => {
        setIsLiked(post.hasLiked || false);
        setCurrentLikes(post.likeCount || 0);
    }, [post]);

    const executeBackendLikeAction = async (actionPath) => {
        const cleanIntegerId = post.id.replace('report_', '');
        const token = localStorage.getItem('access_token');
        const headers = { 'Content-Type': 'application/json' };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            await fetch(`${API_BASE_URL}/rescues/${cleanIntegerId}/${actionPath}`, {
                method: 'POST',
                headers: headers
            });
        } catch (error) {
            console.error(error);
        }
    };

    const handleToggleLike = () => {
        const nextLikedState = !isLiked;

        if (nextLikedState) {
            setCurrentLikes(prev => prev + 1);
            executeBackendLikeAction('like');
        } else {
            setCurrentLikes(prev => Math.max(0, prev - 1));
            executeBackendLikeAction('unlike');
        }

        setIsLiked(nextLikedState);
    };

    const handleImageTapDetection = () => {
        const currentTime = Date.now();
        const timeThresholdInMs = 300;
        const isDoubleTap = (currentTime - lastClickTimeRef.current) < timeThresholdInMs;

        if (isDoubleTap) {
            executeHeartAnimationWorkflow();
        }

        lastClickTimeRef.current = currentTime;
    };

    const executeHeartAnimationWorkflow = () => {
        setShowHeartOverlay(true);

        if (!isLiked) {
            setIsLiked(true);
            setCurrentLikes(prev => prev + 1);
            executeBackendLikeAction('like');
        }

        setTimeout(() => {
            setShowHeartOverlay(false);
        }, 1000);
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'PatitasMatch - Reporte',
                    text: `Mira este reporte de ${post.authorName}: ${post.description}`,
                    url: window.location.href,
                });
            } catch (error) {
                console.error(error);
            }
        } else {
            prompt('Copia este enlace para compartir:', window.location.href);
        }
    };

    const resolveUrgencyContainerTheme = () => {
        if (post.urgency === 'critical') {
            return 'bg-red-100/60 border-red-200';
        }
        if (post.urgency === 'high') {
            return 'bg-amber-100/60 border-amber-200';
        }
        return 'bg-slate-100/80 border-slate-200';
    };

    const sanitizedImageUrl = post.imageUrl && post.imageUrl.startsWith('http://localhost:8000')
        ? post.imageUrl.replace('http://localhost:8000', API_BASE_URL)
        : post.imageUrl;

    return (
        <article className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-6">
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-xl shadow-sm border border-slate-200">
                        {post.authorAvatar}
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-sm">{post.authorName}</h3>
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mt-0.5">
                            <span className="flex items-center gap-1"><MapPin size={12} /> {post.location}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><Clock size={12} /> {post.timeAgo}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div
                className="w-full aspect-square bg-slate-100 relative select-none cursor-pointer overflow-hidden flex items-center justify-center"
                onClick={handleImageTapDetection}
            >
                <img
                    src={sanitizedImageUrl || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop-60&w=800"}
                    alt="Animal reportado"
                    className="absolute inset-0 w-full h-full object-cover z-10"
                    loading="lazy"
                />

                <div
                    className={`absolute inset-0 bg-black/30 flex items-center justify-center z-50 pointer-events-none transition-all duration-500 ease-in-out ${showHeartOverlay ? 'opacity-100 backdrop-blur-[2px]' : 'opacity-0'}`}
                >
                    <Heart
                        size={120}
                        className={`text-white fill-white drop-shadow-2xl transition-all duration-500 ease-out transform ${showHeartOverlay ? 'scale-100 rotate-0' : 'scale-75 -rotate-12'}`}
                    />
                </div>

                <div className="absolute top-3 right-3 z-20">
                    <StatusBadge status={post.status} />
                </div>
            </div>

            <div className="p-4 space-y-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleToggleLike}
                        className="flex items-center gap-1.5 focus:outline-none transition-transform active:scale-95 text-left"
                    >
                        <Heart
                            size={24}
                            className={`transition-all duration-200 ${isLiked ? "text-red-500 fill-red-500 scale-105" : "text-slate-400 hover:text-slate-600"}`}
                        />
                        <span className={`font-bold text-sm transition-colors ${isLiked ? "text-red-500" : "text-slate-600"}`}>
                            {currentLikes}
                        </span>
                    </button>
                    <button
                        onClick={handleShare}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                        title="Compartir"
                    >
                        <Share2 size={22} />
                    </button>
                </div>

                <p className="text-sm font-medium text-slate-700 leading-relaxed text-left">
                    <span className="font-bold text-slate-900 mr-2">{post.authorName}</span>
                    {post.description}
                </p>

                <div className={`p-3.5 rounded-2xl space-y-3 border transition-colors ${resolveUrgencyContainerTheme()}`}>
                    <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Asistencia Digital IA</span>
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${post.urgency === 'critical' ? 'bg-red-200 text-red-800 border-red-300' :
                            post.urgency === 'high' ? 'bg-amber-200 text-amber-800 border-amber-300' :
                                'bg-slate-200 text-slate-700 border-slate-300'
                            }`}>
                            Urgencia: {post.urgency === 'critical' ? 'Crítica' : post.urgency === 'high' ? 'Alta' : 'Baja'}
                        </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 text-left">
                        <div className="bg-white border border-slate-100 p-2 rounded-xl">
                            <span className="text-[8px] font-bold text-slate-400 uppercase block">Raza Probable</span>
                            <span className="text-[10px] font-black text-slate-700 block truncate mt-0.5">{post.breedMix || 'Desconocida'}</span>
                        </div>
                        <div className="bg-white border border-slate-100 p-2 rounded-xl">
                            <span className="text-[8px] font-bold text-slate-400 uppercase block">Estado Ánimo</span>
                            <span className="text-[10px] font-black text-slate-700 block truncate mt-0.5">{post.detectedMood || 'N/A'}</span>
                        </div>
                        <div className="bg-white border border-slate-100 p-2 rounded-xl">
                            <span className="text-[8px] font-bold text-slate-400 uppercase block">Condición</span>
                            <span className="text-[10px] font-black text-slate-700 block truncate mt-0.5">{post.physicalCondition || 'N/A'}</span>
                        </div>
                    </div>

                    {post.firstAidAdvice && (
                        <div className="bg-white p-2.5 rounded-xl text-left border border-slate-100">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">Soporte Primario</span>
                            <p className="text-[11px] font-medium text-slate-600 leading-snug">{post.firstAidAdvice}</p>
                        </div>
                    )}

                    <div className="text-center pt-2 border-t border-slate-200/20">
                        <span className="text-[7px] font-bold text-slate-400 uppercase tracking-wide block">El bloque de diagnóstico y soporte de arriba fue generado mediante Inteligencia Artificial</span>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    {post.tags && post.tags.map((tag, index) => (
                        <TagPill key={index} tag={tag} />
                    ))}
                </div>
            </div>
        </article>
    );
};

const HomePage = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const mainScrollContainerRef = useRef(null);

    const loadFeedData = async () => {
        setLoading(true);
        setError(false);

        const token = localStorage.getItem('access_token');
        const headers = {};

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/rescues`, {
                headers: headers
            });
            if (!response.ok) throw new Error();
            const data = await response.json();
            setPosts(data);
        } catch (err) {
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    const handleScrollToTop = () => {
        if (mainScrollContainerRef.current) {
            mainScrollContainerRef.current.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    };

    useEffect(() => {
        loadFeedData();
    }, []);

    useEffect(() => {
        window.addEventListener('trigger-home-scroll-top', handleScrollToTop);
        return () => {
            window.removeEventListener('trigger-home-scroll-top', handleScrollToTop);
        };
    }, []);

    return (
        <div
            ref={mainScrollContainerRef}
            className="h-full flex flex-col bg-slate-50 overflow-y-auto"
        >
            <div
                onClick={handleScrollToTop}
                className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-4 flex items-center justify-between cursor-pointer select-none"
            >
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">Patitas<span className="text-teal-500">Match</span></h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Red de Rescate</p>
                </div>
            </div>

            <div className="p-4 max-w-sm w-full mx-auto flex-1 flex flex-col justify-center">
                {loading && (
                    <div className="flex flex-col items-center justify-center gap-2 py-12">
                        <Loader2 size={28} className="animate-spin text-teal-500" />
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sincronizando Alertas...</span>
                    </div>
                )}

                {error && !loading && (
                    <div className="flex flex-col items-center justify-center text-center gap-3 py-12">
                        <AlertCircle size={32} className="text-red-400" />
                        <p className="text-xs font-semibold text-slate-400 max-w-[200px]">No se pudo cargar el canal de rescates.</p>
                        <button onClick={loadFeedData} className="text-xs font-bold text-teal-500 uppercase tracking-wider hover:text-teal-600">Reintentar</button>
                    </div>
                )}

                {!loading && !error && posts.length === 0 && (
                    <div className="flex flex-col items-center justify-center text-center gap-2 py-12 text-slate-300">
                        <CheckCircle size={36} />
                        <span className="text-xs font-bold uppercase tracking-wider">Sin alertas activas</span>
                    </div>
                )}

                {!loading && !error && posts.map(post => (
                    <FeedPost key={post.id} post={post} />
                ))}

                {!loading && !error && posts.length > 0 && (
                    <div className="py-6 flex flex-col items-center justify-center text-slate-300 gap-2">
                        <CheckCircle size={32} />
                        <span className="text-xs font-bold uppercase tracking-wider">Estás al día</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomePage;