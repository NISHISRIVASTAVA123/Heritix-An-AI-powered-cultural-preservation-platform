"use client";

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';

const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY || "";

const CITIES = [
  {"city": "Mumbai", "state": "Maharashtra", "lat": 19.0760, "lon": 72.8777},
  {"city": "Delhi", "state": "Delhi", "lat": 28.7041, "lon": 77.1025},
  {"city": "Bengaluru", "state": "Karnataka", "lat": 12.9716, "lon": 77.5946},
  {"city": "Hyderabad", "state": "Telangana", "lat": 17.3850, "lon": 78.4867},
  {"city": "Ahmedabad", "state": "Gujarat", "lat": 23.0225, "lon": 72.5714},
  {"city": "Chennai", "state": "Tamil Nadu", "lat": 13.0827, "lon": 80.2707},
  {"city": "Kolkata", "state": "West Bengal", "lat": 22.5726, "lon": 88.3639},
  {"city": "Surat", "state": "Gujarat", "lat": 21.1702, "lon": 72.8311},
  {"city": "Pune", "state": "Maharashtra", "lat": 18.5204, "lon": 73.8567},
  {"city": "Jaipur", "state": "Rajasthan", "lat": 26.9124, "lon": 75.7873},
  {"city": "Lucknow", "state": "Uttar Pradesh", "lat": 26.8467, "lon": 80.9462},
  {"city": "Kanpur", "state": "Uttar Pradesh", "lat": 26.4499, "lon": 80.3319},
  {"city": "Nagpur", "state": "Maharashtra", "lat": 21.1458, "lon": 79.0882},
  {"city": "Indore", "state": "Madhya Pradesh", "lat": 22.7196, "lon": 75.8577},
  {"city": "Thane", "state": "Maharashtra", "lat": 19.2183, "lon": 72.9781},
  {"city": "Bhopal", "state": "Madhya Pradesh", "lat": 23.2599, "lon": 77.4126},
  {"city": "Visakhapatnam", "state": "Andhra Pradesh", "lat": 17.6868, "lon": 83.2185},
  {"city": "Pimpri-Chinchwad", "state": "Maharashtra", "lat": 18.6298, "lon": 73.7997},
  {"city": "Patna", "state": "Bihar", "lat": 25.5941, "lon": 85.1376},
  {"city": "Vadodara", "state": "Gujarat", "lat": 22.3072, "lon": 73.1812},
  {"city": "Ghaziabad", "state": "Uttar Pradesh", "lat": 28.6692, "lon": 77.4538},
  {"city": "Ludhiana", "state": "Punjab", "lat": 30.9010, "lon": 75.8573},
  {"city": "Agra", "state": "Uttar Pradesh", "lat": 27.1767, "lon": 78.0081},
  {"city": "Nashik", "state": "Maharashtra", "lat": 20.0059, "lon": 73.7900},
  {"city": "Faridabad", "state": "Haryana", "lat": 28.4089, "lon": 77.3178},
  {"city": "Meerut", "state": "Uttar Pradesh", "lat": 28.9845, "lon": 77.7064},
  {"city": "Rajkot", "state": "Gujarat", "lat": 22.3039, "lon": 70.8022},
  {"city": "Kalyan-Dombivli", "state": "Maharashtra", "lat": 19.2403, "lon": 73.1305},
  {"city": "Vasai-Virar", "state": "Maharashtra", "lat": 19.3919, "lon": 72.8397},
  {"city": "Varanasi", "state": "Uttar Pradesh", "lat": 25.3176, "lon": 82.9739},
  {"city": "Srinagar", "state": "Jammu and Kashmir", "lat": 34.0837, "lon": 74.7973},
  {"city": "Aurangabad", "state": "Maharashtra", "lat": 19.8762, "lon": 75.3433},
  {"city": "Dhanbad", "state": "Jharkhand", "lat": 23.7957, "lon": 86.4304},
  {"city": "Amritsar", "state": "Punjab", "lat": 31.6340, "lon": 74.8723},
  {"city": "Navi Mumbai", "state": "Maharashtra", "lat": 19.0330, "lon": 73.0297},
  {"city": "Allahabad", "state": "Uttar Pradesh", "lat": 25.4358, "lon": 81.8463},
  {"city": "Ranchi", "state": "Jharkhand", "lat": 23.3441, "lon": 85.3096},
  {"city": "Howrah", "state": "West Bengal", "lat": 22.5958, "lon": 88.3110},
  {"city": "Coimbatore", "state": "Tamil Nadu", "lat": 11.0168, "lon": 76.9558},
  {"city": "Jabalpur", "state": "Madhya Pradesh", "lat": 23.1815, "lon": 79.9864},
  {"city": "Gwalior", "state": "Madhya Pradesh", "lat": 26.2183, "lon": 78.1828},
  {"city": "Vijayawada", "state": "Andhra Pradesh", "lat": 16.5062, "lon": 80.6480},
  {"city": "Jodhpur", "state": "Rajasthan", "lat": 26.2389, "lon": 73.0243},
  {"city": "Madurai", "state": "Tamil Nadu", "lat": 9.9252, "lon": 78.1198},
  {"city": "Raipur", "state": "Chhattisgarh", "lat": 21.2514, "lon": 81.6296},
  {"city": "Kota", "state": "Rajasthan", "lat": 25.1825, "lon": 75.8391},
  {"city": "Guwahati", "state": "Assam", "lat": 26.1445, "lon": 91.7362},
  {"city": "Chandigarh", "state": "Chandigarh", "lat": 30.7333, "lon": 76.7794},
  {"city": "Solapur", "state": "Maharashtra", "lat": 17.6599, "lon": 75.9064},
  {"city": "Hubballi-Dharwad", "state": "Karnataka", "lat": 15.3647, "lon": 75.1240}
];

interface HistoryItem {
  region: string;
  state: string;
  lat: number;
  lon: number;
}

interface GroqData {
  region: string;
  state: string;
  overview: string;
  history: string;
  festivals: string[];
  cuisine: string[];
  artForms: string[];
  languages: string[];
  architecture: string;
  mustVisit: string[];
  funFact: string;
}

export default function GroqCulturalMap() {
    const [paths, setPaths] = useState<{ d: string; name: string }[]>([]);
    const [mapConfig, setMapConfig] = useState({ scale: 1, offsetX: 0, offsetY: 0, cosFactor: 1, minLon: 0, minLat: 0, height: 800 });
    const [toast, setToast] = useState<{ show: boolean, msg: string }>({ show: false, msg: "" });
    const [history, setHistory] = useState<HistoryItem[]>([]);
    
    // UI States
    const [hoverInfo, setHoverInfo] = useState<{ name: string; x: number; y: number } | null>(null);
    const [liveCoords, setLiveCoords] = useState<{ lat: number; lon: number } | null>(null);
    const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lon: number } | null>(null);
    const [pin, setPin] = useState<{ x: number, y: number } | null>(null);
    const [exploreState, setExploreState] = useState<'empty' | 'loading' | 'error' | 'data'>('empty');
    const [data, setData] = useState<GroqData | null>(null);
    const [selectedRegion, setSelectedRegion] = useState({ region: '', state: '' });
    
    // Community Records Status
    const [communityRecords, setCommunityRecords] = useState<any[]>([]);
    const [communityRecordsStatus, setCommunityRecordsStatus] = useState<'empty' | 'loading' | 'data' | 'error'>('empty');
    const [activeCityFilter, setActiveCityFilter] = useState<string | undefined>(undefined);
    
    // Search
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState(CITIES.slice(0, 0));
    
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        async function fetchMap() {
            try {
                const res = await fetch('https://code.highcharts.com/mapdata/countries/in/in-all.geo.json');
                const geojson = await res.json();
                
                let minLon = Infinity, maxLon = -Infinity;
                let minLat = Infinity, maxLat = -Infinity;

                const updateBounds = (coords: any[]) => {
                    const [lon, lat] = coords;
                    if (lon < minLon) minLon = lon;
                    if (lon > maxLon) maxLon = lon;
                    if (lat < minLat) minLat = lat;
                    if (lat > maxLat) maxLat = lat;
                };

                geojson.features.forEach((f: any) => {
                    if (!f.geometry) return;
                    if (f.geometry.type === 'Polygon') {
                        f.geometry.coordinates[0].forEach(updateBounds);
                    } else if (f.geometry.type === 'MultiPolygon') {
                        f.geometry.coordinates.forEach((p: any) => p[0].forEach(updateBounds));
                    }
                });

                const width = 800, height = 800;
                const lonRange = maxLon - minLon;
                const latRange = maxLat - minLat;
                const centerLat = (minLat + maxLat) / 2;
                const cosFactor = Math.cos(centerLat * Math.PI / 180);
                
                const adjLatRange = latRange / cosFactor;
                const scale = Math.min(width / lonRange, height / adjLatRange) * 0.95;
                const offsetX = (width - lonRange * scale) / 2;
                const offsetY = (height - adjLatRange * scale) / 2;
                
                setMapConfig({ scale, offsetX, offsetY, cosFactor, minLon, minLat, height });

                const project = (lon: number, lat: number) => ({
                    x: (lon - minLon) * scale + offsetX,
                    y: height - ((lat - minLat) / cosFactor * scale + offsetY)
                });

                const createPathData = (polygon: any[]) => {
                    let d = "";
                    polygon.forEach(ring => {
                        ring.forEach((coord: any, i: number) => {
                            const {x, y} = project(coord[0], coord[1]);
                            d += (i === 0 ? `M${x},${y} ` : `L${x},${y} `);
                        });
                        d += "Z ";
                    });
                    return d;
                };

                const loadedPaths: { d: string, name: string }[] = [];
                geojson.features.forEach((f: any) => {
                    if (!f.geometry) return;
                    let d = "";
                    if (f.geometry.type === 'Polygon') {
                        d = createPathData(f.geometry.coordinates);
                    } else if (f.geometry.type === 'MultiPolygon') {
                        f.geometry.coordinates.forEach((poly: any) => { d += createPathData(poly); });
                    }
                    if (d) {
                        loadedPaths.push({
                            d: d.trim(),
                            name: f.properties.name || f.properties.NAME_1
                        });
                    }
                });
                setPaths(loadedPaths);
            } catch (e) {
                console.error("Map load error", e);
                showToast("Error loading map layout");
            }
        }
        fetchMap();
    }, []);

    const showToast = (msg: string) => {
        setToast({ show: true, msg });
        setTimeout(() => setToast({ show: false, msg: "" }), 3000);
    };

    const getSVGCoords = (clientX: number, clientY: number) => {
        if (!svgRef.current) return { x: 0, y: 0 };
        const pt = svgRef.current.createSVGPoint();
        pt.x = clientX;
        pt.y = clientY;
        const svgP = pt.matrixTransform(svgRef.current.getScreenCTM()!.inverse());
        return { x: svgP.x, y: svgP.y };
    };

    const inverseProject = (x: number, y: number) => {
        const { scale, offsetX, offsetY, cosFactor, minLon, minLat, height } = mapConfig;
        const lon = (x - offsetX) / scale + minLon;
        const lat = (height - y - offsetY) / scale * cosFactor + minLat;
        return { lon, lat };
    };

    const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
        const { x, y } = getSVGCoords(e.clientX, e.clientY);
        const { lon, lat } = inverseProject(x, y);
        setLiveCoords({ lat, lon });

        const target = e.target as SVGElement;
        if (target.tagName !== 'path') {
            setHoverInfo(null);
            return;
        }

        const name = target.getAttribute('data-name');
        if (name && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setHoverInfo({
                name,
                x: e.clientX - rect.left,
                y: e.clientY - rect.top - 35
            });
        }
    };

    const handleMouseLeave = () => {
        setHoverInfo(null);
        setLiveCoords(null);
    };

    const dropPinAt = (lon: number, lat: number) => {
        const { scale, offsetX, offsetY, cosFactor, minLon, minLat, height } = mapConfig;
        const pX = (lon - minLon) * scale + offsetX;
        const pY = height - ((lat - minLat) / cosFactor * scale + offsetY);
        setPin({ x: pX, y: pY });
    };

    const fetchGroqData = async (region: string, state: string, lat: number, lon: number) => {
        setExploreState('loading');
        setSelectedRegion({ region: region === 'Clicked location' ? state : `${region}, ${state}`, state });
        
        const prompt = `Identify the cultural data for the location ${region === 'Clicked location' ? '' : region + ','} ${state} located around coordinates ${lat}, ${lon}.
Return ONLY a valid JSON object. No markdown fences like \`\`\`json, no preamble, no explanations. Use this exact structure:
{
  "region": "${region}",
  "state": "${state}",
  "overview": "Short description of cultural significance",
  "history": "Short history",
  "festivals": ["Festival 1"],
  "cuisine": ["Dish 1"],
  "artForms": ["Art 1"],
  "languages": ["Lang 1"],
  "architecture": "Styles and examples",
  "mustVisit": ["Place 1"],
  "funFact": "Interesting fact"
}`;

        try {
            if (!GROQ_API_KEY) {
               throw new Error('Missing NEXT_PUBLIC_GROQ_API_KEY. Please add it to your .env');
            }

            const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${GROQ_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: [{ role: "user", content: prompt }],
                    max_tokens: 1000
                })
            });
            
            if (!res.ok) throw new Error(`Status ${res.status}`);
            
            const rawData = await res.json();
            const content = rawData.choices[0].message.content.replace(/```json|```/gi, "").trim();
            const jsonContent = JSON.parse(content);
            setData(jsonContent);
            setExploreState('data');
        } catch (e) {
            console.error("Groq fetch error:", e);
            setExploreState('error');
        }
    };

    const fetchCommunityRecords = async (state: string, city?: string) => {
        setCommunityRecordsStatus('loading');
        setActiveCityFilter(city);
        try {
            let url = `http://127.0.0.1:8000/archive/search?state=${encodeURIComponent(state)}`;
            if (city) {
                url += `&city=${encodeURIComponent(city)}`;
            }
            const res = await fetch(url);
            if (!res.ok) {
                // Treat non-ok as empty rather than hard error
                setCommunityRecords([]);
                setCommunityRecordsStatus('data');
                return;
            }
            const records = await res.json();
            setCommunityRecords(records);
            setCommunityRecordsStatus('data');
        } catch (e) {
            console.error("Community records fetch error:", e);
            // On network error, show empty state instead of red error
            setCommunityRecords([]);
            setCommunityRecordsStatus('data');
        }
    };

    const handleLocationSelect = useCallback((region: string, state: string, lat: number, lon: number) => {
        dropPinAt(lon, lat);
        setSelectedCoords({ lat, lon });
        fetchGroqData(region, state, lat, lon);
        
        const city = region !== "Clicked location" ? region : undefined;
        fetchCommunityRecords(state, city);

        setHistory(prev => {
            if (prev.length > 0 && prev[0].lat === lat && prev[0].lon === lon) return prev;
            const newHistory = [{ region, state, lat, lon }, ...prev].slice(0, 5);
            return newHistory;
        });
    }, [mapConfig]); // Safe to use useCallback this way

    const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
        const target = e.target as SVGElement;
        if (target.tagName !== 'path') {
            showToast("Please click inside India's boundary");
            return;
        }
        const stateName = target.getAttribute('data-name') || '';
        const { x, y } = getSVGCoords(e.clientX, e.clientY);
        const { lon, lat } = inverseProject(x, y);
        handleLocationSelect("Clicked location", stateName, lat, lon);
    };

    const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.toLowerCase();
        setSearchQuery(e.target.value);
        if (!val) {
            setSearchResults([]);
            return;
        }
        const filtered = CITIES.filter(c => c.city.toLowerCase().includes(val) || c.state.toLowerCase().includes(val));
        setSearchResults(filtered.slice(0, 10));
    };

    const selectSearchItem = (city: string, state: string, lat: number, lon: number) => {
        setSearchQuery('');
        setSearchResults([]);
        handleLocationSelect(city, state, lat, lon);
    };

    return (
        <div className="flex w-full h-[calc(100vh-6rem)] relative overflow-hidden">
            {/* Main Content Area */}
            <div className="w-[65%] relative flex flex-col p-6 box-border bg-transparent" ref={containerRef}>
                <div className="relative mb-6 z-50">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant pointer-events-none">search</span>
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={handleSearchInput}
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-outline-variant/30 bg-surface text-on-surface shadow-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                        placeholder="Search for a city or state..." 
                    />
                    {searchResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-outline-variant/30 rounded-xl max-h-60 overflow-y-auto shadow-lg z-50">
                            {searchResults.map((c, i) => (
                                <div key={i} className="p-3 border-b border-outline-variant/20 hover:bg-surface-variant cursor-pointer" onClick={() => selectSearchItem(c.city, c.state, c.lat, c.lon)}>
                                    <div className="font-semibold text-on-surface">{c.city}</div>
                                    <div className="text-sm text-on-surface-variant">{c.state}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex-1 relative bg-surface border border-outline-variant/30 rounded-2xl overflow-hidden flex items-center justify-center shadow-sm">
                    <svg ref={svgRef} id="india-map" viewBox="0 0 800 800" preserveAspectRatio="xMidYMid meet" className="w-full h-full cursor-crosshair" onClick={handleSvgClick} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
                        <g id="states-layer">
                            {paths.map((p, i) => (
                                <path 
                                    key={i} 
                                    d={p.d} 
                                    data-name={p.name} 
                                    className="fill-surface-variant stroke-outline-variant hover:fill-primary-container hover:stroke-primary transition-all duration-200 stroke-[1] hover:stroke-2"
                                />
                            ))}
                        </g>
                        <g id="pin-layer">
                            {pin && (
                                <g transform={`translate(${pin.x}, ${pin.y})`}>
                                    <animateTransform attributeName="transform" type="translate" from={`${pin.x}, ${pin.y - 50}`} to={`${pin.x}, ${pin.y}`} dur="0.3s" calcMode="spline" keySplines="0.25 0.46 0.45 0.94" fill="freeze" />
                                    <path d="M 0 0 L -12 -20 A 15 15 0 1 1 12 -20 Z" className="fill-error" />
                                    <circle cx="0" cy="-24" r="5" fill="#ffffff" />
                                    <animate attributeName="opacity" from="0" to="1" dur="0.3s" />
                                </g>
                            )}
                        </g>
                    </svg>

                    {hoverInfo && (
                        <div className="absolute bg-surface text-on-surface px-3 py-1.5 border border-outline-variant/30 rounded-lg shadow-md text-sm font-semibold pointer-events-none z-40 whitespace-nowrap transform -translate-x-1/2" style={{ left: hoverInfo.x, top: hoverInfo.y }}>
                            {hoverInfo.name}
                        </div>
                    )}
                    
                    {liveCoords && (
                        <div className="absolute bottom-6 left-6 bg-surface text-on-surface-variant px-3 py-2 border border-outline-variant/30 rounded-lg shadow-sm font-mono text-sm z-40">
                            {liveCoords.lat.toFixed(4)}°N / {liveCoords.lon.toFixed(4)}°E
                        </div>
                    )}
                </div>
            </div>

            {/* Sidebar */}
            <div className="w-[35%] bg-surface border-l border-outline-variant/30 flex flex-col h-full z-10 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)]">
                <div className="p-6 border-b border-outline-variant/20">
                    <h2 className="text-2xl font-bold text-on-surface font-headline mb-2">{selectedRegion.region ? selectedRegion.region : "Explore Locations"}</h2>
                    <div className="inline-block font-mono text-xs bg-surface-variant text-on-surface-variant px-2.5 py-1 rounded-md border border-outline-variant/30">
                        {selectedCoords ? `${selectedCoords.lat.toFixed(4)}°N / ${selectedCoords.lon.toFixed(4)}°E` : "Click the map to select"}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
                    {exploreState === 'empty' && (
                        <div className="flex flex-col items-center justify-center h-full text-on-surface-variant text-center opacity-80">
                            <span className="material-symbols-outlined text-5xl mb-4 text-outline">language</span>
                            <h2 className="text-lg font-semibold text-on-surface mb-2">Discover India</h2>
                            <p className="text-sm max-w-[250px]">Click anywhere on the map or search for a city to uncover its cultural heritage.</p>
                        </div>
                    )}

                    {exploreState === 'loading' && (
                        <>
                            <div className="border border-outline-variant/20 rounded-xl p-4 bg-surface-container-lowest shadow-sm">
                                <div className="h-6 bg-surface-variant rounded-md w-1/3 mb-4 animate-pulse"></div>
                                <div className="h-4 bg-surface-variant rounded-md w-full mb-2 animate-pulse"></div>
                                <div className="h-4 bg-surface-variant rounded-md w-full mb-2 animate-pulse"></div>
                                <div className="h-4 bg-surface-variant rounded-md w-2/3 animate-pulse"></div>
                            </div>
                            <div className="border border-outline-variant/20 rounded-xl p-4 bg-surface-container-lowest shadow-sm">
                                <div className="h-6 bg-surface-variant rounded-md w-1/2 mb-4 animate-pulse"></div>
                                <div className="h-4 bg-surface-variant rounded-md w-full mb-2 animate-pulse"></div>
                                <div className="h-4 bg-surface-variant rounded-md w-4/5 animate-pulse"></div>
                            </div>
                            <div className="border border-outline-variant/20 rounded-xl p-4 bg-surface-container-lowest shadow-sm">
                                <div className="h-6 bg-surface-variant rounded-md w-2/5 mb-4 animate-pulse"></div>
                                <div className="flex gap-2">
                                    <div className="h-7 w-20 bg-surface-variant rounded-full animate-pulse"></div>
                                    <div className="h-7 w-24 bg-surface-variant rounded-full animate-pulse"></div>
                                </div>
                            </div>
                        </>
                    )}

                    {exploreState === 'error' && (
                        <div className="flex flex-col items-center justify-center p-6 bg-error-container text-on-error-container rounded-xl border border-error/20">
                            <span className="material-symbols-outlined text-4xl mb-2 text-error">error</span>
                            <h2 className="text-lg font-bold mb-1">Retrieval Failed</h2>
                            <p className="text-sm text-center mb-4">There was an error generating data via Groq AI. Check your API key or network connection.</p>
                            {selectedCoords && (
                                <button onClick={() => fetchGroqData(selectedRegion.region, selectedRegion.state, selectedCoords.lat, selectedCoords.lon)} className="bg-error text-on-error px-4 py-2 rounded-lg font-bold text-sm hover:brightness-110 active:scale-95 transition-all">Retry Fetch</button>
                            )}
                        </div>
                    )}

                    {exploreState === 'data' && data && (
                        <>
                            <div className="border border-outline-variant/20 rounded-xl p-5 bg-surface-container-lowest shadow-sm">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">Region Overview</h3>
                                <p className="text-on-surface text-sm leading-relaxed">{data.overview}</p>
                            </div>
                            
                            <div className="border border-outline-variant/20 rounded-xl p-5 bg-surface-container-lowest shadow-sm">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">History & Heritage</h3>
                                <p className="text-on-surface text-sm leading-relaxed">{data.history}</p>
                            </div>

                            <div className="border border-outline-variant/20 rounded-xl p-5 bg-surface-container-lowest shadow-sm">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-3">Festivals</h3>
                                <div className="flex flex-wrap gap-2">
                                    {data.festivals?.map((item, i) => (
                                        <span key={i} className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200 border border-orange-200 dark:border-orange-800/50">{item}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="border border-outline-variant/20 rounded-xl p-5 bg-surface-container-lowest shadow-sm">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-3">Cuisine</h3>
                                <div className="flex flex-wrap gap-2">
                                    {data.cuisine?.map((item, i) => (
                                        <span key={i} className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800/50">{item}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="border border-outline-variant/20 rounded-xl p-5 bg-surface-container-lowest shadow-sm">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-3">Art Forms</h3>
                                <div className="flex flex-wrap gap-2">
                                    {data.artForms?.map((item, i) => (
                                        <span key={i} className="px-3 py-1 rounded-full text-xs font-semibold bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200 border border-violet-200 dark:border-violet-800/50">{item}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="border border-outline-variant/20 rounded-xl p-5 bg-surface-container-lowest shadow-sm">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-3">Languages</h3>
                                <div className="flex flex-wrap gap-2">
                                    {data.languages?.map((item, i) => (
                                        <span key={i} className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200 border border-blue-200 dark:border-blue-800/50">{item}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="border border-outline-variant/20 rounded-xl p-5 bg-surface-container-lowest shadow-sm">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">Architecture</h3>
                                <p className="text-on-surface text-sm leading-relaxed">{data.architecture}</p>
                            </div>

                            <div className="border border-outline-variant/20 rounded-xl p-5 bg-surface-container-lowest shadow-sm">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-3">Must Visit</h3>
                                <div className="flex flex-wrap gap-2">
                                    {data.mustVisit?.map((item, i) => (
                                        <span key={i} className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200 border border-rose-200 dark:border-rose-800/50">{item}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="border border-outline-variant/20 rounded-xl p-5 bg-surface-container-lowest shadow-sm">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2 flex items-center gap-2">Fun Fact <span className="text-lg">💡</span></h3>
                                <p className="text-on-surface text-sm leading-relaxed">{data.funFact}</p>
                            </div>
                        </>
                    )}

                    {/* Community Records Section */}
                    {exploreState === 'data' && (
                        <div className="mt-4 border-t border-outline-variant/30 pt-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-on-surface font-headline flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">record_voice_over</span>
                                    Community Oral Histories
                                </h2>
                                {activeCityFilter && (
                                    <span className="text-[10px] uppercase font-bold text-primary bg-primary-container px-2 py-1 rounded-full whitespace-nowrap">
                                        City: {activeCityFilter}
                                    </span>
                                )}
                            </div>
                            
                            {communityRecordsStatus === 'loading' && (
                                <div className="text-sm text-on-surface-variant flex items-center gap-2">
                                    <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
                                    Loading community contributions...
                                </div>
                            )}

                            {communityRecordsStatus === 'error' && (
                                <div className="border border-outline-variant/20 border-dashed rounded-xl p-6 text-center bg-surface-container-lowest">
                                    <span className="material-symbols-outlined text-outline-variant text-4xl mb-2">search_off</span>
                                    <h3 className="font-semibold text-on-surface text-sm mb-1">Data Not Found</h3>
                                    <p className="text-xs text-on-surface-variant">No community records available for this region.</p>
                                </div>
                            )}

                            {communityRecordsStatus === 'data' && communityRecords.length === 0 && (
                                <div className="border border-outline-variant/20 border-dashed rounded-xl p-6 text-center bg-surface-container-lowest">
                                    <span className="material-symbols-outlined text-outline-variant text-4xl mb-2">mic_off</span>
                                    <h3 className="font-semibold text-on-surface text-sm mb-1">No community histories yet</h3>
                                    <p className="text-xs text-on-surface-variant">Be the first to add an oral history to this state!</p>
                                </div>
                            )}

                            {communityRecordsStatus === 'data' && communityRecords.length > 0 && (
                                <div className="flex flex-col gap-3">
                                    {communityRecords.map((rec, idx) => (
                                        <Link href={`/archive/${rec._id}`} key={idx}>
                                            <div className="group border border-outline-variant/30 rounded-xl p-4 bg-surface hover:bg-surface-container-low transition-all cursor-pointer shadow-sm hover:shadow-md hover:border-primary/40 relative overflow-hidden">
                                                <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors"></div>
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="font-bold text-on-surface text-sm group-hover:text-primary transition-colors pr-4">{rec.title || "Untitled Record"}</h4>
                                                    <span className="text-[10px] uppercase font-bold text-primary bg-primary-container px-2 py-0.5 rounded-sm whitespace-nowrap">{rec.category || "General"}</span>
                                                </div>
                                                <div className="flex items-center gap-4 text-xs text-on-surface-variant">
                                                    <span className="flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-[14px]">person</span>
                                                        {rec.contributor || "Anonymous"}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                                        {rec.created_at ? new Date(rec.created_at).toLocaleDateString() : ""}
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-outline-variant/20 bg-surface">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-3">Recently Explored</h3>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {history.length > 0 ? history.map((item, idx) => (
                            <button 
                                key={idx}
                                onClick={() => handleLocationSelect(item.region, item.state, item.lat, item.lon)}
                                className="whitespace-nowrap px-4 py-1.5 rounded-full border border-outline-variant/30 text-xs font-semibold text-on-surface hover:bg-primary-container hover:text-on-primary-container hover:border-primary/50 transition-all"
                            >
                                {item.region === 'Clicked location' ? `${item.lat.toFixed(2)}, ${item.lon.toFixed(2)}` : item.region}
                            </button>
                        )) : (
                            <span className="text-xs text-on-surface-variant italic">No locations explored yet</span>
                        )}
                    </div>
                </div>
            </div>

            {toast.show && (
                <div className="fixed bottom-10 left-[32.5%] -translate-x-1/2 bg-on-surface text-surface px-6 py-3 rounded-xl shadow-lg z-[100] text-sm font-semibold border border-outline/20">
                    {toast.msg}
                </div>
            )}
        </div>
    );
}
