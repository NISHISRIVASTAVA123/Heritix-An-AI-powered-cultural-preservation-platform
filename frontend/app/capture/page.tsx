"use client";

import { useState } from 'react';
import AudioRecorder from '@/components/AudioRecorder';
import axios from 'axios';

interface AnalysisResult {
    transcript: string;
    category: string;
    extraction_data: { [key: string]: any };
    education_data: {
        summary: string;
        lesson: string;
        moral: string;
        quiz_questions: { question: string; answer: string }[];
    };
    record?: any;
}

export default function CapturePage() {
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [contributor, setContributor] = useState("Anonymous");
    const [consent, setConsent] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAudioReady = (blob: Blob) => {
        setAudioBlob(blob);
        setError(null);
    };

    const handleUpload = async () => {
        if (!audioBlob) {
            setError("Please record audio first.");
            return;
        }
        if (!consent) {
            setError("You must provide consent to upload.");
            return;
        }

        setIsUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append("file", audioBlob, "recording.wav");
        formData.append("contributor", contributor);
        formData.append("consent", consent.toString());

        try {
            // Assuming backend is running on localhost:8000
            const response = await axios.post("http://localhost:8000/capture/audio", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            setResult(response.data.record);
        } catch (err: any) {
            console.error("Upload failed", err);
            setError(err.response?.data?.detail || "Upload failed. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    const reset = () => {
        setAudioBlob(null);
        setResult(null);
        setError(null);
        setConsent(false);
    };

    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            <h1 className="text-4xl font-serif font-bold text-amber-900 mb-6 text-center">Capture Knowledge</h1>

            {!result ? (
                <div className="space-y-8 animate-in fade-in zoom-in duration-500">
                    <p className="text-center text-stone-600 max-w-xl mx-auto">
                        Record a story, recipe, song, or tradition. Our AI will analyze it, categorize it, and create educational content automatically.
                    </p>

                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-200">
                        <div className="mb-8">
                            <label className="block text-sm font-medium text-stone-700 mb-2">Contributor Name (Optional)</label>
                            <input
                                type="text"
                                value={contributor}
                                onChange={(e) => setContributor(e.target.value)}
                                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                                placeholder="e.g. Grandma Devi"
                            />
                        </div>

                        <AudioRecorder onAudioReady={handleAudioReady} />

                        {audioBlob && (
                            <div className="mt-8 space-y-4">
                                <label className="flex items-center gap-3 p-4 border border-amber-200 bg-amber-50 rounded-lg cursor-pointer hover:bg-amber-100 transition">
                                    <input
                                        type="checkbox"
                                        checked={consent}
                                        onChange={(e) => setConsent(e.target.checked)}
                                        className="w-5 h-5 text-amber-600 rounded focus:ring-amber-500"
                                    />
                                    <span className="text-stone-800 text-sm">
                                        I confirm that I have obtained necessary consent to share and preserve this cultural knowledge.
                                    </span>
                                </label>

                                <button
                                    onClick={handleUpload}
                                    disabled={isUploading || !consent}
                                    className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform hover:scale-[1.02] ${isUploading || !consent
                                            ? "bg-stone-300 text-stone-500 cursor-not-allowed"
                                            : "bg-amber-800 hover:bg-amber-900 text-white"
                                        }`}
                                >
                                    {isUploading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Preserving & Analyzing...
                                        </span>
                                    ) : (
                                        "Archive Knowledge"
                                    )}
                                </button>
                            </div>
                        )}

                        {error && (
                            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg text-center font-medium">
                                {error}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="space-y-8 animate-in slide-in-from-bottom duration-700">
                    <div className="flex justify-between items-center bg-green-50 p-6 rounded-xl border border-green-200">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-2xl">✓</div>
                            <div>
                                <h2 className="text-xl font-bold text-green-800">Knowledge Preserved!</h2>
                                <p className="text-green-700">Successfully categorized as <strong>{result.category}</strong></p>
                            </div>
                        </div>
                        <button onClick={reset} className="text-green-800 underline hover:text-green-900 font-medium">Record Another</button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                            <h3 className="text-lg font-bold text-stone-500 mb-4 uppercase tracking-wider">Raw Transcript</h3>
                            <p className="text-stone-800 leading-relaxed whitespace-pre-wrap font-serif text-lg">
                                {result.transcript}
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-amber-50 p-6 rounded-xl border border-amber-100">
                                <h3 className="text-lg font-bold text-amber-800 mb-2">🎓 Educational Summary</h3>
                                <p className="text-amber-900 mb-4">{result.education_data?.summary}</p>
                                <div className="bg-white/50 p-4 rounded-lg">
                                    <span className="block text-xs font-bold text-amber-600 uppercase mb-1">Lesson</span>
                                    <p className="text-amber-950 font-medium">{result.education_data?.lesson}</p>
                                </div>
                            </div>

                            <div className="bg-stone-100 p-6 rounded-xl border border-stone-200">
                                <h3 className="text-lg font-bold text-stone-700 mb-3">Quiz Time</h3>
                                <div className="space-y-4">
                                    {result.education_data?.quiz_questions?.map((q, i) => (
                                        <div key={i} className="bg-white p-3 rounded-md shadow-sm">
                                            <p className="font-medium text-stone-800 mb-1">{i + 1}. {q.question}</p>
                                            <p className="text-stone-500 text-sm italic">Ans: {q.answer}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
