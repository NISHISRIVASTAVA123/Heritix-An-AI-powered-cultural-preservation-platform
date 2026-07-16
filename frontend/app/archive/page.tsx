"use client";

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import KnowledgeCard from '@/components/KnowledgeCard';
import { apiUrl } from '@/lib/api';
import Link from 'next/link';
import { MandalaIcon } from '@/components/Icons';

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

    const fetchRecords = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(apiUrl('/archive/all'));
            setRecords(res.data);
        } catch (error) {
            console.error('Error fetching records:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRecords();
    }, [fetchRecords]);

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this record? This action is permanent and cannot be undone.")) {
            return;
        }
        try {
            await axios.delete(apiUrl(`/archive/${id}`));
            fetchRecords();
        } catch (error) {
            console.error("Error deleting record:", error);
            alert("Could not delete record. Please try again.");
        }
    };

    const categories = ['Category', 'Folk Medicine', 'Agriculture', 'Folklore & Stories', 'Cultural Rituals', 'Life Advice & Ethics'];

    // Local Search Filter
    const filteredRecords = records.filter(record => {
        const matchesSearch = (record.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (record.transcript?.toLowerCase() || '').includes(searchQuery.toLowerCase());
        
        const matchesCategory = selectedCategory === 'Category' || record.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="w-full min-h-screen bg-indian-wine bg-indian-pattern text-indian-cream relative overflow-hidden">
            {/* Ambient watermarks */}
            <MandalaIcon className="absolute left-[-150px] top-[15%] w-[500px] h-[500px] text-indian-gold/15 animate-[spin_210s_linear_infinite] pointer-events-none z-0" />
            <MandalaIcon className="absolute right-[-150px] top-[50%] w-[500px] h-[500px] text-indian-gold/15 animate-[spin_150s_linear_infinite] pointer-events-none z-0" />

            <div className="px-6 lg:px-12 py-32 max-w-screen-2xl mx-auto w-full relative z-10">
                {/* Header & Toggle Section */}
                <section className="mb-12 space-y-6">
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                        <div className="max-w-4xl">
                            <h1 className="text-5xl font-extrabold font-serif tracking-tight text-gold-gradient mb-4">Knowledge Archive</h1>
                            <p className="text-indian-bronze text-lg leading-relaxed max-w-2xl">Explore the wisdom of generations past, preserved for the future. An immutable ledger of oral histories and cultural practices.</p>
                        </div>
                        {/* View Toggle */}
                        <div className="bg-indian-dark/30 border border-indian-gold/15 p-1 rounded-full flex items-center self-start w-fit">
                            <button 
                                className="px-6 py-2.5 rounded-full flex items-center gap-2 font-bold text-sm transition-all bg-indian-gold text-indian-dark shadow-md cursor-default"
                            >
                                <span className="material-symbols-outlined text-sm">grid_view</span>
                                Grid View
                            </button>
                            <Link 
                                href="/explore"
                                className="px-6 py-2.5 rounded-full flex items-center gap-2 font-bold text-sm transition-all text-indian-cream hover:bg-white/5"
                            >
                                <span className="material-symbols-outlined text-sm">map</span>
                                Map View
                            </Link>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-4 items-center bg-indian-dark/30 border border-indian-gold/20 p-4 rounded-xl shadow-wine-glow relative z-10 backdrop-blur-md">
                        <div className="relative flex-1 w-full">
                            <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-indian-gold">search</span>
                            <input
                                className="w-full bg-indian-dark/50 border border-indian-gold/20 rounded-full py-4 pl-16 pr-6 focus:ring-2 focus:ring-indian-gold/50 font-body text-indian-cream placeholder:text-indian-bronze/50 outline-none transition-shadow"
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
                                    className="flex items-center justify-between w-full bg-indian-dark/50 border border-indian-gold/20 rounded-full py-4 px-8 font-headline text-sm font-bold text-indian-cream hover:bg-indian-dark/70 transition-colors cursor-pointer"
                                >
                                    <span className="truncate">{selectedCategory === 'Category' ? 'All Categories' : selectedCategory}</span>
                                    <span className="material-symbols-outlined text-indian-gold ml-2">expand_more</span>
                                </button>

                                {isDropdownOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)}></div>
                                        <div className="absolute top-full right-0 mt-2 w-full min-w-[200px] bg-indian-dark/95 backdrop-blur-md border border-indian-gold/20 rounded-2xl shadow-wine-glow transition-all duration-300 z-50 overflow-hidden">
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
                                                                ? 'bg-indian-gold/10 text-indian-gold'
                                                                : 'text-indian-bronze hover:bg-indian-gold/10 hover:text-indian-gold'
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
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-4">
                        <div className="w-16 h-16 border-4 border-indian-gold/30 border-t-indian-gold rounded-full animate-spin"></div>
                        <p className="text-indian-bronze font-bold tracking-widest text-sm uppercase animate-pulse">Loading Archive...</p>
                    </div>
                ) : filteredRecords.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 bg-indian-dark/30 rounded-2xl border-2 border-dashed border-indian-gold/20">
                        <span className="material-symbols-outlined text-6xl text-indian-gold/40 mb-4">search_off</span>
                        <h3 className="text-2xl font-bold font-serif text-indian-cream mb-2">No records found</h3>
                        <p className="text-indian-bronze">Try adjusting your search or category filters.</p>
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
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
