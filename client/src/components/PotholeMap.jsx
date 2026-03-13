import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon issues in React
// Using a stylized divIcon as requested for professional look
const createCustomIcon = (color) => {
  return L.divIcon({
    className: 'custom-pothole-marker',
    html: `
      <div style="position: relative; width: 30px; height: 30px;">
        <div style="position: absolute; width: 100%; height: 100%; background: ${color}; border-radius: 50%; opacity: 0.3; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="position: absolute; left: 5px; top: 5px; width: 20px; height: 20px; background: ${color}; border-radius: 50%; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3); z-index: 10;"></div>
      </div>
      <style>
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      </style>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
};

const PotholeMap = ({ potholes }) => {
  // Ensure we have a valid center, fallback to India center if no potholes
  const center = potholes && potholes.length > 0 
    ? [potholes[0].latitude, potholes[0].longitude] 
    : [20.5937, 78.9629]; 

  return (
    <div style={{ height: '100%', width: '100%', minHeight: '500px' }} className="rounded-2xl overflow-hidden border border-gray-200 shadow-inner bg-gray-50">
      <MapContainer 
        center={center} 
        zoom={12} 
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {potholes && potholes.map((pothole) => {
          let color = '#10B981'; // Green for low severity
          if (pothole.severityLevel === 'medium') color = '#F59E0B'; // Orange
          if (pothole.severityLevel === 'high') color = '#EF4444'; // Red
          
          if (pothole.status === 'fixed') color = '#4B5563'; // Gray/Dark for resolved

          return (
            <Marker 
              key={pothole._id || Math.random()} 
              position={[pothole.latitude, pothole.longitude]} 
              icon={createCustomIcon(color)}
            >
              <Popup>
                <div className="p-3 min-w-[220px] font-sans">
                  <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-100">
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Detection Details</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${pothole.status === 'fixed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      {pothole.status.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <h3 className="text-sm font-bold text-[#1a237e] mb-2 flex items-center">
                    Level: <span style={{ color }} className="ml-1 uppercase">{pothole.severityLevel}</span>
                  </h3>
                  
                  <div className="space-y-1.5 mb-3">
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Confidence:</span>
                        <span className="font-bold text-gray-900">{(pothole.detectionConfidence * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-500">GPS:</span>
                        <span className="font-mono text-[10px]">{pothole.latitude.toFixed(4)}, {pothole.longitude.toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Date:</span>
                        <span className="text-gray-900">{new Date(pothole.detectedAt || Date.now()).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {pothole.imageUrl && (
                    <div className="rounded-lg overflow-hidden border border-gray-200 mb-2">
                      <img src={pothole.imageUrl} className="w-full h-24 object-cover" alt="Verification" />
                    </div>
                  )}
                  
                  <button className="w-full py-1.5 bg-[#1a237e] text-white text-[10px] font-bold rounded hover:bg-[#283593] transition-colors">
                    GENERATE MAINTENENCE TICKET
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default PotholeMap;
