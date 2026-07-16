"use client";

import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { MandalaIcon } from '@/components/Icons';
import { apiUrl } from '@/lib/api';

// Language code → human-readable label
const LANG_LABELS: Record<string, string> = {
    en: 'English',
    hi: 'Hindi / हिंदी',
    ta: 'Tamil / தமிழ்',
    te: 'Telugu / తెలుగు',
    kn: 'Kannada / ಕನ್ನಡ',
    ml: 'Malayalam / മലയാളം',
    bn: 'Bengali / বাংলা',
    mr: 'Marathi / मराठी',
    pa: 'Punjabi / ਪੰਜਾਬੀ',
    gu: 'Gujarati / ગુજરાતી',
    ur: 'Urdu / اردو',
    ar: 'Arabic / العربية',
    zh: 'Chinese / 中文',
    fr: 'French / Français',
    de: 'German / Deutsch',
    es: 'Spanish / Español',
    ja: 'Japanese / 日本語',
    ko: 'Korean / 한국어',
    pt: 'Portuguese / Português',
    ru: 'Russian / Русский',
};

interface RecordDetail {
    _id: string;
    title: string;
    category: string;
    contributor: string;
    transcript: string;
    detected_language?: string;
    audio_url?: string;
    illustration_url?: string;
    created_at: string;
    processing_status: string;
    education_data?: {
        summary: { en: string; hi: string; native: string } | string;
        lesson: { en: string; hi: string; native: string } | string;
        moral: { en: string; hi: string; native: string } | string;
        quiz_questions: {
            en: { question: string; answer: string }[];
            hi: { question: string; answer: string }[];
            native: { question: string; answer: string }[];
        } | { question: string; answer: string }[];
    };
    translations?: { [key: string]: string };
    context_data?: {
        cultural_context: string;
        entities: string[];
    };
}

export default function RecordDetailPage() {
    const params = useParams();
    const id = params?.id as string;

    const [record, setRecord] = useState<RecordDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [eduLang, setEduLang] = useState<"native" | "en" | "hi">("native");
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (id) fetchRecord(id);
    }, [id]);

    const fetchRecord = async (recordId: string) => {
        try {
            const response = await axios.get(apiUrl(`/archive/${recordId}`));
            setRecord(response.data);
        } catch (err) {
            console.error("Error fetching record", err);
            setError("Could not load this record. It may not exist.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-indian-wine bg-indian-pattern text-indian-cream relative overflow-hidden">
                <MandalaIcon className="absolute w-[400px] h-[400px] text-indian-gold/15 animate-[spin_120s_linear_infinite] pointer-events-none" />
                <div className="w-16 h-16 border-4 border-indian-gold/30 border-t-indian-gold rounded-full animate-spin mb-4 relative z-10"></div>
                <p className="text-indian-cream/80 font-bold tracking-widest text-sm uppercase animate-pulse relative z-10">Uncovering knowledge...</p>
            </div>
        );
    }

    if (error || !record) {
        return (
            <div className="min-h-screen bg-indian-wine bg-indian-pattern text-indian-cream flex flex-col items-center justify-center text-center py-20 px-6 relative overflow-hidden">
                <MandalaIcon className="absolute w-[400px] h-[400px] text-indian-gold/15 animate-[spin_120s_linear_infinite] pointer-events-none" />
                <div className="relative z-10 flex flex-col items-center">
                    <span className="material-symbols-outlined text-6xl text-indian-gold mb-4">search_off</span>
                    <h2 className="text-2xl font-bold font-headline mb-2 text-indian-cream">Record Not Found</h2>
                    <p className="text-indian-cream/80 mb-6">{error}</p>
                    <Link href="/archive" className="bg-indian-gold text-indian-dark hover:bg-indian-gold/90 transition-colors px-6 py-2 rounded-full font-bold">← Back to Archive</Link>
                </div>
            </div>
        );
    }

    const isFolkMedicine = record.category === 'Folk Medicine';
    const formattedDate = new Date(record.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const skipTime = (amount: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime += amount;
        }
    };

    const getAudioUrl = (url?: string) => {
        if (!url) return '';
        if (url.includes('/uploads/')) {
            const filename = url.split('/uploads/')[1];
            return apiUrl(`/uploads/${filename}`);
        }
        return url;
    };

    const formatTime = (time: number) => {
        if (isNaN(time)) return "0:00";
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

    const getEduText = (field: any) => {
        if (!field) return null;
        if (typeof field === 'string') return field;
        return field[eduLang] || field.native || field.en;
    };

    const getEduQuiz = (field: any) => {
        if (!field) return [];
        if (Array.isArray(field)) return field;
        return field[eduLang] || field.native || field.en || [];
    };

    return (
        <div className="min-h-screen bg-indian-wine bg-indian-pattern text-indian-cream relative overflow-hidden">
            {/* Ambient watermarks */}
            <MandalaIcon className="absolute left-[-150px] top-[15%] w-[500px] h-[500px] text-indian-gold/15 animate-[spin_210s_linear_infinite] pointer-events-none z-0" />
            <MandalaIcon className="absolute right-[-150px] top-[50%] w-[500px] h-[500px] text-indian-gold/15 animate-[spin_150s_linear_infinite] pointer-events-none z-0" />
            <main className="max-w-screen-xl mx-auto px-6 pt-32 pb-32 relative z-10">
                <div className="flex flex-wrap gap-4 items-center mb-8">
                    <Link href="/archive" className="inline-flex items-center gap-2 text-indian-cream/80 hover:text-indian-gold transition-colors font-bold text-xs md:text-sm tracking-wide uppercase">
                        <span className="material-symbols-outlined text-sm">arrow_back</span> Back to Archive
                    </Link>
                </div>

                {/* Audio Player Section */}
                {record.audio_url && (
                    <section className="mb-16">
                        <div className="bg-indian-dark/30 border-tanjore backdrop-blur-md rounded-[2.5rem] p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 shadow-wine-glow relative overflow-hidden">
                            <div className="flex items-center gap-6 w-full md:w-auto relative z-10">
                                <button
                                    onClick={togglePlay}
                                    className="w-16 h-16 shrink-0 rounded-full bg-gradient-to-br from-indian-gold to-indian-terracotta flex items-center justify-center text-indian-cream shadow-lg active:scale-95 transition-transform duration-300 cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                                        {isPlaying ? 'pause' : 'play_arrow'}
                                    </span>
                                </button>
                                <div className="flex flex-col min-w-0">
                                    <h1 className="font-headline font-extrabold text-gold-gradient tracking-tight text-xl md:text-2xl truncate">{record.title}</h1>
                                    <span className="text-indian-cream/80 text-sm font-medium flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm">person</span>
                                        {record.contributor} • {formattedDate}
                                    </span>
                                </div>
                            </div>

                            <div className="flex-grow w-full md:px-8 flex flex-col justify-center relative z-10">
                                <audio
                                    ref={audioRef}
                                    src={getAudioUrl(record.audio_url)}
                                    onTimeUpdate={handleTimeUpdate}
                                    onLoadedMetadata={handleLoadedMetadata}
                                    onEnded={() => setIsPlaying(false)}
                                    onPlay={() => setIsPlaying(true)}
                                    onPause={() => setIsPlaying(false)}
                                    className="hidden"
                                />
                                <div className="relative w-full h-2.5 bg-indian-cream/20 rounded-full overflow-hidden cursor-pointer" onClick={(e) => {
                                    if (audioRef.current && duration > 0) {
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        const percent = (e.clientX - rect.left) / rect.width;
                                        audioRef.current.currentTime = percent * duration;
                                    }
                                }}>
                                    <div className="absolute top-0 left-0 h-full bg-indian-cream rounded-full transition-all duration-100 ease-linear" style={{ width: `${progressPercent}%` }}></div>
                                </div>
                                <div className="flex justify-between mt-3 text-xs font-bold text-indian-cream/70 uppercase tracking-widest">
                                    <span>{formatTime(currentTime)}</span>
                                    <span>{formatTime(duration)}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 md:gap-4 relative z-10 w-full justify-center md:w-auto md:justify-end shrink-0">
                                <button onClick={() => skipTime(-10)} className="p-3 text-indian-cream hover:bg-indian-cream/10 rounded-full transition-colors hidden md:flex cursor-pointer">
                                    <span className="material-symbols-outlined">replay_10</span>
                                </button>
                                <button onClick={() => skipTime(30)} className="p-3 text-indian-cream hover:bg-indian-cream/10 rounded-full transition-colors hidden md:flex cursor-pointer">
                                    <span className="material-symbols-outlined">forward_30</span>
                                </button>
                            </div>
                        </div>
                    </section>
                )}

                {!record.audio_url && (
                    <div className="mb-12">
                        <h1 className="font-headline font-extrabold text-gold-gradient tracking-tight text-4xl md:text-5xl mb-4">{record.title}</h1>
                        <p className="text-lg text-indian-cream/80 flex items-center gap-2 border-l-4 border-indian-gold pl-4">
                            <span className="material-symbols-outlined">person</span>
                            Contributed by <strong className="text-indian-cream">{record.contributor}</strong> on {formattedDate}
                        </p>
                    </div>
                )}

                {/* Two Column Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
                    {/* Left Column: Main Narrative */}
                    <div className="lg:col-span-8 space-y-16">

                        {/* Cultural Context Section */}
                        {record.context_data?.cultural_context && (
                            <div className="relative">
                                <div className="absolute -left-4 md:-left-6 top-1 w-1.5 h-12 bg-indian-gold rounded-full"></div>
                                <h2 className="font-headline text-3xl font-extrabold text-gold-gradient mb-6 tracking-tight">Cultural Context</h2>
                                <div className="bg-indian-dark/30 border border-indian-gold/15 backdrop-blur-md p-6 md:p-8 rounded-2xl leading-relaxed text-lg text-indian-cream/90 shadow-wine-glow relative">
                                    <span className="material-symbols-outlined absolute top-6 right-6 text-4xl text-indian-gold/20">format_quote</span>
                                    <p className="relative z-10">{record.context_data.cultural_context}</p>
                                </div>
                            </div>
                        )}

                        {/* Translation Section — shown above the original transcript */}
                        {(record.translations?.en || record.detected_language) && (
                            <div className="relative">
                                <div className="absolute -left-4 md:-left-6 top-1 w-1.5 h-12 bg-indian-gold rounded-full"></div>
                                <h2 className="font-headline text-2xl font-extrabold text-gold-gradient mb-6 tracking-tight flex items-center gap-3">
                                    <span className="material-symbols-outlined text-indian-gold p-2 bg-indian-gold/10 rounded-xl">translate</span>
                                    English Translation
                                </h2>

                                {/* Detected language badge */}
                                {record.detected_language && (
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="material-symbols-outlined text-sm text-indian-cream/70">language</span>
                                        <span className="text-xs font-bold uppercase tracking-widest text-indian-cream/70">Detected Language:</span>
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indian-gold/10 text-indian-gold text-xs font-bold border border-indian-gold/20">
                                            <span className="w-1.5 h-1.5 rounded-full bg-indian-gold inline-block"></span>
                                            {LANG_LABELS[record.detected_language] ?? record.detected_language.toUpperCase()}
                                        </span>
                                    </div>
                                )}

                                <div className="bg-indian-dark/40 backdrop-blur-md p-6 md:p-10 rounded-2xl border border-indian-gold/20 shadow-wine-glow relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-5 opacity-[0.04] bg-indian-gold rounded-bl-[4rem] group-hover:scale-110 transition-transform duration-500">
                                        <span className="material-symbols-outlined text-7xl text-indian-gold">language</span>
                                    </div>
                                    <p className="whitespace-pre-wrap leading-relaxed text-lg text-indian-cream font-serif relative z-10 drop-cap">
                                        {record.translations?.en
                                            ?? 'English translation not available for this record.'}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Full Transcript Section */}
                        <div>
                            <h2 className="font-headline text-2xl font-extrabold text-gold-gradient mb-8 tracking-tight flex items-center gap-3">
                                <span className="material-symbols-outlined text-indian-gold p-2 bg-indian-gold/10 rounded-xl">notes</span>
                                Full Transcript
                                {record.detected_language && (
                                    <span className="ml-auto text-xs font-bold uppercase tracking-widest text-indian-cream/70 bg-indian-dark/40 px-3 py-1.5 rounded-full border border-indian-gold/20">
                                        {LANG_LABELS[record.detected_language] ?? record.detected_language.toUpperCase()}
                                    </span>
                                )}
                            </h2>
                            <div className="bg-indian-dark/30 backdrop-blur-md rounded-2xl border border-indian-gold/15 p-6 md:p-10 shadow-wine-glow leading-relaxed text-lg text-indian-cream/90 font-serif whitespace-pre-wrap">
                                {record.transcript}
                            </div>
                        </div>

                        {/* Medical Disclaimer Box */}
                        {isFolkMedicine && (
                            <div className="bg-red-950/40 p-8 rounded-3xl flex flex-col md:flex-row items-start md:items-center gap-6 border border-red-800/40">
                                <div className="p-4 bg-red-900/30 rounded-full text-red-200 shrink-0">
                                    <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>shield_with_heart</span>
                                </div>
                                <div>
                                    <h4 className="font-headline font-bold text-red-200 mb-2 text-lg">Archival Preservation Notice</h4>
                                    <p className="text-indian-cream/90 font-medium leading-relaxed">This information is a cultural archive of folk remedies and not medical advice. Please consult a professional healthcare provider for medical concerns.</p>
                                </div>
                            </div>
                        )}

                        {/* AI Insights Card */}
                        {record.education_data && (
                            <div className="bg-indian-dark/35 border border-indian-gold/25 backdrop-blur-md text-indian-cream p-8 md:p-12 rounded-[2.5rem] shadow-wine-glow relative overflow-hidden group">
                                <div className="absolute -right-16 -top-16 w-48 h-48 bg-indian-gold/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700"></div>

                                <div className="flex items-center gap-3 mb-8 relative z-10 justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined bg-indian-gold/10 p-2 rounded-xl backdrop-blur-sm text-indian-gold" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                                        <h3 className="font-headline text-2xl font-bold tracking-tight text-gold-gradient">AI Insights</h3>
                                    </div>

                                    {typeof record.education_data.summary !== 'string' && (
                                        <div className="flex gap-1 bg-indian-dark/40 p-1 rounded-lg border border-indian-gold/10">
                                            <button onClick={() => setEduLang('native')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${eduLang === 'native' ? 'bg-indian-gold text-indian-dark shadow-sm' : 'text-indian-cream/70 hover:text-indian-cream'} cursor-pointer`}>Native</button>
                                            <button onClick={() => setEduLang('en')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${eduLang === 'en' ? 'bg-indian-gold text-indian-dark shadow-sm' : 'text-indian-cream/70 hover:text-indian-cream'} cursor-pointer`}>EN</button>
                                            <button onClick={() => setEduLang('hi')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${eduLang === 'hi' ? 'bg-indian-gold text-indian-dark shadow-sm' : 'text-indian-cream/70 hover:text-indian-cream'} cursor-pointer`}>HI</button>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-6 relative z-10 text-center">
                                    {record.education_data?.summary && (
                                        <div className="bg-indian-dark/50 p-6 md:p-8 rounded-3xl border border-indian-gold/15 text-left">
                                            <p className="text-xs font-bold uppercase tracking-widest text-indian-gold/80 mb-3 text-center">Summary</p>
                                            <div className="prose prose-invert prose-lg max-w-none text-indian-cream prose-p:leading-relaxed prose-a:text-indian-gold">
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{getEduText(record.education_data.summary) || ""}</ReactMarkdown>
                                            </div>
                                        </div>
                                    )}

                                    {record.education_data?.lesson && (
                                        <div className="bg-indian-dark/50 p-6 md:p-8 rounded-3xl border border-indian-gold/15 text-left">
                                            <p className="text-xs font-bold uppercase tracking-widest text-indian-gold/80 mb-3 flex items-center justify-center gap-2 text-center">
                                                <span className="material-symbols-outlined text-sm">school</span> Core Lesson
                                            </p>
                                            <div className="prose prose-invert prose-lg max-w-none text-indian-cream prose-p:leading-relaxed prose-a:text-indian-gold">
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{getEduText(record.education_data.lesson) || ""}</ReactMarkdown>
                                            </div>
                                        </div>
                                    )}

                                    {record.education_data?.moral && (
                                        <p className="pt-8 pb-4 text-indian-gold leading-relaxed italic border-t border-indian-gold/20 font-serif text-2xl md:text-3xl font-medium">
                                            &ldquo;{getEduText(record.education_data.moral)}&rdquo;
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: AI & Meta */}
                    <div className="lg:col-span-4 space-y-8">
                        
                        {/* AI-Generated Illustration Frame */}
                        {record.illustration_url && (
                            <div className="bg-indian-dark/30 backdrop-blur-md p-3 rounded-[2.5rem] border border-indian-gold/20 shadow-wine-glow overflow-hidden group">
                                <div className="aspect-square w-full rounded-[2rem] overflow-hidden border border-indian-gold/15 shadow-inner p-1 relative">
                                    <img 
                                        src={record.illustration_url} 
                                        alt={`AI generated illustration for ${record.title}`} 
                                        className="w-full h-full object-cover rounded-[1.8rem] transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <span className="text-xs font-bold uppercase tracking-widest text-indian-gold bg-black/60 px-3 py-1.5 rounded-full border border-indian-gold/30">AI Story Illustration</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Classifications */}
                        <div className="bg-indian-dark/30 backdrop-blur-md p-8 rounded-[2rem] border border-indian-gold/15 shadow-wine-glow">
                            <h4 className="font-headline font-bold text-gold-gradient mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined">label</span>
                                Classifications
                            </h4>

                            <div className="space-y-6">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-indian-cream/70 mb-3">Category</p>
                                    <span className="inline-block bg-indian-gold/10 text-indian-gold px-4 py-2 rounded-full text-sm font-bold border border-indian-gold/20">
                                        {record.category}
                                    </span>
                                </div>

                                {record.context_data?.entities && record.context_data.entities.length > 0 && (
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-widest text-indian-cream/70 mb-3">Key Entities</p>
                                        <div className="flex flex-wrap gap-2">
                                            {record.context_data.entities.map((entity, i) => (
                                                <span key={i} className="bg-indian-dark/50 text-indian-cream px-3 py-1.5 rounded-lg text-sm font-medium border border-indian-gold/15 shadow-sm">
                                                    {entity}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Interactive Quiz (if available) */}
                        {record.education_data?.quiz_questions && getEduQuiz(record.education_data.quiz_questions).length > 0 && (
                            <div className="bg-indian-dark/35 backdrop-blur-md p-8 rounded-[2rem] border border-indian-gold/20 shadow-wine-glow">
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="material-symbols-outlined text-indian-gold p-2 bg-indian-gold/10 rounded-xl">quiz</span>
                                    <h3 className="font-headline text-xl font-bold text-gold-gradient">Test Your Knowledge</h3>
                                </div>
                                <div className="space-y-4">
                                    {getEduQuiz(record.education_data.quiz_questions).map((q: any, i: number) => (
                                        <div key={i} className="bg-indian-dark/50 p-5 rounded-2xl shadow-sm border border-indian-gold/15">
                                            <p className="font-bold text-indian-cream mb-3 leading-snug">{i + 1}. {q.question}</p>
                                            <details className="group">
                                                <summary className="text-sm text-indian-gold font-bold cursor-pointer hover:underline list-none flex items-center gap-1 select-none">
                                                    <span className="material-symbols-outlined text-sm group-open:rotate-180 transition-transform">expand_more</span>
                                                    Reveal Answer
                                                </summary>
                                                <div className="mt-4 pt-4 border-t border-indian-gold/15">
                                                    <p className="text-indian-cream/80 leading-relaxed text-sm">
                                                        {q.answer}
                                                    </p>
                                                </div>
                                            </details>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
