import { useState } from 'react';
import { Camera, Image, X } from 'lucide-react';

const ImagePicker = ({ previewUrl, onFileSelect, placeholderText = "Seleccionar Imagen" }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            onFileSelect(e.target.files[0]);
            setIsOpen(false);
        }
    };

    const handleOpenSheet = (e) => {
        e.preventDefault();
        setIsOpen(true);
    };

    return (
        <div className="w-full">
            <div
                onClick={handleOpenSheet}
                className="w-full aspect-[16/9] border-2 border-dashed border-slate-200 bg-slate-50 rounded-2xl flex flex-col items-center justify-center gap-1 cursor-pointer text-slate-400 hover:bg-slate-100/50 transition-colors overflow-hidden relative shrink-0"
            >
                {previewUrl ? (
                    <div className="absolute inset-0 w-full h-full pointer-events-none">
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider backdrop-blur-sm">
                            Cambiar
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center pointer-events-none">
                        <Camera size={20} className="text-slate-300" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            {placeholderText}
                        </span>
                    </div>
                )}
            </div>

            {isOpen && (
                <div className="fixed inset-0 z-[20000] flex items-end justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div
                        className="absolute inset-0"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="w-full max-w-sm bg-white rounded-t-[2rem] p-6 space-y-4 shadow-2xl relative z-10 animate-in slide-in-from-bottom-full duration-300 ease-out flex flex-col pb-8">
                        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-2 shrink-0" />

                        <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                            <h4 className="text-sm font-black text-slate-800 tracking-tight uppercase">
                                Seleccionar Origen
                            </h4>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-7 h-7 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center font-bold text-xs"
                            >
                                <X size={14} />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <label className="flex flex-col items-center justify-center gap-3 p-5 bg-slate-50 hover:bg-slate-100/80 border border-slate-100 rounded-2xl cursor-pointer active:scale-95 transition-all text-slate-600">
                                <input
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-500 flex items-center justify-center border border-teal-100/50">
                                    <Camera size={24} />
                                </div>
                                <span className="text-xs font-black uppercase tracking-wider">Cámara</span>
                            </label>

                            <label className="flex flex-col items-center justify-center gap-3 p-5 bg-slate-50 hover:bg-slate-100/80 border border-slate-100 rounded-2xl cursor-pointer active:scale-95 transition-all text-slate-600">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center border border-orange-100/50">
                                    <Image size={24} />
                                </div>
                                <span className="text-xs font-black uppercase tracking-wider">Galería</span>
                            </label>
                        </div>

                        <button
                            onClick={() => setIsOpen(false)}
                            className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold text-xs uppercase tracking-widest rounded-xl transition-colors mt-2"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImagePicker;