import { useState, useEffect, useRef } from 'react';
import { Camera, MapPin, Loader2, CheckCircle, AlertCircle, Map } from 'lucide-react';
import MapPicker from '../../components/MapPicker';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const RescuePage = () => {
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [locationText, setLocationText] = useState("");
    const [descriptionText, setDescriptionText] = useState("");
    const [simulationState, setSimulationState] = useState("idle");
    const [aiTags, setAiTags] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const [showMapModal, setShowMapModal] = useState(false);
    const [mapCoordinates, setMapCoordinates] = useState({ lat: 10.4806, lng: -66.9036 });

    const [locationSuggestions, setLocationSuggestions] = useState([]);
    const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);

    const searchDebounceRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        return () => {
            if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
        };
    }, []);

    const handleImageSelection = (event) => {
        const file = event.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setSimulationState("idle");
            setAiTags("");
            setErrorMessage("");
        }
        event.target.value = null;
    };

    const handleTriggerFileSelect = (e) => {
        e.preventDefault();
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const queryExternalLocations = async (searchQuery) => {
        if (searchQuery.length < 3) {
            setLocationSuggestions([]);
            return;
        }
        setIsSearchingSuggestions(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`);
            const payload = await response.json();
            setLocationSuggestions(payload);
        } catch {
            setLocationSuggestions([]);
        } finally {
            setIsSearchingSuggestions(false);
        }
    };

    const handleLocationInputChange = (e) => {
        const textValue = e.target.value;
        setLocationText(textValue);

        if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
        searchDebounceRef.current = setTimeout(() => {
            queryExternalLocations(textValue);
        }, 500);
    };

    const handleSelectSuggestion = (item) => {
        setLocationText(item.display_name.split(',')[0]);
        setMapCoordinates({ lat: parseFloat(item.lat), lng: parseFloat(item.lon) });
        setLocationSuggestions([]);
    };

    const handleConfirmMapPosition = (lat, lng) => {
        setMapCoordinates({ lat, lng });
        setLocationText(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        setShowMapModal(false);
    };

    const handleFormSubmit = async () => {
        if (!imageFile || !locationText) return;

        setSimulationState("uploading");
        setErrorMessage("");

        const token = localStorage.getItem("access_token");
        const formData = new FormData();
        formData.append("location", `${locationText} | ${descriptionText}`);
        formData.append("image", imageFile);

        try {
            const response = await fetch(`${API_BASE_URL}/rescues`, {
                method: "POST",
                body: formData,
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error("Fallo en la comunicación con el servidor");
            }

            const result = await response.json();

            if (result.ai_tags === "INVALID_CONTENT" || result.status === "rejected") {
                setSimulationState("error");
                setErrorMessage("La IA detectó que la imagen no corresponde a un perro, gato o animal.");
            } else {
                setSimulationState("success");
                setAiTags(result.ai_tags);
            }
        } catch (error) {
            setSimulationState("error");
            setErrorMessage("Error al conectar con el servidor de Inteligencia Artificial.");
        }
    };

    const handleResetForm = () => {
        setImagePreview(null);
        setImageFile(null);
        setLocationText("");
        setDescriptionText("");
        setSimulationState("idle");
        setAiTags("");
        setErrorMessage("");
        setLocationSuggestions([]);
    };

    return (
        <div className="h-full flex flex-col bg-slate-50 overflow-hidden">
            <div className="bg-white border-b border-slate-100 px-4 py-4 flex items-center justify-between shrink-0 shadow-sm">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">Reportar Rescate</h1>
                    <p className="text-xs font-bold text-teal-500 uppercase tracking-widest mt-0.5">Ingresa las Alertas</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5 max-w-sm w-full mx-auto relative">
                <div
                    onClick={handleTriggerFileSelect}
                    className="relative w-full aspect-video bg-white rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden cursor-pointer active:scale-[0.98] transition-transform shadow-[0_4px_12px_rgba(0,0,0,0.02)] shrink-0"
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageSelection}
                        disabled={simulationState === "uploading"}
                    />
                    {imagePreview ? (
                        <img src={imagePreview} alt="Rescue Target" className="w-full h-full object-cover" />
                    ) : (
                        <div className="flex flex-col items-center text-slate-400">
                            <Camera size={36} className="mb-2 text-teal-500" />
                            <span className="font-bold text-xs tracking-wide">Subir foto del animal</span>
                        </div>
                    )}
                    {simulationState === "uploading" && (
                        <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                            <Loader2 size={32} className="animate-spin mb-3 text-teal-400" />
                            <span className="font-semibold text-sm animate-pulse tracking-wide">IA Procesando Imagen...</span>
                        </div>
                    )}
                </div>

                <div className="flex gap-2 relative z-30 shrink-0">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <MapPin size={18} className="text-teal-500" />
                        </div>
                        <input
                            type="text"
                            placeholder="Ej: El Silencio, Caracas"
                            value={locationText}
                            onChange={handleLocationInputChange}
                            disabled={simulationState === "uploading"}
                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all shadow-sm"
                        />

                        {locationSuggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden z-50">
                                {locationSuggestions.map((item) => (
                                    <button
                                        key={item.place_id}
                                        onClick={() => handleSelectSuggestion(item)}
                                        className="w-full text-left px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors last:border-0 flex flex-col"
                                    >
                                        <span className="text-xs font-bold text-slate-800 truncate">{item.display_name.split(',')[0]}</span>
                                        <span className="text-[10px] font-medium text-slate-400 truncate mt-0.5">{item.display_name}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => setShowMapModal(true)}
                        disabled={simulationState === "uploading"}
                        className="bg-white text-teal-500 p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center hover:bg-teal-50 hover:border-teal-300 active:scale-95 transition-all"
                    >
                        <Map size={20} />
                    </button>
                </div>

                <div className="relative z-10 shrink-0">
                    <textarea
                        placeholder="Descripción de la situación..."
                        value={descriptionText}
                        onChange={(e) => setDescriptionText(e.target.value)}
                        disabled={simulationState === "uploading"}
                        className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all resize-none h-24 shadow-sm"
                    />
                </div>

                {simulationState === "success" && (
                    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 z-10 shrink-0">
                        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex gap-3">
                            <CheckCircle size={20} className="text-green-500 shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <h3 className="font-bold text-green-800 text-sm">Reporte Enviado</h3>
                                <p className="text-green-700 text-xs mt-1 leading-relaxed">
                                    Análisis completo. Categoría asignada: <span className="font-mono font-bold bg-green-100/80 px-1.5 py-0.5 rounded text-green-800 capitalize">{aiTags}</span>
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleResetForm}
                            className="w-full py-3.5 bg-white border-2 border-teal-500 text-teal-600 rounded-2xl font-bold hover:bg-teal-50 active:scale-[0.98] transition-all flex items-center justify-center text-sm"
                        >
                            Crear nueva alerta
                        </button>
                    </div>
                )}

                {simulationState === "error" && (
                    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 z-10 shrink-0">
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3">
                            <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <h3 className="font-bold text-red-800 text-sm">Reporte Rehusado</h3>
                                <p className="text-red-700 text-xs mt-1 leading-relaxed">{errorMessage}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleResetForm}
                            className="w-full py-3.5 bg-white border-2 border-slate-300 text-slate-600 rounded-2xl font-bold hover:bg-slate-100 active:scale-[0.98] transition-all flex items-center justify-center text-sm"
                        >
                            Intentar con otra foto
                        </button>
                    </div>
                )}

                {simulationState === "idle" && (
                    <button
                        onClick={handleFormSubmit}
                        disabled={!imagePreview || !locationText}
                        className="w-full py-4 bg-teal-500 text-white rounded-2xl font-bold shadow-lg shadow-teal-500/20 hover:bg-teal-600 active:scale-[0.98] transition-all disabled:opacity-40 disabled:shadow-none flex items-center justify-center gap-2 text-sm z-10 shrink-0"
                    >
                        Enviar Reporte
                    </button>
                )}

                {simulationState === "uploading" && (
                    <button disabled className="w-full py-4 bg-teal-400 text-white rounded-2xl font-bold flex items-center justify-center gap-2 text-sm z-10 shrink-0">
                        <Loader2 size={18} className="animate-spin" />
                        Ejecutando Visión Artificial...
                    </button>
                )}
            </div>

            {showMapModal && (
                <MapPicker
                    initialLat={mapCoordinates.lat}
                    initialLng={mapCoordinates.lng}
                    onConfirm={handleConfirmMapPosition}
                    onClose={() => setShowMapModal(false)}
                />
            )}
        </div>
    );
};

export default RescuePage;