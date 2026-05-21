import { useState } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { X, Heart } from 'lucide-react';

const MatchCard = ({ animal, onAccept, onReject }) => {
    const [likeActivated, setLikeActivated] = useState(false);
    const x = useMotionValue(0);

    const rotate = useTransform(x, [-200, 200], [-25, 25]);
    const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);

    const rejectBg = useTransform(x, [-120, 0], ['#ef4444', '#ffffff']);
    const rejectColor = useTransform(x, [-120, 0], ['#ffffff', '#ef4444']);
    const rejectBorder = useTransform(x, [-120, 0], ['#ef4444', '#e2e8f0']);

    const acceptBg = useTransform(x, [0, 120], ['#ffffff', '#14b8a6']);
    const acceptColor = useTransform(x, [0, 120], ['#f97316', '#ffffff']);
    const acceptBorder = useTransform(x, [0, 120], ['#e2e8f0', '#14b8a6']);
    const acceptScale = useTransform(x, [0, 120], [1, 1.15]);

    const triggerLikeOverlay = () => {
        setLikeActivated(true);
        setTimeout(() => setLikeActivated(false), 800);
    };

    const handleDragEnd = (event, info) => {
        if (info.offset.x > 140) {
            triggerLikeOverlay();
            setTimeout(() => onAccept(), 500);
        }
        else if (info.offset.x < -140) {
            onReject();
        }
    };

    const handleButtonClick = (action, isLike = false) => {
        if (isLike) {
            triggerLikeOverlay();
            setTimeout(() => action(), 500);
        } else {
            action();
        }
    };

    return (
        <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            style={{ x, rotate, opacity }}
            onDragEnd={handleDragEnd}
            whileDrag={{ cursor: 'grabbing' }}
            className="absolute left-0 right-0 mx-auto w-full max-w-[340px] h-full bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col border border-slate-100 cursor-grab touch-none select-none z-10"
        >
            <div className="h-[52%] bg-slate-100 flex flex-col items-center justify-center relative pointer-events-none overflow-hidden">
                <span className="text-8xl filter drop-shadow-xl select-none relative z-10">🐶</span>

                <AnimatePresence>
                    {likeActivated && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.3 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.5 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className="absolute inset-0 flex items-center justify-center bg-black/10 z-20 backdrop-blur-[1px]"
                        >
                            <Heart size={100} className="text-white/70 fill-white/40" strokeWidth={1} />
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="absolute top-4 left-4 bg-slate-900/60 backdrop-blur-md text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-black tracking-wide border border-white/10 shadow-lg z-30">
                    <span className="text-amber-400 font-bold">✨</span>
                    <span>{animal.match_score}% Match</span>
                </div>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between bg-white min-h-0 relative z-10">
                <div className="pointer-events-none">
                    <h2 className="text-2xl font-black text-slate-800 leading-tight">
                        {animal.name}
                    </h2>
                    <div className="flex gap-2 mt-3">
                        <span className="px-2.5 py-1 bg-slate-50 border border-slate-100 text-slate-500 text-[10px] font-bold rounded-xl uppercase tracking-wider">
                            T: {animal.size}
                        </span>
                        <span className="px-2.5 py-1 bg-slate-50 border border-slate-100 text-slate-500 text-[10px] font-bold rounded-xl uppercase tracking-wider">
                            E: {animal.energy_level}
                        </span>
                    </div>
                </div>

                <div className="flex items-center justify-center gap-5 mt-4 z-20">
                    <motion.button
                        onClick={() => handleButtonClick(onReject)}
                        style={{
                            backgroundColor: rejectBg,
                            color: rejectColor,
                            borderColor: rejectBorder
                        }}
                        whileHover={{
                            backgroundColor: '#ef4444',
                            color: '#ffffff',
                            borderColor: '#ef4444',
                            scale: 1.1
                        }}
                        whileTap={{ scale: 0.9 }}
                        className="w-14 h-14 border rounded-full flex items-center justify-center shadow-md transition-shadow duration-200 focus:outline-none z-10"
                    >
                        <X size={26} strokeWidth={3} />
                    </motion.button>

                    <motion.button
                        onClick={() => handleButtonClick(onAccept, true)}
                        style={{
                            backgroundColor: acceptBg,
                            color: acceptColor,
                            borderColor: acceptBorder,
                            scale: acceptScale
                        }}
                        whileHover={{
                            backgroundColor: '#14b8a6',
                            color: '#ffffff',
                            borderColor: '#14b8a6',
                            scale: 1.15
                        }}
                        whileTap={{ scale: 0.9 }}
                        className="w-16 h-16 border rounded-full flex items-center justify-center shadow-lg transition-all duration-200 focus:outline-none z-10"
                    >
                        <Heart size={30} className="fill-current" strokeWidth={2.5} />
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
};

export default MatchCard;