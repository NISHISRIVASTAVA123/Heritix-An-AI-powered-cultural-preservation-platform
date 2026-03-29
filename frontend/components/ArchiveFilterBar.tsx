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
        <div className="flex flex-col md:flex-row gap-6 mb-12 justify-between items-center bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/20">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
                <span className="absolute left-4 top-3 text-outline">🔍</span>
                <input
                    type="text"
                    placeholder="Search stories, remedies, traditions..."
                    className="w-full pl-10 pr-4 py-3 border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-surface-container-highest text-on-surface placeholder:text-outline-variant"
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
                                ? 'bg-primary text-on-primary shadow-md transform scale-105'
                                : 'bg-surface text-on-surface-variant border border-outline-variant/20 hover:bg-surface-container hover:border-outline-variant'
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
