import { MandalaIcon, LotusIcon } from '@/components/Icons';

export default function DashboardPage() {
    return (
        <div className="min-h-screen bg-indian-emerald bg-indian-pattern text-indian-cream pt-32 pb-24 px-6 relative overflow-hidden bg-gradient-to-b from-indian-emerald to-indian-dark">
            {/* Radial glow spotlight */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.15),transparent_60%)] pointer-events-none z-0"></div>

            {/* Ambient watermarks */}
            <MandalaIcon className="absolute left-[-180px] top-[10%] w-[600px] h-[600px] text-indian-gold/10 animate-[spin_240s_linear_infinite] pointer-events-none z-0" />
            <MandalaIcon className="absolute right-[-180px] top-[40%] w-[600px] h-[600px] text-indian-gold/10 animate-[spin_180s_linear_infinite] pointer-events-none z-0" />

            <div className="max-w-6xl mx-auto relative z-10 space-y-12 animate-in fade-in duration-700">
                {/* Header Banner - Tanjore Framed */}
                <div className="bg-indian-dark/45 border-tanjore backdrop-blur-md p-8 md:p-10 rounded-[2.5rem] shadow-emerald-glow text-center relative overflow-hidden">
                    <div className="absolute -left-12 -top-12 w-32 h-32 bg-indian-gold/10 rounded-full blur-xl pointer-events-none"></div>
                    <div className="absolute -right-12 -bottom-12 w-32 h-32 bg-indian-gold/10 rounded-full blur-xl pointer-events-none"></div>
                    
                    <div className="flex justify-center mb-4">
                        <div className="w-12 h-12 bg-gold-gradient rounded-full flex items-center justify-center shadow-lg text-indian-dark">
                            <LotusIcon className="w-7 h-7" />
                        </div>
                    </div>
                    
                    <h1 className="text-4xl md:text-5xl font-serif font-extrabold text-gold-gradient tracking-tight mb-4">
                        Cultural Wisdom Portal
                    </h1>
                    <p className="text-indian-bronze text-base md:text-lg leading-relaxed max-w-2xl mx-auto font-body">
                        Embark on an interactive journey through generation-tested oral histories, regional folklore, traditional farming methods, and herbal knowledge.
                    </p>
                </div>

                {/* Main Asymmetric Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Left Column: Recent Lessons */}
                    <div className="lg:col-span-7 bg-indian-dark/35 backdrop-blur-md p-8 rounded-[2.5rem] shadow-emerald-glow border border-indian-gold/20 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-6 border-b border-indian-gold/15 pb-4">
                                <span className="material-symbols-outlined text-indian-gold text-2xl">menu_book</span>
                                <h2 className="text-2xl font-bold text-gold-gradient">Study Manuscripts</h2>
                            </div>
                            
                            <div className="space-y-6">
                                <div className="p-5 bg-indian-dark/50 hover:bg-indian-dark/70 rounded-2xl border border-indian-gold/15 hover:border-indian-gold/45 transition-all duration-300 shadow-sm hover:shadow-emerald-glow group">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] font-bold tracking-widest text-indian-gold uppercase bg-indian-gold/10 px-2.5 py-1 rounded-md">
                                            FOLK MEDICINE • I
                                        </span>
                                        <span className="text-xs font-semibold text-indian-cream/50">15 mins</span>
                                    </div>
                                    <h4 className="font-serif text-xl font-bold text-indian-cream group-hover:text-indian-gold transition-colors">
                                        The Significance of Turmeric
                                    </h4>
                                    <p className="text-sm text-indian-bronze mt-1 leading-relaxed">
                                        Learn about the ritualistic uses of turmeric in traditional weddings and its ancient medicinal healing properties.
                                    </p>
                                    <button className="text-indian-gold text-sm font-bold mt-4 hover:text-indian-cream transition-colors cursor-pointer flex items-center gap-1.5 group-hover:translate-x-1.5 duration-300">
                                        Study Manuscript <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                    </button>
                                </div>

                                <div className="p-5 bg-indian-dark/50 hover:bg-indian-dark/70 rounded-2xl border border-indian-gold/15 hover:border-indian-gold/45 transition-all duration-300 shadow-sm hover:shadow-emerald-glow group">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] font-bold tracking-widest text-indian-gold uppercase bg-indian-gold/10 px-2.5 py-1 rounded-md">
                                            FOLKLORE & RITUALS • II
                                        </span>
                                        <span className="text-xs font-semibold text-indian-cream/50">20 mins</span>
                                    </div>
                                    <h4 className="font-serif text-xl font-bold text-indian-cream group-hover:text-indian-gold transition-colors">
                                        Folk Songs of the Harvest
                                    </h4>
                                    <p className="text-sm text-indian-bronze mt-1 leading-relaxed">
                                        A deep dive analysis of common themes, musical rhythms, and celebrations in regional Indian harvest festivals.
                                    </p>
                                    <button className="text-indian-gold text-sm font-bold mt-4 hover:text-indian-cream transition-colors cursor-pointer flex items-center gap-1.5 group-hover:translate-x-1.5 duration-300">
                                        Study Manuscript <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Ledger Stats & Contribution Action */}
                    <div className="lg:col-span-5 space-y-8 flex flex-col">
                        
                        {/* Contribution Stats */}
                        <div className="bg-indian-dark/35 backdrop-blur-md p-8 rounded-[2.5rem] shadow-emerald-glow border border-indian-gold/20 text-center flex flex-col justify-center items-center">
                            <div className="flex items-center gap-3 mb-6 border-b border-indian-gold/15 pb-4 w-full justify-center">
                                <span className="material-symbols-outlined text-indian-gold text-2xl">history_edu</span>
                                <h2 className="text-2xl font-bold text-gold-gradient">Preservation Ledger</h2>
                            </div>
                            
                            <div className="w-24 h-24 rounded-full border-tanjore flex items-center justify-center bg-indian-dark/70 text-gold-gradient mb-4 shadow-emerald-glow relative overflow-hidden group">
                                <LotusIcon className="absolute w-12 h-12 text-indian-gold/5 pointer-events-none group-hover:scale-110 duration-700" />
                                <span className="text-4xl font-extrabold font-serif text-gold-gradient relative z-10">0</span>
                            </div>
                            <p className="text-xs font-bold uppercase tracking-widest text-indian-cream/70">Total Oral Histories Contributed</p>
                            <p className="text-indian-bronze text-sm mt-3 leading-relaxed max-w-xs">
                                Your catalog is currently empty. Start recording oral histories to see them listed on your dashboard.
                            </p>
                        </div>

                        {/* CTA: Record oral history */}
                        <div className="bg-indian-dark/35 border-tanjore backdrop-blur-md p-8 rounded-[2.5rem] shadow-emerald-glow text-center flex-grow flex flex-col justify-between items-center relative overflow-hidden">
                            <div className="absolute -left-8 -top-8 w-24 h-24 bg-indian-gold/5 rounded-full blur-xl pointer-events-none"></div>
                            <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-indian-gold/5 rounded-full blur-xl pointer-events-none"></div>
                            
                            <div className="space-y-4 relative z-10 w-full">
                                <h3 className="font-serif text-2xl font-extrabold text-gold-gradient">Contribute to the Archive</h3>
                                <p className="text-indian-bronze text-sm leading-relaxed max-w-sm mx-auto">
                                    Every voice, story, and family recipe is a valuable piece of cultural history. Speak freely, and let the ledger record your truth.
                                </p>
                            </div>
                            
                            <div className="w-full pt-6 relative z-10">
                                <a href="/capture" className="inline-flex w-full items-center justify-center gap-2 bg-gold-gradient text-indian-dark font-bold text-sm tracking-wider uppercase py-4 rounded-full hover:opacity-95 shadow-md hover:shadow-emerald-glow transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer">
                                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>mic</span>
                                    Record Oral History
                                </a>
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
}

