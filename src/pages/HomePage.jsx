import { useState } from 'react';
import { MapPin, Clock, Heart, Share2, AlertCircle, CheckCircle, Navigation } from 'lucide-react';

const STATIC_FEED_DATA = [
    {
        id: "post_001",
        authorName: "María Fernández",
        authorAvatar: "👩🏽",
        location: "Sabana Grande",
        timeAgo: "Hace 10 min",
        imageUrl: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800",
        description: "Perrito asustado cerca del bulevar. Parece tener collar pero no veo placa de identificación.",
        tags: ["perro", "pequeño", "asustado"],
        status: "pending",
        likeCount: 12
    },
    {
        id: "post_002",
        authorName: "Carlos Mendoza",
        authorAvatar: "👨🏻",
        location: "Bello Monte",
        timeAgo: "Hace 2 horas",
        imageUrl: "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&q=80&w=800",
        description: "Gatito atrapado, los bomberos ya vienen en camino.",
        tags: ["gato", "rescate_activo"],
        status: "in_progress",
        likeCount: 45
    },
    {
        id: "post_003",
        authorName: "Ana Silva",
        authorAvatar: "👩🏻",
        location: "La Candelaria",
        timeAgo: "Hace 5 horas",
        imageUrl: "https://images.unsplash.com/photo-1537151608804-ea2f1d71df0c?auto=format&fit=crop&q=80&w=800",
        description: "Encontramos a este perrito vagando por la plaza. Ya está a salvo en el refugio esperando a sus dueños.",
        tags: ["perro", "mediano", "a_salvo"],
        status: "resolved",
        likeCount: 128
    },
    {
        id: "post_004",
        authorName: "Refugio Esperanza",
        authorAvatar: "🏥",
        location: "La Florida",
        timeAgo: "Hace 1 día",
        imageUrl: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=800",
        description: "Actualización del caso de ayer: Rocky está recuperándose súper bien. Pronto estará listo para adopción.",
        tags: ["perro", "recuperación", "refugio"],
        status: "resolved",
        likeCount: 302
    }
];

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
    resolved: {
        IconComponent: CheckCircle,
        label: "Animal a Salvo",
        colorClasses: "bg-teal-50 text-teal-600 border-teal-200"
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
    const [isLiked, setIsLiked] = useState(false);
    const [currentLikes, setCurrentLikes] = useState(post.likeCount);
    const [showHeartOverlay, setShowHeartOverlay] = useState(false);

    const handleToggleLike = () => {
        setIsLiked(!isLiked);
        setCurrentLikes(prev => isLiked ? prev - 1 : prev + 1);
    };

    const handleDoubleClickLike = () => {
        setShowHeartOverlay(true);
        if (!isLiked) {
            setIsLiked(true);
            setCurrentLikes(prev => prev + 1);
        }
        setTimeout(() => {
            setShowHeartOverlay(false);
        }, 600);
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
                console.log('Error compartiendo:', error);
            }
        } else {
            prompt('Copia este enlace para compartir:', window.location.href);
        }
    };

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
                className="w-full aspect-square bg-slate-100 relative select-none cursor-pointer overflow-hidden"
                onDoubleClick={handleDoubleClickLike}
            >
                <img
                    src={post.imageUrl}
                    alt="Animal reportado"
                    className="w-full h-full object-cover"
                    loading="lazy"
                />

                <div className={`absolute inset-0 flex items-center justify-center bg-black/10 transition-all duration-300 pointer-events-none ${showHeartOverlay ? 'opacity-100' : 'opacity-0'
                    }`}>
                    <Heart
                        size={80}
                        className={`text-white fill-current transition-all duration-300 transform ${showHeartOverlay ? 'scale-100 rotate-0' : 'scale-50 -rotate-12'
                            }`}
                    />
                </div>

                <div className="absolute top-3 right-3">
                    <StatusBadge status={post.status} />
                </div>
            </div>

            <div className="p-4">
                <div className="flex items-center gap-4 mb-3">
                    <button
                        onClick={handleToggleLike}
                        className={`flex items-center gap-1.5 transition-colors ${isLiked ? 'text-red-500' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <Heart size={24} className={isLiked ? "fill-current" : ""} />
                        <span className="font-bold text-sm">{currentLikes}</span>
                    </button>
                    <button
                        onClick={handleShare}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                        title="Compartir"
                    >
                        <Share2 size={22} />
                    </button>
                </div>

                <p className="text-sm font-medium text-slate-700 leading-relaxed mb-3">
                    <span className="font-bold text-slate-900 mr-2">{post.authorName}</span>
                    {post.description}
                </p>

                <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag, index) => (
                        <TagPill key={index} tag={tag} />
                    ))}
                </div>
            </div>
        </article>
    );
};

const HomePage = () => {
    return (
        <div className="h-full flex flex-col bg-slate-50 overflow-y-auto">
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-4 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">Patitas<span className="text-teal-500">Match</span></h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Red de Rescate</p>
                </div>
            </div>

            <div className="p-4 max-w-sm w-full mx-auto">
                {STATIC_FEED_DATA.map(post => (
                    <FeedPost key={post.id} post={post} />
                ))}

                <div className="py-6 flex flex-col items-center justify-center text-slate-300 gap-2">
                    <CheckCircle size={32} />
                    <span className="text-xs font-bold uppercase tracking-wider">Estás al día</span>
                </div>
            </div>
        </div>
    );
};

export default HomePage;