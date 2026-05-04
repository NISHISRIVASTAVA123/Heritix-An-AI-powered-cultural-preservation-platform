'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet marker icon issue in Next.js
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Default India bounds/center
const DEFAULT_CENTER: [number, number] = [20.5937, 78.9629];
const DEFAULT_ZOOM = 5;

interface CulturalMapProps {
  records: any[];
  onMapChange: (lat: number, lng: number) => void;
}

function MapEvents({ onMapChange }: { onMapChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    moveend: (e) => {
      const center = e.target.getCenter();
      onMapChange(center.lat, center.lng);
    }
  });
  return null;
}

export default function CulturalMap({ records, onMapChange }: CulturalMapProps) {
  useEffect(() => {
    // Force resize recalculation in case it's distorted on first load in flex
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 500);
  }, []);

  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      className="w-full h-full rounded-2xl shadow-lg border border-outline-variant/20 relative z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      <MapEvents onMapChange={onMapChange} />

      {records.map((record) => {
        if (!record.latitude || !record.longitude) return null;
        const displaySummary = typeof record.summary === 'string'
          ? record.summary
          : (record.summary?.en || record.summary?.native || record.transcript?.substring(0, 80) + '...');

        return (
          <Marker
            key={record._id}
            position={[record.latitude, record.longitude]}
            icon={customIcon}
          >
            <Popup className="rounded-xl overflow-hidden border-0 p-0 m-0 shadow-lg">
              <div className="p-4 min-w-[220px] max-w-[280px]">
                <span className="px-2 py-1 bg-surface-variant text-on-surface-variant rounded-md text-[10px] font-bold tracking-wider uppercase inline-block mb-2">
                  {record.category}
                </span>
                <h4 className="font-bold text-on-surface text-lg mb-2 leading-tight">{record.title}</h4>
                <p className="text-on-surface-variant text-sm mb-4 line-clamp-3">
                  {displaySummary}
                </p>
                <a
                  href={`/archive/${record._id}`}
                  className="bg-primary text-on-primary w-full py-2 rounded-lg text-sm font-bold block text-center hover:bg-primary/90 transition-colors shadow-md active:scale-95"
                >
                  View More
                </a>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
