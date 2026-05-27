import { useEffect, useState, useRef } from 'react';
import { MapPin, Navigation, X, Loader2 } from 'lucide-react';
import L from 'leaflet';

const ActiveRescueMap = ({ targetLat, targetLng, animalName, onClose }) => {
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const userMarkerRef = useRef(null);
    const geoWatchIdRef = useRef(null);

    const [userLocation, setUserLocation] = useState(null);
    const [distanceMeters, setDistanceMeters] = useState(null);
    const [trackingError, setTrackingError] = useState(false);

    const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
        const earthRadiusKm = 6371;
        const deltaLat = (lat2 - lat1) * Math.PI / 180;
        const deltaLon = (lon2 - lon1) * Math.PI / 180;

        const MathFormulaA =
            Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

        const MathFormulaC = 2 * Math.atan2(Math.sqrt(MathFormulaA), Math.sqrt(1 - MathFormulaA));
        return earthRadiusKm * MathFormulaC * 1000;
    };

    useEffect(() => {
        if (!mapContainerRef.current) return;

        mapInstanceRef.current = L.map(mapContainerRef.current, {
            center: [targetLat, targetLng],
            zoom: 16,
            zoomControl: false
        });

        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            maxZoom: 19
        }).addTo(mapInstanceRef.current);

        const animalIcon = L.divIcon({
            html: `<div class="w-9 h-9 bg-red-500 text-white rounded-full flex items-center justify-center text-lg border-4 border-white shadow-xl animate-bounce">🚨</div>`,
            className: '',
            iconSize: [36, 36],
            iconAnchor: [18, 18]
        });

        L.marker([targetLat, targetLng], { icon: animalIcon }).addTo(mapInstanceRef.current);

        L.circle([targetLat, targetLng], {
            radius: 150,
            color: '#ef4444',
            fillColor: '#ef4444',
            fillOpacity: 0.12,
            weight: 1.5,
            dashArray: '4, 4'
        }).addTo(mapInstanceRef.current);

        if ('geolocation' in navigator) {
            geoWatchIdRef.current = navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserLocation({ lat: latitude, lng: longitude });
                    setTrackingError(false);

                    const computedDistance = calculateHaversineDistance(latitude, longitude, targetLat, targetLng);
                    setDistanceMeters(computedDistance);

                    const rescuerIcon = L.divIcon({
                        html: `<div class="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center border-4 border-white shadow-xl ring-4 ring-teal-500/20">🏃‍♂️</div>`,
                        className: '',
                        iconSize: [32, 32],
                        iconAnchor: [16, 16]
                    });

                    if (userMarkerRef.current) {
                        userMarkerRef.current.setLatLng([latitude, longitude]);
                    } else {
                        userMarkerRef.current = L.marker([latitude, longitude], { icon: rescuerIcon }).addTo(mapInstanceRef.current);
                    }
                },
                () => {
                    setTrackingError(true);
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        } else {
            setTrackingError(true);
        }

        return () => {
            if (geoWatchIdRef.current !== null) {
                navigator.geolocation.clearWatch(geoWatchIdRef.current);
            }
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
            }
        };
    }, [targetLat, targetLng]);

    const handleCenterMapFrame = () => {
        if (!mapInstanceRef.current) return;

        if (userLocation) {
            const bounds = L.latLngBounds([
                [userLocation.lat, userLocation.lng],
                [targetLat, targetLng]
            ]);
            mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40] });
        } else {
            mapInstanceRef.current.setView([targetLat, targetLng], 16);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white w-full max-w-sm h-[80vh] rounded-[2.5rem] shadow-2xl border border-slate-100 flex flex-col overflow-hidden relative animate-in zoom-in-95 duration-150">

                <div className="absolute top-4 right-4 z-[1000]">
                    <button
                        onClick={onClose}
                        className="w-9 h-9 bg-white text-slate-700 rounded-2xl flex items-center justify-center shadow-lg border border-slate-100 active:scale-90 transition-transform"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="absolute top-4 left-4 z-[1000] max-w-[70%]">
                    <div className="bg-white p-3.5 rounded-2xl shadow-lg border border-slate-100/80 text-left space-y-1">
                        <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest block">Caso en Progreso</span>
                        <h4 className="text-xs font-black text-slate-800 truncate">{animalName || 'Mascota'}</h4>
                        <div className="pt-1.5 flex items-center gap-1.5 text-xs font-extrabold text-slate-600 border-t border-slate-50 mt-1">
                            <Navigation size={12} className="text-teal-500 fill-teal-500 animate-pulse" />
                            {distanceMeters !== null ? (
                                distanceMeters > 1000
                                    ? `${(distanceMeters / 1000).toFixed(2)} km de distancia`
                                    : `${Math.round(distanceMeters)} metros de distancia`
                            ) : trackingError ? (
                                <span className="text-red-500 text-[10px]">Ubicación GPS denegada</span>
                            ) : (
                                <span className="text-slate-400 flex items-center gap-1 text-[10px]"><Loader2 size={10} className="animate-spin" /> Buscando tu señal...</span>
                            )}
                        </div>
                    </div>
                </div>

                <div ref={mapContainerRef} className="w-full flex-1 bg-slate-100 z-10" />

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] w-[88%]">
                    <button
                        onClick={handleCenterMapFrame}
                        className="w-full py-3.5 bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-xl shadow-slate-900/20 hover:bg-slate-900 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        <MapPin size={14} className="text-teal-400" /> Centrar Ruta de Rescate
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ActiveRescueMap;