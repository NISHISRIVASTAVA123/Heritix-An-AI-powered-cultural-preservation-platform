import Link from 'next/link';
import React from 'react';

interface KnowledgeCardProps {
    id: string;
    title: string;
    category: string;
    contributor: string;
    date: string;
    audioUrl?: string;
    summary?: string;
}

export default function KnowledgeCard({ id, title, category, contributor, date, audioUrl, summary }: KnowledgeCardProps) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
            <div className="p-6">
                {/* Meta Header */}
                <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 bg-background text-primary text-xs font-bold uppercase rounded-full tracking-wide border border-primary/20">
                        {category}
                    </span>
                    <span className="text-xs text-stone-400 font-medium">
                        {new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                </div>

                {/* Content */}
                <h3 className="text-xl font-serif font-bold text-text-charcoal mb-2 leading-tight group-hover:text-primary transition-colors">
                    {title}
                </h3>
                <p className="text-sm text-stone-500 mb-4 flex items-center gap-2">
                    <span>👤</span> {contributor}
                </p>

                {summary && (
                    <p className="text-stone-600 line-clamp-3 text-sm leading-relaxed mb-6">
                        {summary}
                    </p>
                )}

                {/* Footer / Player Preview */}
                <div className="pt-4 border-t border-stone-100 flex justify-between items-center">
                    {audioUrl ? (
                        <div className="flex items-center gap-2 text-xs font-bold text-secondary">
                            <span className="w-6 h-6 rounded-full bg-secondary/10 flex items-center justify-center">▶</span>
                            Audio Available
                        </div>
                    ) : (
                        <div className="text-xs text-muted">Transcript Only</div>
                    )}

                    <Link href={`/archive/${id}`} className="text-highlight text-sm font-bold hover:underline">
                        Read More →
                    </Link>
                </div>
            </div>
        </div>
    );
}
