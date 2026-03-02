"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import ArchiveFilterBar from '@/components/ArchiveFilterBar';
import KnowledgeCard from '@/components/KnowledgeCard';

interface Record {
    _id: string;
    title: string;
    category: string;
    contributor: string;
    transcript: string;
    audio_url?: string;
    summary?: string; // Flattened from education_data.summary
    created_at: string;
}

export default function ArchivePage() {
    const [records, setRecords] = useState<Record[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
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
        const matchesSearch = (record.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (record.transcript?.toLowerCase() || '').includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || record.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="max-w-7xl mx-auto py-12 px-4">
            <h1 className="text-5xl font-serif font-bold text-primary mb-4 text-center">Cultural Archive</h1>
            <p className="text-center text-stone-500 mb-12 max-w-2xl mx-auto">
                Explore a growing collection of oral histories, traditional knowledge, and wisdom passed down through generations.
            </p>

            <ArchiveFilterBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                categories={categories}
            />

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-4">
                    <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    <p className="text-stone-500 font-medium animate-pulse">Loading Archive...</p>
                </div>
            ) : filteredRecords.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-off-white rounded-2xl border-2 border-dashed border-stone-200">
                    <span className="text-4xl mb-4 opacity-50">🏺</span>
                    <h3 className="text-xl font-bold text-stone-600 mb-2">No records found</h3>
                    <p className="text-stone-500">Try adjusting your search or category filters.</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
