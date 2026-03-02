"use client";

import React from 'react';

interface ArchiveFilterBarProps {
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    selectedCategory: string;
    setSelectedCategory: (c: string) => void;
    categories: string[];
}

export default function ArchiveFilterBar({
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    categories
}: ArchiveFilterBarProps) {
    return (
        <div className="flex flex-col md:flex-row gap-6 mb-12 justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
                <span className="absolute left-4 top-3 text-stone-400">🔍</span>
                <input
                    type="text"
                    placeholder="Search stories, remedies, traditions..."
                    className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Category Chips */}
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`
                            px-4 py-2 rounded-full text-sm font-bold tracking-wide transition-all whitespace-nowrap
                            ${selectedCategory === cat
                                ? 'bg-primary text-white shadow-md transform scale-105'
                                : 'bg-background text-stone-600 border border-stone-200 hover:bg-stone-100 hover:border-stone-300'
                            }
                        `}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </div>
    );
}
