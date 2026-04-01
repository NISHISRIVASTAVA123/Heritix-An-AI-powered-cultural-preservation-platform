"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import KnowledgeCard from '@/components/KnowledgeCard';

interface Record {
    _id: string;
    title: string;
    category: string;
    contributor: string;
    transcript: string;
    audio_url?: string;
    summary?: string | { en?: string, hi?: string, native?: string };
    created_at: string;
}

export default function ArchivePage() {
    const [records, setRecords] = useState<Record[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Category');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        fetchRecords();
    }, []);

    const fetchRecords = async () => {
        try {
            const response = await axios.get('http://localhost:8000/archive/all');
            setRecords(response.data);
        } catch (error) {
            console.error('Error fetching records:', error);
        } finally {
            setLoading(false);
        }
    };

    const categories = ['Category', 'Folk Medicine', 'Agriculture', 'Folklore & Stories', 'Cultural Rituals', 'Life Advice & Ethics'];

    const filteredRecords = records.filter(record => {
        const matchesSearch = (record.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (record.transcript?.toLowerCase() || '').includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'Category' || record.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="flex-1 px-6 lg:px-12 py-32 max-w-screen-2xl mx-auto w-full">
            {/* Search & Filters Section */}
            <section className="mb-16 space-y-8">
                <div className="max-w-4xl">
                    <h1 className="text-5xl font-extrabold font-headline tracking-tight text-primary mb-4">Knowledge Archive</h1>
                    <p className="text-on-surface-variant text-lg leading-relaxed max-w-2xl">Explore the wisdom of generations past, preserved for the future. An immutable ledger of oral histories and cultural practices.</p>
                </div>

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

            {/* Archive Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-4">
                    <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    <p className="text-on-surface-variant font-bold tracking-widest text-sm uppercase animate-pulse">Loading Archive...</p>
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
