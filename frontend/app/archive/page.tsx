"use client";

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic';
import KnowledgeCard from '@/components/KnowledgeCard';
import { apiUrl } from '@/lib/api';

// Dynamic import for Leaflet map to strictly enforce client-side execution
const MapWrapper = dynamic(() => import('@/components/CulturalMap'), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-surface-container-highest/20 animate-pulse rounded-2xl flex items-center justify-center min-h-[500px]">
        <span className="material-symbols-outlined text-4xl text-primary animate-spin">autorenew</span>
    </div>
});

interface Record {
    _id: string;
    title: string;
    category: string;
    contributor: string;
    transcript: string;
    audio_url?: string;
    summary?: string | { en?: string, hi?: string, native?: string };
    created_at: string;
    latitude?: number;
    longitude?: number;
}

export default function ArchivePage() {
    const [records, setRecords] = useState<Record[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Category');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Feature integration: View Mode & Map State
    const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
    const [center, setCenter] = useState({ lat: 20.5937, lng: 78.9629 });

    const fetchRecords = useCallback(async (currentLat?: number, currentLng?: number) => {
        setLoading(true);
        try {
            if (viewMode === 'map' && currentLat !== undefined && currentLng !== undefined) {
                 const res = await axios.get(apiUrl('/archive/nearby'), {
                    params: {
                        lat: currentLat,
                        lng: currentLng,
                        radius: 500000, // Search within 500km radius when panning
                        category: selectedCategory === 'Category' ? '' : selectedCategory
                    }
                });
                setRecords(res.data);
            } else {
                const res = await axios.get(apiUrl('/archive/all'));
                setRecords(res.data);
            }
        } catch (error) {
            console.error('Error fetching records:', error);
        } finally {
            setLoading(false);
        }
    }, [viewMode, selectedCategory]);

    useEffect(() => {
        if (viewMode === 'grid') {
            fetchRecords();
        } else {
            fetchRecords(center.lat, center.lng);
        }
    }, [fetchRecords, viewMode, center]);

    const handleMapChange = (lat: number, lng: number) => {
        setCenter({ lat, lng });
    };

    const categories = ['Category', 'Folk Medicine', 'Agriculture', 'Folklore & Stories', 'Cultural Rituals', 'Life Advice & Ethics'];

    // Local Search Filter
    const filteredRecords = records.filter(record => {
        const matchesSearch = (record.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (record.transcript?.toLowerCase() || '').includes(searchQuery.toLowerCase());
        
        // Backend handles category in Map mode, but we enforce it locally for Grid mode just in case
        const matchesCategory = selectedCategory === 'Category' || record.category === selectedCategory || viewMode === 'map';
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="flex-1 px-6 lg:px-12 py-32 max-w-screen-2xl mx-auto w-full">
            {/* Header & Toggle Section */}
            <section className="mb-12 space-y-6">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                    <div className="max-w-4xl">
                        <h1 className="text-5xl font-extrabold font-headline tracking-tight text-primary mb-4">Knowledge Archive</h1>
                        <p className="text-on-surface-variant text-lg leading-relaxed max-w-2xl">Explore the wisdom of generations past, preserved for the future. An immutable ledger of oral histories and cultural practices.</p>
                    </div>
                    
                    {/* View Toggle */}
                    <div className="bg-surface-container-high p-1 rounded-full flex items-center self-start w-fit">
                        <button 
                            onClick={() => setViewMode('grid')}
                            className={`px-6 py-2.5 rounded-full flex items-center gap-2 font-bold text-sm transition-all ${viewMode === 'grid' ? 'bg-primary text-on-primary shadow-md' : 'text-on-surface hover:bg-surface-variant'}`}
                        >
                            <span className="material-symbols-outlined text-sm">grid_view</span>
                            Grid
                        </button>
                        <button 
                            onClick={() => setViewMode('map')}
                            className={`px-6 py-2.5 rounded-full flex items-center gap-2 font-bold text-sm transition-all ${viewMode === 'map' ? 'bg-primary text-on-primary shadow-md' : 'text-on-surface hover:bg-surface-variant'}`}
                        >
                            <span className="material-symbols-outlined text-sm">map</span>
                            Map
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 items-center bg-surface-container-low p-4 rounded-xl shadow-sm border border-surface-container-high relative z-10">
                    <div className="relative flex-1 w-full">
                        <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-outline">search</span>
                        <input
                            className="w-full bg-surface-container-highest border-none rounded-full py-4 pl-16 pr-6 focus:ring-2 focus:ring-primary-container font-body text-on-surface placeholder:text-outline-variant outline-none transition-shadow"
                            placeholder="Search the Archive"
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-4 w-full md:w-auto relative">
                        <div className="relative w-full md:w-64">
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center justify-between w-full bg-surface-container-highest border-none rounded-full py-4 px-8 font-headline text-sm font-bold text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
                            >
                                <span className="truncate">{selectedCategory === 'Category' ? 'All Categories' : selectedCategory}</span>
                                <span className="material-symbols-outlined text-primary ml-2">expand_more</span>
                            </button>

                            {isDropdownOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)}></div>
                                    <div className="absolute top-full right-0 mt-2 w-full min-w-[200px] bg-surface-container rounded-2xl shadow-xl border border-outline-variant/20 transition-all duration-300 z-50 overflow-hidden">
                                        <div className="py-2 max-h-64 overflow-y-auto">
                                            {categories.map(c => (
                                                <button
                                                    key={c}
                                                    onClick={() => {
                                                        setSelectedCategory(c);
                                                        setIsDropdownOpen(false);
                                                    }}
                                                    className={`w-full text-left block px-6 py-3 text-sm font-headline font-semibold transition-colors
                                                        ${selectedCategory === c
                                                            ? 'bg-primary/10 text-primary'
                                                            : 'text-on-surface-variant hover:bg-primary/10 hover:text-primary'
                                                        }
                                                    `}
                                                >
                                                    {c === 'Category' ? 'All Categories' : c}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Content Area */}
            {loading && viewMode === 'grid' ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-4">
                    <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    <p className="text-on-surface-variant font-bold tracking-widest text-sm uppercase animate-pulse">Loading Archive...</p>
                </div>
            ) : viewMode === 'map' ? (
                <div className="w-full h-[600px] rounded-2xl relative mb-12 shadow-lg border border-outline-variant/20 overflow-hidden">
                    {loading && (
                        <div className="absolute inset-0 bg-surface/50 z-10 flex flex-col items-center justify-center backdrop-blur-sm">
                            <span className="material-symbols-outlined animate-spin text-4xl text-primary text-opacity-80">autorenew</span>
                        </div>
                    )}
                    <MapWrapper records={filteredRecords} onMapChange={handleMapChange} />
                </div>
            ) : filteredRecords.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 bg-surface-container-low rounded-2xl border-2 border-dashed border-outline-variant/30">
                    <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">search_off</span>
                    <h3 className="text-2xl font-bold font-headline text-on-surface mb-2">No records found</h3>
                    <p className="text-on-surface-variant">Try adjusting your search or category filters.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {filteredRecords.map(record => (
                        <KnowledgeCard
                            key={record._id}
                            id={record._id}
                            title={record.title}
                            category={record.category || 'Uncategorized'}
                            contributor={record.contributor}
                            date={record.created_at}
                            audioUrl={record.audio_url}
                            summary={record.summary || record.transcript}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
