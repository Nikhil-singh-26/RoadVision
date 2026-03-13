import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl, LayerGroup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon issues in React
const createCustomIcon = (color) => {
  return L.divIcon({
    className: 'custom-pothole-marker',
    html: `
      <div style="position: relative; width: 30px; height: 30px;">
        <div style="position: absolute; width: 100%; height: 100%; background: ${color}; border-radius: 50%; opacity: 0.3; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="position: absolute; left: 5px; top: 5px; width: 20px; height: 20px; background: ${color}; border-radius: 50%; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3); z-index: 10;"></div>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
};

// Component to handle map re-centering
const RecenterMap = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center);
    }
  }, [center, map]);
  return null;
};

const PotholeMap = ({ potholes, activeLayer = 'street' }) => {
  const navigate = useNavigate();
  const [center, setCenter] = useState([20.5937, 78.9629]); // Default to India center
  const [hasUserLocation, setHasUserLocation] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState('');

  const getUserLocation = (isManual = false) => {
    if (!("geolocation" in navigator)) {
      setGeoError("Geolocation not supported");
      return;
    }

    setIsLocating(true);
    setGeoError('');
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newCoords = [position.coords.latitude, position.coords.longitude];
        setCenter(newCoords);
        setHasUserLocation(true);
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        let msg = "Location access denied";
        if (error.code === error.TIMEOUT) msg = "Location request timed out";
        if (error.code === error.POSITION_UNAVAILABLE) msg = "Location information unavailable";
        
        setGeoError(msg);
        console.warn(`Geolocation error: ${msg}`);
        
        if (!isManual && potholes && potholes.length > 0) {
          setCenter([potholes[0].latitude, potholes[0].longitude]);
        }
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    getUserLocation();
  }, [potholes]);

  return (
    <div style={{ height: '100%', width: '100%', minHeight: '500px' }} className="rounded-2xl overflow-hidden border border-gray-200 shadow-inner bg-gray-50 relative">
      {geoError && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1100] bg-red-600 text-white px-4 py-2 rounded-full text-[10px] font-bold shadow-xl animate-bounce">
          {geoError}
        </div>
      )}

      <MapContainer 
        center={center} 
        zoom={hasUserLocation ? 14 : 12} 
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <RecenterMap center={center} />
        
        {/* Dynamic Tile Layer based on activeLayer prop */}
        {activeLayer === 'street' && (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        )}
        {activeLayer === 'satellite' && (
          <TileLayer
            attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        )}
        {activeLayer === 'dark' && (
          <TileLayer
            attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
            url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
          />
        )}

        <LayersControl position="topright">
          <LayersControl.Overlay checked name="Pothole Markers">
            <LayerGroup>
              {potholes && potholes.map((pothole) => {
                let color = '#10B981'; // Green for low severity
                if (pothole.severityLevel === 'medium') color = '#F59E0B'; // Orange
                if (pothole.severityLevel === 'high') color = '#EF4444'; // Red
                if (pothole.status === 'fixed') color = '#4B5563'; // Gray

                return (
                  <Marker 
                    key={pothole._id || Math.random()} 
                    position={[pothole.latitude, pothole.longitude]} 
                    icon={createCustomIcon(color)}
                  >
                    <Popup>
                      <div className="p-3 min-w-[220px] font-sans">
                        <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-100">
                          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Detection Index</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${pothole.status === 'fixed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                            {pothole.status.replace('_', ' ')}
                          </span>
                        </div>
                        
                        <h3 className="text-sm font-bold text-[#1a237e] mb-2 flex items-center">
                          Level: <span style={{ color }} className="ml-1 uppercase">{pothole.severityLevel}</span>
                        </h3>
                        
                        <div className="space-y-1.5 mb-3">
                          <div className="flex justify-between text-[10px]">
                              <span className="text-gray-500">AI Confidence:</span>
                              <span className="font-bold text-gray-900">{(pothole.detectionConfidence * 100).toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between text-[10px]">
                              <span className="text-gray-500">Coordinates:</span>
                              <span className="font-mono">{pothole.latitude.toFixed(4)}, {pothole.longitude.toFixed(4)}</span>
                          </div>
                        </div>

                        {pothole.imageUrl && (
                          <div className="rounded-lg overflow-hidden border border-gray-100 mb-3 shadow-sm">
                            <img src={pothole.imageUrl} className="w-full h-24 object-cover" alt="Verification" />
                          </div>
                        )}
                        
                        <button 
                          onClick={() => navigate(`/report?lat=${pothole.latitude}&lng=${pothole.longitude}&severity=${pothole.severityLevel}`)}
                          className="w-full py-2 bg-[#1a237e] text-white text-[10px] font-bold rounded-lg hover:bg-[#283593] transition-colors uppercase tracking-widest"
                        >
                          Log Maintenance Request
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </LayerGroup>
          </LayersControl.Overlay>

          <LayersControl.Overlay name="User Location">
             <LayerGroup>
                {hasUserLocation && (
                  <Marker position={center} icon={L.divIcon({
                    className: 'user-location-marker',
                    html: `<div class="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg shadow-blue-500/50"></div>`,
                    iconSize: [20, 20],
                    iconAnchor: [10, 10]
                  })}>
                    <Popup>You are here</Popup>
                  </Marker>
                )}
             </LayerGroup>
          </LayersControl.Overlay>
        </LayersControl>
      </MapContainer>

      {/* Re-center Button */}
      <button 
        onClick={() => getUserLocation(true)}
        disabled={isLocating}
        className={`absolute bottom-6 left-6 z-[1000] bg-white p-3 rounded-full shadow-2xl border border-gray-100 hover:bg-gray-50 transition-all group disabled:opacity-50`}
        title="My Location"
      >
        <div className={`w-3 h-3 rounded-full ${isLocating ? 'bg-orange-500 animate-spin' : (hasUserLocation ? 'bg-blue-600' : 'bg-gray-400')} ${!isLocating && 'animate-pulse'}`}></div>
      </button>
    </div>
  );
};

export default PotholeMap;
