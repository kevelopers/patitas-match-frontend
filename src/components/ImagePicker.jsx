import { useState } from 'react';
import { Camera, Image, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ImagePicker = ({ previewUrl, onFileSelect, placeholderText = "Seleccionar Imagen" }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            onFileSelect(e.target.files[0]);
            setIsOpen(false);
        }
    };

    return (
        <div className="w-full h-full">
            <div
                onClick={(e) => { e.preventDefault(); setIsOpen(true); }}
                className="w-full h-full min-h-[160px] border-2 border-dashed border-slate-200 bg-slate-50 rounded-3xl flex flex-col items-center justify-center gap-1 cursor-pointer text-slate-400 hover:bg-slate-100/50 transition-colors overflow-hidden relative"
            >
                {previewUrl ? (
                    <div className="absolute inset-0 w-full h-full pointer-events-none">
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute bottom-3 right-3 bg-black/60 text-white text-[9px] px-2 py-1 rounded-md font-bold uppercase tracking-wider backdrop-blur-sm">
                            Cambiar
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center pointer-events-none">
                        <Camera size={26} className="text-teal-500 mb-1" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            {placeholderText}
                        </span>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 select-none">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => setIsOpen(false)}
                            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ opacity: 0, y: 40, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 24, scale: 0.96 }}
                            transition={{ type: "spring", damping: 26, stiffness: 330 }}
                            className="w-full max-w-[290px] bg-white rounded-[2.5rem] p-5 shadow-2xl relative z-10 border border-slate-100 flex flex-col gap-4 text-center"
                        >
                            <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                                <h4 className="text-[11px] font-black text-slate-800 tracking-wider uppercase">
                                    Seleccionar Origen
                                </h4>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="w-7 h-7 bg-slate-50 hover:bg-slate-100 text-slate-400 rounded-full flex items-center justify-center active:scale-90 transition-transform"
                                >
                                    <X size={12} strokeWidth={2.5} />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <label className="flex flex-col items-center justify-center gap-2 p-4 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-2xl cursor-pointer active:scale-95 transition-all text-slate-600">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        capture="environment"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-500 flex items-center justify-center border border-teal-100/50">
                                        <Camera size={20} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-wider">Cámara</span>
                                </label>

                                <label className="flex flex-col items-center justify-center gap-2 p-4 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-2xl cursor-pointer active:scale-95 transition-all text-slate-600">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                    <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center border border-orange-100/50">
                                        <Image size={20} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-wider">Galería</span>
                                </label>
                            </div>

                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-400 font-bold text-[11px] uppercase tracking-wider rounded-xl border border-slate-200/40 transition-colors"
                            >
                                Cancelar
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ImagePicker;