import Link from 'next/link';
import React from 'react';
import TiltedCard from './TiltedCard';

interface KnowledgeCardProps {
    id: string;
    title: string;
    category: string;
    contributor: string;
    date: string;
    audioUrl?: string;
    summary?: string | { en?: string, hi?: string, native?: string };
}

export default function KnowledgeCard({ id, title, category, contributor, date, audioUrl, summary }: KnowledgeCardProps) {
    // Determine visuals based on category string
    const categoryLower = category.toLowerCase();
    let Icon = 'auto_stories';
    let iconBg = 'bg-indian-olive text-indian-cream border border-indian-gold/20';

    // Default image if none matches
    let imgUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuA8NVPCLVRqC7qWmyp9ExpuwWwaAN3naNuVnTNfLWb5aiOYd75NlV0Y1VCOHue2-xkoJgO1T6kMaM2DzREHiHQDCnLwJzDyUHFxEyc_9uMe5YWqjoMoJTlryNvi0_-CnM0Ribr9TmpAcZzTr7S7QkiApDyiIaYxKNR5MMlQLdX7uA9ZogKvksFGKVvsg1TSreK2w5NN9QwcgfYFU3_xWvnN8JIyvrEfjaoNnkI_H4bp1DiQPT81dadbwTeMzYPKLO_ZzBrSla0EXRfb";

    if (categoryLower.includes('medicine') || categoryLower.includes('health')) {
        Icon = 'medical_services';
        iconBg = 'bg-indian-emerald text-indian-cream border border-indian-gold/20';
        imgUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuB7Nw0yCAaz7kNa7UHD9f6Ni2zGxZsbEwX8l1_dEzgJW93fAYFU9J9N7TIuHZO7epZInxLfyVaFElLIkhGRM_KbdMqPNW5NfzhBNDAxahEFroczGv06UPUmHIfqZVFW6747J_-DNkUza8McNymnLXbmB7TGS0Bm5m1f6ZNJk_BfXqgNv6Ih9pt72TofkwDUH__6ewL9DXgd2BW0ASGvtXbthVAWqR1RiqVWagVCFOUJVktKCoWqQer3w9w0RTKmrgKxBcgvjNvh8mgg";
    } else if (categoryLower.includes('agriculture') || categoryLower.includes('farming') || categoryLower.includes('nature')) {
        Icon = 'agriculture';
        iconBg = 'bg-indian-emerald text-indian-cream border border-indian-gold/20';
        imgUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuBD9d39F9fSRsHYyiH7bReJ2iMTqIomVbQy4sFTK4Uk22LolNPflGNZwMK-kMarcg1L5hwm2zX-2h_4n4bcOD_I3IamCQSZxw9MicFVWAYOUMkHlmJXgYFVJZY6DL-fMGioV0sTbC0jdpsa1QdqVHhfDJFqUibQekf_mKmWvhmPdkvIcgf-yRThU2w5qynC1_XepZLkQX3ferYBsCb3JWtGpez8blZ0LsCBs9JbLmlYcnZTQjoHed55slad1PuEccmYGTYX6EWGbgzN";
    } else if (categoryLower.includes('recipe') || categoryLower.includes('food') || categoryLower.includes('cooking')) {
        Icon = 'restaurant';
        iconBg = 'bg-indian-terracotta text-indian-cream border border-indian-gold/20';
        imgUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuDelDtn-KXaUJRYrBNH1h1qAxAITWG1KFWs6j_IQCCYpsrlKxyPAGsGiO_xVIeYvhNIxQBWLFS_xFp77irKXsMBnN5zJQ84g5FMKTH81B1r9Ag8U_qMSLjK3Bgn4eRB1cXJuV4l4-hQKrdVTuyXzvYYybihxXRlbDpbUA7IQJTpcabwztFrNJDNPq_rslKK0BS27VzFrb6OB9YJ6OEyxp1CqboeEN-R_ujzelADGZJ3mIsWaXLRCg2wXKIF5Jue61C2QZ9XahKOM1O6";
    } else if (categoryLower.includes('ritual') || categoryLower.includes('ceremony') || categoryLower.includes('tradition')) {
        Icon = 'psychology';
        iconBg = 'bg-indian-wine text-indian-cream border border-indian-gold/20';
        imgUrl = "https://images.unsplash.com/photo-1601614769062-8e7c1eb7c4d5?auto=format&fit=crop&w=800&q=80"; // Candles/tradition
    } else if (categoryLower.includes('music') || categoryLower.includes('song')) {
        Icon = 'music_note';
        iconBg = 'bg-indian-prussian text-indian-cream border border-indian-gold/20';
        imgUrl = "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&q=80&w=800"; // Music instruments
    } else if (categoryLower.includes('myth') || categoryLower.includes('folklore') || categoryLower.includes('story') || categoryLower.includes('tale')) {
        Icon = 'menu_book';
        iconBg = 'bg-indian-olive text-indian-cream border border-indian-gold/20';
        imgUrl = "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=800"; // Old book
    } else if (categoryLower.includes('history') || categoryLower.includes('heritage')) {
        Icon = 'account_balance';
        iconBg = 'bg-indian-dark text-indian-cream/80 border border-indian-gold/20';
        imgUrl = "https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&q=80&w=800"; // History/ruins
    } else if (categoryLower.includes('craft') || categoryLower.includes('art')) {
        Icon = 'palette';
        iconBg = 'bg-indian-terracotta text-indian-cream border border-indian-gold/20';
        imgUrl = "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&q=80&w=800"; // Craft/art
    }

    const formattedDate = new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'short' });
    const displaySummary = typeof summary === 'string' ? summary : (summary?.en || summary?.native || '');

    return (
        <TiltedCard>
            <div className="group bg-indian-dark/30 backdrop-blur-md rounded-2xl p-8 shadow-wine-glow flex flex-col h-full border border-indian-gold/15 hover:border-indian-gold/30 hover:bg-indian-dark/40 transition-all duration-300 relative z-10 w-full">
                <div className="flex justify-between items-start mb-6">
                    <div className={`p-3 rounded-xl flex items-center justify-center ${iconBg}`}>
                        <span className="material-symbols-outlined">{Icon}</span>
                    </div>
                    <span className="px-4 py-1.5 bg-indian-gold/10 text-indian-gold border border-indian-gold/25 rounded-full text-xs font-bold tracking-wider uppercase">
                        {category}
                    </span>
                </div>

                <div className="mb-4">
                    <img className="w-full h-48 object-cover rounded-xl mb-6 shadow-sm pointer-events-none" alt={title} src={imgUrl} />
                    <h3 className="text-2xl font-bold font-headline text-indian-cream mb-3 leading-tight">{title}</h3>
                    <p className="text-indian-cream/80 font-body leading-relaxed line-clamp-2">
                        {displaySummary}
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-sm text-indian-cream/70 font-semibold">
                        <span className="material-symbols-outlined text-sm">person</span>
                        {contributor}
                    </div>
                </div>

                <div className="mt-auto pt-6 flex items-center justify-between border-t border-indian-gold/15">
                    <span className="px-4 py-1 bg-indian-dark/50 text-indian-cream/70 border border-indian-gold/10 font-bold text-xs rounded-full">
                        {formattedDate}
                    </span>

                    <Link href={`/archive/${id}`} className="bg-gold-gradient text-indian-dark px-6 py-2 rounded-full font-bold text-sm flex items-center gap-2 hover:shadow-lg transition-all active:scale-95 border border-indian-gold/25 cursor-pointer">
                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                            {audioUrl ? 'play_arrow' : 'article'}
                        </span>
                        {audioUrl ? 'Listen' : 'Read'}
                    </Link>
                </div>
            </div>
        </TiltedCard>
    );
}
