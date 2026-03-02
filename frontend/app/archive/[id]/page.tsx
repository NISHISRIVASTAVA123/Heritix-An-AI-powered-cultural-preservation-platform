"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface RecordDetail {
    _id: string;
    title: string;
    category: string;
    contributor: string;
    transcript: string;
    audio_url?: string;
    created_at: string;
    processing_status: string;
    education_data?: {
        summary: string;
        lesson: string;
        moral: string;
        quiz_questions: { question: string; answer: string }[];
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
    const [activeTab, setActiveTab] = useState<'transcript' | 'context' | 'translations'>('transcript');

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
                <p className="text-stone-500 font-serif">Uncovering knowledge...</p>
            </div>
        );
    }

    if (error || !record) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-stone-600 mb-4">Record Not Found</h2>
                <Link href="/archive" className="text-primary hover:underline">← Back to Archive</Link>
            </div>
        );
    }

    const isFolkMedicine = record.category === 'Folk Medicine';

    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            <Link href="/archive" className="inline-block mb-8 text-stone-500 hover:text-primary transition-colors">
                ← Back to Archive
            </Link>

            {/* Header Section */}
            <header className="mb-10 text-center md:text-left">
                <div className="flex flex-wrap gap-3 mb-4 justify-center md:justify-start">
                    <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold uppercase rounded-full tracking-wide">
                        {record.category}
                    </span>
                    <span className="px-3 py-1 bg-stone-100 text-stone-500 text-xs font-bold uppercase rounded-full tracking-wide">
                        {new Date(record.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
                    </span>
                </div>

                <h1 className="text-4xl md:text-5xl font-serif font-bold text-text-charcoal mb-4 leading-tight">
                    {record.title}
                </h1>

                <p className="text-lg text-stone-600 flex items-center justify-center md:justify-start gap-2">
                    <span className="text-2xl">👤</span>
                    Contributed by <span className="font-bold text-primary">{record.contributor}</span>
                </p>
            </header>

            {/* Audio Player */}
            {record.audio_url && (
                <div className="bg-stone-900 text-white p-6 rounded-2xl shadow-xl mb-12">
                    <div className="flex items-center gap-4 mb-4">
                        <span className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-xl">🔊</span>
                        <div>
                            <h3 className="font-bold text-white/90">Original Recording</h3>
                            <p className="text-sm text-white/60">Listen to the authentic voice</p>
                        </div>
                    </div>
                    <audio controls src={record.audio_url} className="w-full h-10 accent-primary" />
                </div>
            )}

            {/* Folk Medicine Warning */}
            {isFolkMedicine && (
                <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-xl mb-10 flex gap-4">
                    <span className="text-2xl">⚠️</span>
                    <div>
                        <h4 className="font-bold text-amber-800 mb-1">Cultural Context Disclaimer</h4>
                        <p className="text-amber-900/80 text-sm">
                            This content describes traditional folk medicine practices. It is preserved for cultural and historical awareness only and
                            <strong> should not be considered medical advice.</strong>
                        </p>
                    </div>
                </div>
            )}

            {/* Main Content Grid */}
            <div className="grid md:grid-cols-3 gap-10">

                {/* Left Column: Educational Summary */}
                <div className="md:col-span-1 space-y-8">
                    <div className="bg-off-white p-6 rounded-2xl border border-stone-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-highlight/10 rounded-bl-full -mr-4 -mt-4"></div>
                        <h3 className="font-serif font-bold text-xl text-primary mb-4">At a Glance</h3>
                        <p className="text-stone-700 leading-relaxed mb-6 text-sm">
                            {record.education_data?.summary}
                        </p>

                        {record.education_data?.moral && (
                            <div className="bg-white/60 p-4 rounded-xl border border-white/50">
                                <span className="text-xs font-bold text-highlight uppercase block mb-2">The Moral</span>
                                <p className="text-stone-800 italic font-serif">"{record.education_data?.moral}"</p>
                            </div>
                        )}
                    </div>

                    {record.education_data?.lesson && (
                        <div className="p-6 border border-secondary/20 rounded-2xl bg-secondary/5">
                            <h3 className="font-bold text-secondary mb-2 flex items-center gap-2">
                                <span>🎓</span> Lesson
                            </h3>
                            <p className="text-stone-700 text-sm">{record.education_data?.lesson}</p>
                        </div>
                    )}
                </div>

                {/* Right Column: Dynamic Tabs */}
                <div className="md:col-span-2">
                    <div className="flex gap-6 border-b border-stone-200 mb-6">
                        <button
                            onClick={() => setActiveTab('transcript')}
                            className={`pb-3 font-bold transition-all ${activeTab === 'transcript' ? 'text-primary border-b-2 border-primary' : 'text-stone-400 hover:text-stone-600'}`}
                        >
                            Transcript
                        </button>
                        <button
                            onClick={() => setActiveTab('context')}
                            className={`pb-3 font-bold transition-all ${activeTab === 'context' ? 'text-primary border-b-2 border-primary' : 'text-stone-400 hover:text-stone-600'}`}
                        >
                            Cultural Context
                        </button>
                        {record.translations && Object.keys(record.translations).length > 0 && (
                            <button
                                onClick={() => setActiveTab('translations')}
                                className={`pb-3 font-bold transition-all ${activeTab === 'translations' ? 'text-primary border-b-2 border-primary' : 'text-stone-400 hover:text-stone-600'}`}
                            >
                                Translations
                            </button>
                        )}
                    </div>

                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {activeTab === 'transcript' && (
                            <div className="prose prose-stone max-w-none">
                                <p className="whitespace-pre-wrap leading-relaxed text-lg font-serif text-text-charcoal">
                                    {record.transcript}
                                </p>
                            </div>
                        )}

                        {activeTab === 'context' && (
                            <div className="space-y-6">
                                <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
                                    <h3 className="font-serif font-bold text-lg mb-3">Cultural Significance</h3>
                                    <p className="text-stone-700 leading-relaxed">
                                        {record.context_data?.cultural_context || "No specific cultural context analysis available for this record."}
                                    </p>
                                </div>

                                {record.context_data?.entities && record.context_data.entities.length > 0 && (
                                    <div>
                                        <h4 className="font-bold text-stone-500 uppercase text-xs tracking-wider mb-3">Key Concepts & Entities</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {record.context_data.entities.map((entity, i) => (
                                                <span key={i} className="px-3 py-1 bg-stone-100 text-stone-600 rounded-md text-sm border border-stone-200">
                                                    {entity}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'translations' && record.translations && (
                            <div className="space-y-6">
                                {Object.entries(record.translations).map(([lang, text]) => (
                                    <div key={lang} className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
                                        <h4 className="font-bold text-stone-400 uppercase tracking-widest text-xs mb-4 border-b border-stone-100 pb-2">
                                            {lang === 'hi' ? 'Hindi / हिंदी' : lang === 'es' ? 'Spanish / Español' : lang}
                                        </h4>
                                        <p className="whitespace-pre-wrap leading-relaxed text-stone-700 font-serif">
                                            {text}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Quiz Section (Bottom) */}
                    {record.education_data?.quiz_questions && activeTab === 'context' && (
                        <div className="mt-12 bg-stone-50 p-8 rounded-2xl border border-stone-200">
                            <h3 className="font-serif font-bold text-xl text-stone-800 mb-6">Test Your Knowledge</h3>
                            <div className="space-y-4">
                                {record.education_data.quiz_questions.map((q, i) => (
                                    <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-stone-200">
                                        <p className="font-bold text-stone-800 mb-2">{i + 1}. {q.question}</p>
                                        <details className="group">
                                            <summary className="text-sm text-primary font-bold cursor-pointer hover:underline list-none">
                                                Reveal Answer
                                            </summary>
                                            <p className="mt-2 text-stone-600 pl-4 border-l-2 border-primary/50 italic">
                                                {q.answer}
                                            </p>
                                        </details>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
