"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';

interface Record {
    _id: string;
    title: string;
    category: string;
    contributor: string;
    transcript: string;
    audio_url?: string;
    education_data?: {
        summary: string;
        lesson: string;
        moral: string;
    };
    created_at: string;
}

export default function ArchivePage() {
    const [records, setRecords] = useState<Record[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

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

    const categories = ['All', 'Folk Medicine', 'Agriculture', 'Folklore & Stories', 'Cultural Rituals', 'Life Advice & Ethics'];

    const filteredRecords = records.filter(record => {
        const matchesSearch = record.title.toLowerCase().includes(filter.toLowerCase()) ||
            record.transcript.toLowerCase().includes(filter.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || record.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="max-w-6xl mx-auto py-10 px-4">
            <h1 className="text-4xl font-serif font-bold text-amber-900 mb-8 text-center">Cultural Archive</h1>

            <div className="flex flex-col md:flex-row gap-4 mb-10 justify-between items-center bg-stone-50 p-6 rounded-xl border border-stone-200">
                <input
                    type="text"
                    placeholder="Search knowledge..."
                    className="w-full md:w-96 px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                />

                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === cat
                                    ? 'bg-amber-800 text-white shadow-md'
                                    : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-900"></div>
                </div>
            ) : filteredRecords.length === 0 ? (
                <div className="text-center py-20 bg-stone-50 rounded-xl border border-dashed border-stone-300">
                    <p className="text-stone-500 text-lg">No records found matching your criteria.</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredRecords.map(record => (
                        <div key={record._id} className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                            <div className="p-6 flex-grow">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold uppercase rounded-full tracking-wide">
                                        {record.category || 'Uncategorized'}
                                    </span>
                                    <span className="text-xs text-stone-400">
                                        {new Date(record.created_at).toLocaleDateString()}
                                    </span>
                                </div>

                                <h3 className="text-xl font-bold text-stone-800 mb-2 font-serif line-clamp-2">{record.title}</h3>
                                <p className="text-sm text-stone-500 mb-4">by <span className="font-semibold">{record.contributor}</span></p>

                                <p className="text-stone-600 line-clamp-3 mb-4 text-sm leading-relaxed">
                                    {record.education_data?.summary || record.transcript}
                                </p>
                            </div>

                            <div className="bg-stone-50 p-4 border-t border-stone-100">
                                {record.audio_url && (
                                    <audio controls src={record.audio_url} className="w-full h-8 mb-3" />
                                )}
                                <div className="flex justify-between items-center">
                                    <button className="text-amber-800 text-sm font-semibold hover:underline">
                                        Read Full Transcript
                                    </button>
                                    <div className="flex items-center gap-1 text-amber-600 text-xs font-bold">
                                        <span>AI VERIFIED</span>
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
