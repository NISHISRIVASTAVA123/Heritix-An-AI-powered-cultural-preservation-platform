"use client";

import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useParams } from 'next/navigation';

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
            const response = await axios.get(`http://localhost:8000/archive/${recordId}`);
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
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
                <p className="text-on-surface-variant font-bold tracking-widest text-sm uppercase animate-pulse">Uncovering knowledge...</p>
            </div>
        );
    }

    if (error || !record) {
        return (
            <div className="text-center py-20 flex flex-col items-center">
                <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">search_off</span>
                <h2 className="text-2xl font-bold font-headline text-on-surface mb-2">Record Not Found</h2>
                <p className="text-on-surface-variant mb-6">{error}</p>
                <Link href="/archive" className="bg-primary text-on-primary px-6 py-2 rounded-full font-bold">← Back to Archive</Link>
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
        <main className="max-w-screen-xl mx-auto px-6 pt-32 pb-32">
            <Link href="/archive" className="inline-flex items-center gap-2 mb-8 text-on-surface-variant hover:text-primary transition-colors font-bold text-sm tracking-wide uppercase">
                <span className="material-symbols-outlined text-sm">arrow_back</span> Back to Archive
            </Link>

            {/* Audio Player Section */}
            {record.audio_url && (
                <section className="mb-16">
                    <div className="bg-tertiary-container rounded-[2.5rem] p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 shadow-[0_20px_40px_rgba(27,28,25,0.06)] relative overflow-hidden">
                        {/* Decorative background grain/pattern could go here */}
                        <div className="flex items-center gap-6 w-full md:w-auto relative z-10">
                            <button
                                onClick={togglePlay}
                                className="w-16 h-16 shrink-0 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white shadow-lg active:scale-95 transition-transform duration-300"
                            >
                                <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                                    {isPlaying ? 'pause' : 'play_arrow'}
                                </span>
                            </button>
                            <div className="flex flex-col min-w-0">
                                <h1 className="font-headline font-extrabold text-on-tertiary tracking-tight text-xl md:text-2xl truncate">{record.title}</h1>
                                <span className="text-on-tertiary/80 text-sm font-medium flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">person</span>
                                    {record.contributor} • {formattedDate}
                                </span>
                            </div>
                        </div>

                        <div className="flex-grow w-full md:px-8 flex flex-col justify-center relative z-10">
                            <audio
                                ref={audioRef}
                                src={record.audio_url}
                                onTimeUpdate={handleTimeUpdate}
                                onLoadedMetadata={handleLoadedMetadata}
                                onEnded={() => setIsPlaying(false)}
                                className="hidden"
                            />
                            <div className="relative w-full h-2.5 bg-on-tertiary/20 rounded-full overflow-hidden cursor-pointer" onClick={(e) => {
                                if (audioRef.current) {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const percent = (e.clientX - rect.left) / rect.width;
                                    audioRef.current.currentTime = percent * duration;
                                }
                            }}>
                                <div className="absolute top-0 left-0 h-full bg-on-tertiary rounded-full transition-all duration-100 ease-linear" style={{ width: `${progressPercent}%` }}></div>
                            </div>
                            <div className="flex justify-between mt-3 text-xs font-bold text-on-tertiary/70 uppercase tracking-widest">
                                <span>{formatTime(currentTime)}</span>
                                <span>{formatTime(duration)}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 md:gap-4 relative z-10 w-full justify-center md:w-auto md:justify-end shrink-0">
                            <button onClick={() => skipTime(-10)} className="p-3 text-on-tertiary hover:bg-on-tertiary/10 rounded-full transition-colors hidden md:flex">
                                <span className="material-symbols-outlined">replay_10</span>
                            </button>
                            <button onClick={() => skipTime(30)} className="p-3 text-on-tertiary hover:bg-on-tertiary/10 rounded-full transition-colors hidden md:flex">
                                <span className="material-symbols-outlined">forward_30</span>
                            </button>
                        </div>
                    </div>
                </section>
            )}

            {!record.audio_url && (
                <div className="mb-12">
                    <h1 className="font-headline font-extrabold text-primary tracking-tight text-4xl md:text-5xl mb-4">{record.title}</h1>
                    <p className="text-lg text-on-surface-variant flex items-center gap-2 border-l-4 border-primary pl-4">
                        <span className="material-symbols-outlined">person</span>
                        Contributed by <strong className="text-on-surface">{record.contributor}</strong> on {formattedDate}
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
                            <div className="absolute -left-4 md:-left-6 top-1 w-1.5 h-12 bg-primary rounded-full"></div>
                            <h2 className="font-headline text-3xl font-extrabold text-primary mb-6 tracking-tight">Cultural Context</h2>
                            <div className="bg-surface-container-low p-6 md:p-8 rounded-2xl leading-relaxed text-lg text-on-surface-variant shadow-sm border border-surface-container-high relative">
                                <span className="material-symbols-outlined absolute top-6 right-6 text-4xl text-outline-variant/20">format_quote</span>
                                <p className="relative z-10">{record.context_data.cultural_context}</p>
                            </div>
                        </div>
                    )}

                    {/* Translation Section — shown above the original transcript */}
                    {(record.translations?.en || record.detected_language) && (
                        <div className="relative">
                            <div className="absolute -left-4 md:-left-6 top-1 w-1.5 h-12 bg-secondary rounded-full"></div>
                            <h2 className="font-headline text-2xl font-extrabold text-on-surface mb-6 tracking-tight flex items-center gap-3">
                                <span className="material-symbols-outlined text-secondary p-2 bg-secondary/10 rounded-xl">translate</span>
                                English Translation
                            </h2>

                            {/* Detected language badge */}
                            {record.detected_language && (
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="material-symbols-outlined text-sm text-outline">language</span>
                                    <span className="text-xs font-bold uppercase tracking-widest text-outline">Detected Language:</span>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-bold border border-secondary/20">
                                        <span className="w-1.5 h-1.5 rounded-full bg-secondary inline-block"></span>
                                        {LANG_LABELS[record.detected_language] ?? record.detected_language.toUpperCase()}
                                    </span>
                                </div>
                            )}

                            <div className="bg-surface-container-lowest p-6 md:p-10 rounded-2xl border border-outline-variant/30 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-5 opacity-[0.04] bg-secondary-container rounded-bl-[4rem] group-hover:scale-110 transition-transform duration-500">
                                    <span className="material-symbols-outlined text-7xl">language</span>
                                </div>
                                <p className="whitespace-pre-wrap leading-relaxed text-lg text-on-surface font-serif relative z-10">
                                    {record.translations?.en
                                        ?? 'English translation not available for this record.'}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Full Transcript Section */}
                    <div>
                        <h2 className="font-headline text-2xl font-extrabold text-on-surface mb-8 tracking-tight flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary p-2 bg-primary/10 rounded-xl">notes</span>
                            Full Transcript
                            {record.detected_language && (
                                <span className="ml-auto text-xs font-bold uppercase tracking-widest text-outline bg-surface-container-high px-3 py-1.5 rounded-full border border-outline-variant/20">
                                    {LANG_LABELS[record.detected_language] ?? record.detected_language.toUpperCase()}
                                </span>
                            )}
                        </h2>
                        <div className="bg-surface rounded-2xl border border-surface-container-highest p-6 md:p-10 shadow-sm leading-relaxed text-lg text-on-surface-variant font-serif whitespace-pre-wrap">
                            {record.transcript}
                        </div>
                    </div>

                    {/* Medical Disclaimer Box */}
                    {isFolkMedicine && (
                        <div className="bg-error-container/30 p-8 rounded-3xl flex flex-col md:flex-row items-start md:items-center gap-6 border border-error/20">
                            <div className="p-4 bg-error-container rounded-full text-on-error-container shrink-0">
                                <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>shield_with_heart</span>
                            </div>
                            <div>
                                <h4 className="font-headline font-bold text-on-error-container mb-2 text-lg">Archival Preservation Notice</h4>
                                <p className="text-on-surface-variant font-medium leading-relaxed">This information is a cultural archive of folk remedies and not medical advice. Please consult a professional healthcare provider for medical concerns.</p>
                            </div>
                        </div>
                    )}

                    {/* AI Insights Card */}
                    {record.education_data && (
                        <div className="bg-primary text-on-primary p-8 md:p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                            <div className="absolute -right-16 -top-16 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700"></div>

                            <div className="flex items-center gap-3 mb-8 relative z-10 justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined bg-on-primary/10 p-2 rounded-xl backdrop-blur-sm text-on-primary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                                    <h3 className="font-headline text-2xl font-bold tracking-tight text-on-primary">AI Insights</h3>
                                </div>

                                {typeof record.education_data.summary !== 'string' && (
                                    <div className="flex gap-1 bg-on-primary/10 p-1 rounded-lg backdrop-blur-sm">
                                        <button onClick={() => setEduLang('native')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${eduLang === 'native' ? 'bg-on-primary text-primary shadow-sm' : 'text-on-primary/70 hover:text-on-primary'}`}>Native</button>
                                        <button onClick={() => setEduLang('en')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${eduLang === 'en' ? 'bg-on-primary text-primary shadow-sm' : 'text-on-primary/70 hover:text-on-primary'}`}>EN</button>
                                        <button onClick={() => setEduLang('hi')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${eduLang === 'hi' ? 'bg-on-primary text-primary shadow-sm' : 'text-on-primary/70 hover:text-on-primary'}`}>HI</button>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-6 relative z-10 text-center">
                                {record.education_data?.summary && (
                                    <div className="bg-on-primary/10 p-6 md:p-8 rounded-3xl backdrop-blur-md border border-on-primary/5">
                                        <p className="text-xs font-bold uppercase tracking-widest text-on-primary/80 mb-3">Summary</p>
                                        <p className="text-lg md:text-xl leading-relaxed text-on-primary">{getEduText(record.education_data.summary)}</p>
                                    </div>
                                )}

                                {record.education_data?.lesson && (
                                    <div className="bg-on-primary/10 p-6 md:p-8 rounded-3xl backdrop-blur-md border border-on-primary/5">
                                        <p className="text-xs font-bold uppercase tracking-widest text-on-primary/80 mb-3 flex items-center justify-center gap-2">
                                            <span className="material-symbols-outlined text-sm">school</span> Core Lesson
                                        </p>
                                        <p className="text-lg md:text-xl leading-relaxed text-on-primary">{getEduText(record.education_data.lesson)}</p>
                                    </div>
                                )}

                                {record.education_data?.moral && (
                                    <p className="pt-8 pb-4 text-on-primary leading-relaxed italic border-t border-on-primary/20 font-serif text-2xl md:text-3xl font-medium">
                                        &ldquo;{getEduText(record.education_data.moral)}&rdquo;
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: AI & Meta */}
                <div className="lg:col-span-4 space-y-8">

                    {/* Classifications */}
                    <div className="bg-surface-container-low p-8 rounded-[2rem] border border-outline-variant/20">
                        <h4 className="font-headline font-bold text-on-surface mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined">label</span>
                            Classifications
                        </h4>

                        <div className="space-y-6">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-outline mb-3">Category</p>
                                <span className="inline-block bg-secondary-container text-on-secondary-container px-4 py-2 rounded-full text-sm font-bold border border-secondary/20">
                                    {record.category}
                                </span>
                            </div>

                            {record.context_data?.entities && record.context_data.entities.length > 0 && (
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-outline mb-3">Key Entities</p>
                                    <div className="flex flex-wrap gap-2">
                                        {record.context_data.entities.map((entity, i) => (
                                            <span key={i} className="bg-surface text-on-surface-variant px-3 py-1.5 rounded-lg text-sm font-medium border border-surface-container-highest shadow-sm">
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
                        <div className="bg-secondary-fixed/50 p-8 rounded-[2rem] border border-secondary-fixed shadow-[0_8px_16px_rgba(253,195,154,0.1)]">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="material-symbols-outlined text-secondary p-2 bg-secondary/10 rounded-xl">quiz</span>
                                <h3 className="font-headline text-xl font-bold text-on-surface">Test Your Knowledge</h3>
                            </div>
                            <div className="space-y-4">
                                {getEduQuiz(record.education_data.quiz_questions).map((q: any, i: number) => (
                                    <div key={i} className="bg-surface p-5 rounded-2xl shadow-sm border border-secondary/10">
                                        <p className="font-bold text-on-surface mb-3 leading-snug">{i + 1}. {q.question}</p>
                                        <details className="group">
                                            <summary className="text-sm text-secondary font-bold cursor-pointer hover:underline list-none flex items-center gap-1 select-none">
                                                <span className="material-symbols-outlined text-sm group-open:rotate-180 transition-transform">expand_more</span>
                                                Reveal Answer
                                            </summary>
                                            <div className="mt-4 pt-4 border-t border-outline-variant/30">
                                                <p className="text-on-surface-variant leading-relaxed text-sm">
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
    );
}
