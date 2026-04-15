import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useTheme } from 'next-themes';

// Fix for default marker icons in Next.js / Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom component to handle theme changes for the map tiles
function ThemeMapLayer() {
  const { theme } = useTheme();
  const map = useMap();
  
  const tileUrl = theme === 'dark'
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
    
  // You could add transition effects here if desired
  
  return (
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      url={tileUrl}
    />
  );
}

export interface MapMarkerData {
  _id: string;
  title: string;
  category: string;
  region_name: string;
  latitude: number;
  longitude: number;
}

interface CulturalMapProps {
  markers: MapMarkerData[];
  onMarkerClick: (regionName: string, markerId: string) => void;
  center?: [number, number];
  zoom?: number;
}

// Default center to India if not specified
const DEFAULT_CENTER: [number, number] = [20.5937, 78.9629];

export default function CulturalMap({ 
    markers, 
    onMarkerClick,
    center = DEFAULT_CENTER,
    zoom = 5
}: CulturalMapProps) {
  
  // Custom marker icon creation with theme colors
  const createCustomIcon = (category: any) => {
    return L.divIcon({
      className: 'custom-leaflet-marker',
      html: `<div style="
        background-color: #154212; 
        width: 24px; 
        height: 24px; 
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 4px 6px rgba(0,0,0,0.3);
      "></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  };

  const getLocalizedText = (value: any): string => {
    if (!value) return "Unknown";
    if (typeof value === "string") return value;
    if (typeof value === "object") {
        return value.en || value.native || value.hi || JSON.stringify(value);
    }
    return String(value);
  };

  return (
    <MapContainer 
      center={center} 
      zoom={zoom} 
      style={{ height: '100%', width: '100%', borderRadius: '0.75rem', zIndex: 10 }}
      zoomControl={false}
    >
      <ThemeMapLayer />
      
      <MarkerClusterGroup
        chunkedLoading
        maxClusterRadius={50}
      >
        {markers.map((marker) => (
          <Marker
            key={marker._id}
            position={[marker.latitude, marker.longitude]}
            icon={createCustomIcon(marker.category)}
            eventHandlers={{
              click: () => onMarkerClick(getLocalizedText(marker.region_name), marker._id),
            }}
          >
            <Popup className="custom-popup">
              <div className="p-1">
                <h3 className="font-bold text-sm mb-1 text-gray-800">{getLocalizedText(marker.title)}</h3>
                <span className="inline-block bg-gray-100 text-xs px-2 py-1 rounded-full text-gray-600 mb-2">
                  {getLocalizedText(marker.category)}
                </span>
                <p className="text-xs text-gray-500 mb-1">Region: {getLocalizedText(marker.region_name)}</p>
                <div className="mt-2 text-xs text-[#154212] font-semibold cursor-pointer hover:underline">
                  Click to view region details in sidebar
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
}
