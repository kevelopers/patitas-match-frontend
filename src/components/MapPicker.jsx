import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { X, Check, Navigation, Loader2 } from 'lucide-react';

const createCustomPin = () => {
    return L.divIcon({
        html: `<div class="w-8 h-8 flex items-center justify-center bg-teal-500 rounded-full border-2 border-white shadow-xl animate-bounce text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="4" r="2"></circle>
                <circle cx="18" cy="8" r="2"></circle>
                <circle cx="20" cy="16" r="2"></circle>
                <path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z"></path>
            </svg>
        </div>`,
        className: 'custom-leaflet-pin',
        iconSize: [32, 32],
        iconAnchor: [16, 32]
    });
};

const MapInteraction = ({ onLocationPick, centerPosition }) => {
    const map = useMap();

    useMapEvents({
        click(e) {
            onLocationPick(e.latlng.lat, e.latlng.lng);
        }
    });

    useEffect(() => {
        if (centerPosition) {
            map.flyTo([centerPosition.lat, centerPosition.lng], 16, {
                animate: true,
                duration: 1.5
            });
        }
    }, [centerPosition, map]);

    return null;
};

const MapPicker = ({ initialLat = 10.4806, initialLng = -66.9036, onConfirm, onClose }) => {
    const [markerPosition, setMarkerPosition] = useState({ lat: initialLat, lng: initialLng });
    const [isLocating, setIsLocating] = useState(false);
    const [mapCenter, setMapCenter] = useState(null);

    useEffect(() => {
        handleLocateMe();
    }, []);

    const handleLocationChange = (lat, lng) => {
        setMarkerPosition({ lat, lng });
    };

    const handleLocateMe = () => {
        setIsLocating(true);
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setMarkerPosition({ lat: latitude, lng: longitude });
                    setMapCenter({ lat: latitude, lng: longitude });
                    setIsLocating(false);
                },
                () => {
                    setIsLocating(false);
                },
                { enableHighAccuracy: true }
            );
        } else {
            setIsLocating(false);
        }
    };

    const handleApplySelection = () => {
        onConfirm(markerPosition.lat, markerPosition.lng);
    };

    return (
        <div className="fixed inset-0 z-[9999] bg-slate-50 flex flex-col animate-in slide-in-from-bottom-full">
            <div className="flex items-center justify-between p-4 bg-white border-b border-slate-100 shadow-sm z-10 shrink-0">
                <div>
                    <h2 className="text-lg font-black text-slate-800 tracking-tight">Ubicación del Rescate</h2>
                    <p className="text-[10px] font-bold text-teal-500 uppercase tracking-widest mt-0.5">Selección de Coordenadas</p>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition-colors"
                >
                    <X size={18} />
                </button>
            </div>

            <div className="flex-1 relative z-0 min-h-0">
                <MapContainer
                    center={[initialLat, initialLng]}
                    zoom={14}
                    className="w-full h-full"
                    zoomControl={false}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; OpenStreetMap contributors'
                    />
                    <MapInteraction onLocationPick={handleLocationChange} centerPosition={mapCenter} />
                    <Marker position={[markerPosition.lat, markerPosition.lng]} icon={createCustomPin()} />
                </MapContainer>

                <button
                    onClick={handleLocateMe}
                    disabled={isLocating}
                    className="absolute bottom-6 right-4 z-[400] w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center border border-slate-100 text-slate-700 hover:bg-slate-50 active:scale-95 transition-all disabled:opacity-80"
                >
                    {isLocating ? (
                        <Loader2 size={24} className="animate-spin text-teal-500" />
                    ) : (
                        <Navigation size={24} className="text-teal-500" />
                    )}
                </button>
            </div>

            <div className="p-4 bg-white border-t border-slate-100 flex flex-col gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10 shrink-0">
                <div className="text-center text-xs font-mono font-bold text-slate-500 bg-slate-50 py-2.5 rounded-xl border border-slate-100">
                    Lat: {markerPosition.lat.toFixed(5)} | Lng: {markerPosition.lng.toFixed(5)}
                </div>
                <button
                    onClick={handleApplySelection}
                    className="w-full py-3.5 bg-teal-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 hover:bg-teal-600 transition-colors text-sm"
                >
                    <Check size={18} strokeWidth={2.5} />
                    Confirmar Ubicación
                </button>
            </div>
        </div>
    );
};

export default MapPicker;