"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Search, MapPin, Loader2, BookOpen, Clock, ChevronRight } from "lucide-react";
import { MapMarkerData } from "./CulturalMap";
import Link from "next/link";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

// Dynamically import map without SSR to avoid 'window is not defined'
const CulturalMap = dynamic(() => import("./CulturalMap"), { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-[#1b1c19] rounded-xl">
        <Loader2 className="w-8 h-8 animate-spin text-[#154212] dark:text-[#d0e8c2]" />
      </div>
    )
});

interface RegionDetail {
  _id: string;
  title: string;
  category: string;
  summary?: string;
  created_at: string;
}

export default function MapExplorer() {
  const [markers, setMarkers] = useState<MapMarkerData[]>([]);
  const [filteredMarkers, setFilteredMarkers] = useState<MapMarkerData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchRegion, setSearchRegion] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Sidebar State
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const [regionDetails, setRegionDetails] = useState<RegionDetail[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Initial fetch
  useEffect(() => {
    const fetchMarkers = async () => {
      try {
        const response = await axios.get("http://localhost:8000/archive/map/map-markers");
        setMarkers(response.data);
        setFilteredMarkers(response.data);
      } catch (error) {
        console.error("Error fetching map markers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMarkers();
  }, []);

  // Filter effect
  useEffect(() => {
    let result = markers;
    if (searchRegion.trim() !== "") {
      const q = searchRegion.toLowerCase();
      result = result.filter(m => m.region_name?.toLowerCase().includes(q));
    }
    if (selectedCategory !== "All") {
      result = result.filter(m => m.category === selectedCategory);
    }
    setFilteredMarkers(result);
  }, [searchRegion, selectedCategory, markers]);

  // Handle marker click
  const handleMarkerClick = async (regionName: string, markerId: string) => {
    setActiveRegion(regionName);
    setLoadingDetails(true);
    try {
      const response = await axios.get(`http://localhost:8000/archive/map/by-region?region=${encodeURIComponent(regionName)}`);
      setRegionDetails(response.data);
    } catch (error) {
      console.error("Error fetching region details:", error);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Helper to safely render text that might be localization objects (e.g., {en: "English", hi: "Hindi", native: "Native"})
  const getLocalizedText = (value: any): string => {
    if (!value) return "Unknown";
    if (typeof value === "string") return value;
    if (typeof value === "object") {
        return value.en || value.native || value.hi || JSON.stringify(value);
    }
    return String(value);
  };

  const categories = ["All", ...Array.from(new Set(markers.map(m => getLocalizedText(m.category)).filter(Boolean)))];

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-5rem)] bg-[#faf9f4] dark:bg-[#121310] overflow-hidden pt-20">
      
      {/* Sidebar Panel */}
      <div className="w-full md:w-96 flex-shrink-0 bg-white/50 dark:bg-[#1b1c19]/50 backdrop-blur-md border-r border-[#154212]/10 dark:border-[#d0e8c2]/10 flex flex-col h-full z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        
        {/* Header / Search */}
        <div className="p-6 border-b border-[#154212]/10 dark:border-[#d0e8c2]/10 space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-[#154212] dark:text-[#d0e8c2] font-headline tracking-tight">Cultural Map</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Explore preserved heritage by geography</p>
          </div>
          
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#154212] transition-colors" />
            <input
              type="text"
              placeholder="Search by region name..."
              value={searchRegion}
              onChange={(e) => setSearchRegion(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#faf9f4] dark:bg-[#121310] border border-[#154212]/10 dark:border-[#d0e8c2]/10 rounded-xl outline-none focus:ring-2 focus:ring-[#154212]/20 dark:focus:ring-[#d0e8c2]/20 text-sm transition-all shadow-inner"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat, i) => (
              <button
                key={i}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                  selectedCategory === cat
                    ? "bg-[#154212] text-white dark:bg-[#d0e8c2] dark:text-[#154212] shadow-md shadow-[#154212]/20"
                    : "bg-[#154212]/5 text-[#154212] hover:bg-[#154212]/10 dark:bg-[#d0e8c2]/5 dark:text-[#d0e8c2] border border-transparent dark:border-[#d0e8c2]/10"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Details Area */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-[#154212]/20">
          <AnimatePresence mode="wait">
            {!activeRegion ? (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-60"
              >
                <div className="w-16 h-16 rounded-full bg-[#154212]/5 dark:bg-[#d0e8c2]/5 flex items-center justify-center mb-2 shadow-inner">
                  <MapPin className="w-8 h-8 text-[#154212]/40 dark:text-[#d0e8c2]/40" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[200px] leading-relaxed">
                  Click a marker on the map to explore cultural knowledge from that region
                </p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 pb-4 border-b border-[#154212]/10 dark:border-[#d0e8c2]/10">
                  <MapPin className="text-[#154212] dark:text-[#d0e8c2] w-5 h-5" />
                  <h2 className="text-xl font-bold font-headline">{activeRegion}</h2>
                </div>

                {loadingDetails ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-[#154212] dark:text-[#d0e8c2]" />
                  </div>
                ) : regionDetails.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">No records found for this region.</p>
                ) : (
                  <div className="space-y-4">
                    {regionDetails.map((detail) => (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                        key={detail._id} 
                        className="bg-white dark:bg-[#1b1c19] rounded-2xl p-5 border border-[#154212]/10 dark:border-[#d0e8c2]/10 shadow-sm hover:shadow-md transition-all duration-300 group"
                      >
                        <div className="flex justify-between items-start mb-2">
                           <span className="text-xs font-semibold px-2 py-1 bg-[#154212]/5 text-[#154212] dark:bg-[#d0e8c2]/10 dark:text-[#d0e8c2] rounded-md">
                             {getLocalizedText(detail.category)}
                           </span>
                           {detail.created_at && (
                             <span className="text-[10px] text-gray-400 flex items-center gap-1">
                               <Clock className="w-3 h-3" />
                               {new Date(detail.created_at).toLocaleDateString()}
                             </span>
                           )}
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2 font-headline">{getLocalizedText(detail.title)}</h3>
                        {detail.summary && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3 mb-4 leading-relaxed">
                            {getLocalizedText(detail.summary)}
                          </p>
                        )}
                        <Link 
                          href={`/archive/${detail._id}`}
                          className="inline-flex items-center gap-1 text-[#154212] dark:text-[#d0e8c2] text-xs font-semibold hover:gap-2 transition-all mt-1"
                        >
                          <BookOpen className="w-3 h-3" />
                          View Full Archive <ChevronRight className="w-3 h-3" />
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Map View Area */}
      <div className="flex-1 relative bg-gray-50 dark:bg-black/20 p-4 md:p-6 shadow-inner">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center bg-white/50 dark:bg-black/20 rounded-2xl border border-gray-100 dark:border-gray-800">
            <Loader2 className="w-10 h-10 animate-spin text-[#154212] dark:text-[#d0e8c2]" />
          </div>
        ) : (
          <CulturalMap 
            markers={filteredMarkers} 
            onMarkerClick={handleMarkerClick} 
          />
        )}
      </div>

    </div>
  );
}
