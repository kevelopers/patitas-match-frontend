import { Camera } from 'lucide-react';

const ImagePicker = ({ previewUrl, onFileSelect, placeholderText = "Seleccionar Imagen" }) => {
    const handleInputChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            onFileSelect(e.target.files[0]);
        }
    };

    return (
        <label className="w-full aspect-[16/9] border-2 border-dashed border-slate-200 bg-slate-50 rounded-2xl flex flex-col items-center justify-center gap-1 cursor-pointer text-slate-400 hover:bg-slate-100/50 transition-colors overflow-hidden relative shrink-0">
            <input
                type="file"
                accept="image/*"
                onChange={handleInputChange}
                className="hidden"
            />
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
        </label>
    );
};

export default ImagePicker;