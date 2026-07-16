"use client";

import { useState, useRef, useEffect } from 'react';
import RecordButton from '@/components/RecordButton';
import ProcessingSteps from '@/components/ProcessingSteps';
import { apiUrl } from '@/lib/api';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { MandalaIcon, LotusIcon } from '@/components/Icons';

const PROMPTS = [
    {
        category: "Festivals & Lore",
        prompt: "What is a traditional festival or local celebration you remember from your childhood, and how was it celebrated differently back then?",
        title: "Traditional Festival Celebrations"
    },
    {
        category: "Folk Medicine & Herbs",
        prompt: "What home remedies or local medicinal plants did your elders use to cure common illnesses like cough, fever, or pain?",
        title: "Folk Medicine and Herbs"
    },
    {
        category: "Family Traditions & Recipes",
        prompt: "Share a special traditional recipe that has been passed down in your family. What are the key ingredients and cultural significance?",
        title: "Traditional Family Recipe"
    },
    {
        category: "Village Life & Legends",
        prompt: "What are the local folk stories, ghost stories, or historical legends that the elders in your village or town used to tell?",
        title: "Local Village Legends"
    },
    {
        category: "Crafts & Lost Art",
        prompt: "Do you know of any traditional crafts, weaving styles, or songs that were common in your youth but are rarely seen today?",
        title: "Traditional Crafts and Songs"
    }
];

interface ProcessingLogEntry {
    stage: string;
    status: string;
    error?: string;
}

export default function CapturePage() {
    const [status, setStatus] = useState<'idle' | 'recording' | 'review' | 'uploading' | 'processing' | 'failed'>('idle');
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [contributor, setContributor] = useState("Anonymous");
    const [state, setState] = useState("");
    const [city, setCity] = useState("");
    const [consent, setConsent] = useState(false);
    const [recordId, setRecordId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [processingLogs, setProcessingLogs] = useState<ProcessingLogEntry[]>([]);
    
    // New states for recording metrics
    const [recordingTime, setRecordingTime] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Companion memory-jogging states
    const [currentPromptIdx, setCurrentPromptIdx] = useState(0);
    const [isSpeakingPrompt, setIsSpeakingPrompt] = useState(false);

    const speakPrompt = (text: string) => {
        if (typeof window === 'undefined' || !window.speechSynthesis) {
            alert("Speech synthesis is not supported in this browser.");
            return;
        }
        
        window.speechSynthesis.cancel();
        
        if (isSpeakingPrompt) {
            setIsSpeakingPrompt(false);
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.lang.includes('IN') || v.name.includes('India'));
        if (preferredVoice) utterance.voice = preferredVoice;
        
        utterance.onend = () => setIsSpeakingPrompt(false);
        utterance.onerror = () => setIsSpeakingPrompt(false);
        
        setIsSpeakingPrompt(true);
        window.speechSynthesis.speak(utterance);
    };

    useEffect(() => {
        return () => {
            if (typeof window !== 'undefined' && window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    const { isSignedIn, isLoaded, getToken } = useAuth();
    const router = useRouter();
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            router.replace('/sign-in?redirect_url=%2Fcapture');
        }
    }, [isLoaded, isSignedIn, router]);

    // Timer effect
    useEffect(() => {
        if (status === 'recording') {
            timerRef.current = setInterval(() => {
                setRecordingTime((prev) => prev + 1);
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [status]);

    const formatDuration = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    // POLLING EFFECT — must live here (before early return) so hooks are always called in the same order
    useEffect(() => {
        if (status !== 'processing' || !recordId) return;

        let cancelled = false;
        const controller = new AbortController();

        const interval = setInterval(async () => {
            if (cancelled) return;
            try {
                const token = await getToken();
                const res = await axios.get(apiUrl(`/api/status/${recordId}`), {
                    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                    signal: controller.signal,
                });
                const data = res.data;

                if (cancelled) return;
                setProcessingLogs(data.logs || []);

                if (data.status?.toLowerCase() === 'completed') {
                    clearInterval(interval);
                    router.push(`/archive/${recordId}`);
                } else if (data.status?.toLowerCase() === 'failed') {
                    const pipelineLog = data.logs?.find((l: any) => l.stage === 'pipeline' && l.status === 'failed');
                    const errorMsg = pipelineLog?.error || "Processing failed. Please try again.";
                    setError(errorMsg);
                    setStatus('review');
                    clearInterval(interval);
                }
            } catch (e: any) {
                if (axios.isCancel(e) || e?.name === 'CanceledError' || e?.code === 'ERR_CANCELED') return;
                console.error("Polling error", e);
            }
        }, 2000);

        return () => {
            cancelled = true;
            clearInterval(interval);
            controller.abort();
        };
    }, [getToken, status, recordId, router]);

    if (!isLoaded || !isSignedIn) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    const validateRecordedAudio = async (blob: Blob) => {
        if (blob.size === 0) {
            throw new Error("The audio recording is empty.");
        }
    };

    const resetCaptureFlow = () => {
        setStatus('idle');
        setAudioBlob(null);
        setRecordId(null);
        setError(null);
        setProcessingLogs([]);
        setConsent(false);
        setState("");
        setCity("");
        setRecordingTime(0);
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Pick the best supported format — browsers don't record real WAV
            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                ? 'audio/webm;codecs=opus'
                : MediaRecorder.isTypeSupported('audio/webm')
                    ? 'audio/webm'
                    : MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')
                        ? 'audio/ogg;codecs=opus'
                        : '';

            const mediaRecorder = mimeType
                ? new MediaRecorder(stream, { mimeType })
                : new MediaRecorder(stream);

            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];
            setRecordingTime(0);

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const actualMime = mediaRecorder.mimeType || 'audio/webm';
                const blob = new Blob(chunksRef.current, { type: actualMime });
                setAudioBlob(blob);
                setStatus('review');
                stream.getTracks().forEach(track => track.stop());
                setError(null);

                void (async () => {
                    try {
                        await validateRecordedAudio(blob);
                        setAudioBlob(blob);
                        setStatus('review');
                    } catch (validationError) {
                        setAudioBlob(null);
                        setStatus('idle');
                        setError(validationError instanceof Error ? validationError.message : "The recording could not be used. Please try again.");
                    }
                })();
            };

            mediaRecorder.start(1000); // chunk every 1s
            setStatus('recording');
            setError(null);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            setError("Could not access microphone. Please ensure permissions are granted.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
    };

    const playRecording = () => {
        if (audioBlob && audioPlayerRef.current) {
            audioPlayerRef.current.src = URL.createObjectURL(audioBlob);
            audioPlayerRef.current.play();
        }
    };

    const handleUpload = async () => {
        if (!audioBlob) return;
        setStatus('uploading');

        // Derive the correct file extension from the blob MIME type
        const mimeType = audioBlob.type || 'audio/webm';
        const ext = mimeType.includes('ogg') ? 'ogg' : mimeType.includes('mp4') ? 'mp4' : 'webm';
        const filename = `recording.${ext}`;

        const formData = new FormData();
        formData.append("file", audioBlob, filename);
        formData.append("contributor", contributor);
        formData.append("consent", consent.toString());
        formData.append("state", state);
        formData.append("city", city);

        try {
            const token = await getToken();
            if (!token) {
                throw new Error("You must be signed in to upload audio.");
            }

            const uploadRes = await axios.post(apiUrl("/api/upload-audio"), formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "Authorization": `Bearer ${token}`,
                },
            });
            const id = uploadRes.data.record_id;
            setRecordId(id);

            await axios.post(apiUrl(`/api/process/${id}`), {}, {
                headers: { "Authorization": `Bearer ${token}` },
            });
            setStatus('processing');
        } catch (err: unknown) {
            console.error(err);
            const uploadError = axios.isAxiosError(err)
                ? err.response?.data?.detail || "Upload failed."
                : err instanceof Error
                    ? err.message
                    : "Upload failed.";
            setError(uploadError);
            setStatus('review');
        }
    };


    const steps = [
        { id: 'upload', label: 'Upload', description: 'Securely saving audio', status: processingLogs.find(log => log.stage === 'upload')?.status === 'success' ? 'completed' : 'pending' },
        { id: 'stt', label: 'Speech to Text', description: 'Converting speech to text', status: processingLogs.find(log => log.stage === 'stt')?.status === 'success' ? 'completed' : processingLogs.find(log => log.stage === 'stt')?.status === 'started' ? 'processing' : 'pending' },
        { id: 'analysis', label: 'Understanding Knowledge', description: 'Extracting wisdom & context', status: processingLogs.find(log => log.stage === 'education')?.status === 'success' ? 'completed' : processingLogs.find(log => log.stage === 'extraction')?.status === 'started' ? 'processing' : 'pending' },
        { id: 'archive', label: 'Preserving Culture', description: 'Preserving for future', status: status === 'processing' && processingLogs.find(log => log.stage === 'pipeline')?.status === 'completed' ? 'completed' : 'pending' },
    ];

    const mapStepStatus = (stepStatus: string) => {
        if (stepStatus === 'completed') return 'completed';
        if (stepStatus === 'processing') return 'processing';
        if (stepStatus === 'failed') return 'failed';
        return 'pending';
    };

    return (
        <div className="w-full min-h-screen bg-indian-emerald bg-indian-pattern text-indian-cream pt-32 pb-20 px-6 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Ambient Mandalas */}
            <MandalaIcon className="absolute left-[-150px] top-[15%] w-[450px] h-[450px] text-indian-cream/15 animate-[spin_200s_linear_infinite] pointer-events-none z-0" />
            <MandalaIcon className="absolute right-[-150px] top-[50%] w-[450px] h-[450px] text-indian-cream/15 animate-[spin_160s_linear_infinite] pointer-events-none z-0" />
            
            <div className="max-w-5xl mx-auto text-center w-full flex flex-col items-center justify-center relative z-10">
                {['idle', 'recording', 'review'].includes(status) && (
                    <header className="mb-16 space-y-4 max-w-2xl">
                        <h1 className="font-serif text-4xl md:text-5xl font-extrabold tracking-tight text-gold-gradient">Capture the Oral History</h1>
                        <p className="text-indian-bronze text-lg leading-relaxed">Your voice is a bridge across generations. Speak freely, and let the ledger record your truth.</p>
                    </header>
                )}

                {['uploading', 'processing'].includes(status) && (
                    <div className="space-y-6 mb-16">
                        <div className="inline-flex items-center justify-center p-4 bg-indian-dark/30 border border-indian-gold/20 rounded-full mb-4 shadow-emerald-glow">
                            <span className="material-symbols-outlined text-indian-gold text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>history_edu</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-serif font-extrabold text-gold-gradient tracking-tight max-w-2xl mx-auto leading-tight">
                            We are carefully analyzing your heritage.
                        </h1>
                        <p className="text-lg text-indian-bronze font-body max-w-lg mx-auto">
                            Taking a moment to digitize the soul of your story with the dignity it deserves.
                        </p>
                    </div>
                )}

                {status === 'failed' && (
                    <section className="w-full max-w-2xl animate-in slide-in-from-bottom duration-500">
                        <div className="bg-red-950/20 text-red-300 rounded-2xl border border-red-500/20 p-8 shadow-[0_20px_40px_rgba(0,0,0,0.15)]">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-6">
                                <span className="material-symbols-outlined text-4xl text-red-400">error</span>
                            </div>
                            <h2 className="text-3xl font-serif font-extrabold mb-4">Recording could not be processed</h2>
                            <p className="text-base leading-relaxed mb-8">
                                {error || "It looks like the audio wasn't recorded properly or was empty. Please try recording again."}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button
                                    onClick={resetCaptureFlow}
                                    className="px-8 py-4 rounded-full bg-gradient-to-br from-indian-emerald to-indian-emerald/80 text-indian-cream border border-indian-gold/30 font-headline font-bold shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
                                >
                                    Try Recording Again
                                </button>
                                <button
                                    onClick={() => setStatus('review')}
                                    className="px-8 py-4 rounded-full bg-indian-dark/40 border border-indian-gold/20 text-indian-cream font-headline font-bold transition-all duration-300 hover:bg-indian-dark/60"
                                >
                                    Review Last Recording
                                </button>
                            </div>
                        </div>
                    </section>
                )}

                {error && status !== 'failed' && (
                    <div className="bg-red-950/20 text-red-300 p-4 rounded-xl mb-8 border border-red-500/20 max-w-2xl w-full">
                        {error}
                    </div>
                )}

                {/* Cultural Companion Card for inspiration */}
                {status === 'idle' && (
                    <div className="w-full max-w-2xl bg-indian-dark/30 border border-indian-gold/20 backdrop-blur-md p-6 md:p-8 rounded-[2rem] shadow-wine-glow mb-12 text-left relative overflow-hidden group animate-in slide-in-from-bottom duration-500">
                        <div className="absolute -right-12 -top-12 w-32 h-32 bg-indian-gold/5 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700"></div>
                        
                        <div className="flex items-center justify-between mb-6 relative z-10">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-indian-gold p-2 bg-indian-gold/10 rounded-xl">auto_stories</span>
                                <h3 className="font-headline text-xl font-bold text-gold-gradient">Cultural Memory Companion</h3>
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-indian-gold/10 text-indian-gold border border-indian-gold/20">
                                {PROMPTS[currentPromptIdx].category}
                            </span>
                        </div>

                        <p className="text-lg text-indian-cream font-serif leading-relaxed mb-6 italic relative z-10 pl-4 border-l-2 border-indian-gold">
                            "{PROMPTS[currentPromptIdx].prompt}"
                        </p>

                        <div className="flex items-center gap-3 relative z-10 flex-wrap">
                            <button
                                onClick={() => speakPrompt(PROMPTS[currentPromptIdx].prompt)}
                                className="px-4 py-2.5 rounded-full bg-indian-gold/10 hover:bg-indian-gold/20 border border-indian-gold/30 text-indian-gold font-headline font-bold text-xs uppercase tracking-widest flex items-center gap-2 cursor-pointer transition-colors duration-300"
                            >
                                <span className="material-symbols-outlined text-sm">{isSpeakingPrompt ? 'volume_off' : 'volume_up'}</span>
                                {isSpeakingPrompt ? 'Stop speaking' : 'Listen Prompt'}
                            </button>
                            
                            <button
                                onClick={() => {
                                    if (typeof window !== 'undefined' && window.speechSynthesis) {
                                        window.speechSynthesis.cancel();
                                    }
                                    setIsSpeakingPrompt(false);
                                    setCurrentPromptIdx((prev) => (prev + 1) % PROMPTS.length);
                                }}
                                className="px-4 py-2.5 rounded-full bg-transparent hover:bg-white/5 border border-indian-cream/20 text-indian-cream/80 hover:text-indian-cream font-headline font-bold text-xs uppercase tracking-widest flex items-center gap-1.5 cursor-pointer transition-colors duration-300 ml-auto"
                            >
                                Next prompt
                                <span className="material-symbols-outlined text-sm">navigate_next</span>
                            </button>
                        </div>
                    </div>
                )}

                {['idle', 'recording'].includes(status) && (
                    <section className="w-full flex flex-col items-center animate-in fade-in zoom-in duration-500">
                        <div className="relative mb-8">
                            <RecordButton
                                isRecording={status === 'recording'}
                                onClick={status === 'recording' ? stopRecording : startRecording}
                            />
                            {/* Recording metrics ring */}
                            {status === 'recording' && (
                                <div className="absolute -inset-8 -z-10 rounded-full border border-red-500/30 animate-ping"></div>
                            )}
                        </div>
                        
                        {status === 'recording' ? (
                            <div className="mb-10 text-center animate-pulse">
                                <span className="font-headline font-extrabold text-4xl text-red-400 drop-shadow-md">
                                    {formatDuration(recordingTime)}
                                </span>
                                <p className="text-sm font-bold text-red-400 uppercase tracking-widest mt-2 flex items-center justify-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span> Recording Active
                                </p>
                            </div>
                        ) : (
                            <div className="mb-10 text-center">
                                <p className="font-serif italic font-semibold text-xl text-indian-gold">
                                    "You may speak in any language or dialect."
                                </p>
                                <p className="text-sm text-indian-bronze/80 mt-2">
                                    Supported formats: WebM, OGG (auto-selected)
                                </p>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-6 w-full max-w-md px-4">
                            <button onClick={startRecording} disabled={status === 'recording'} className={`flex items-center justify-center gap-3 px-8 py-5 rounded-full font-headline font-bold text-lg shadow-lg transition-all duration-300 ${status === 'recording' ? 'bg-indian-dark/30 text-indian-bronze cursor-not-allowed border border-indian-gold/10' : 'bg-gradient-to-br from-indian-emerald to-indian-emerald/80 text-indian-cream border border-indian-gold/30 hover:shadow-xl hover:scale-105 active:scale-95'}`}>
                                <span className="material-symbols-outlined text-indian-gold">play_arrow</span>
                                Start
                            </button>
                            <button onClick={stopRecording} disabled={status !== 'recording'} className={`flex items-center justify-center gap-3 px-8 py-5 rounded-full font-headline font-bold text-lg shadow-lg transition-all duration-300 ${status !== 'recording' ? 'bg-indian-dark/30 text-indian-bronze cursor-not-allowed border border-indian-gold/10' : 'bg-indian-terracotta border border-indian-gold/30 text-indian-cream hover:shadow-xl hover:scale-105 active:scale-95'}`}>
                                <span className="material-symbols-outlined">stop</span>
                                Stop
                            </button>
                        </div>
                    </section>
                )}

                {status === 'review' && (
                    <section className="w-full flex flex-col items-center animate-in slide-in-from-bottom duration-500 max-w-2xl">
                        <audio ref={audioPlayerRef} className="hidden" controls />

                        <div className="bg-indian-dark/30 border border-indian-gold/20 backdrop-blur-md p-8 rounded-2xl shadow-emerald-glow text-left w-full mb-8">
                            <h3 className="text-2xl font-bold font-serif text-gold-gradient mb-2">Review & Submit</h3>
                            <p className="text-indian-bronze font-medium mb-8 flex items-center gap-4">
                                <span className="flex items-center gap-1.5 bg-indian-dark/50 px-3 py-1.5 rounded-md border border-indian-gold/20 shadow-sm text-sm">
                                    <span className="material-symbols-outlined text-sm text-indian-gold">timer</span>
                                    {formatDuration(recordingTime)}
                                </span>
                                <span className="flex items-center gap-1.5 bg-indian-dark/50 px-3 py-1.5 rounded-md border border-indian-gold/20 shadow-sm text-sm">
                                    <span className="material-symbols-outlined text-sm text-indian-gold">folder_open</span>
                                    {audioBlob ? formatFileSize(audioBlob.size) : '0 B'}
                                </span>
                            </p>

                            <div className="mb-6">
                                <label className="block text-sm font-bold text-indian-gold mb-2">Contributor Name</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 bg-indian-dark/50 border border-indian-gold/20 rounded-md outline-none focus:ring-2 focus:ring-indian-gold/50 text-indian-cream"
                                    value={contributor}
                                    onChange={(e) => setContributor(e.target.value)}
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-bold text-indian-gold mb-2">State (Associated Region)</label>
                                <input
                                    type="text"
                                    list="states-list"
                                    placeholder="Global / Type or select a state..."
                                    className="w-full px-4 py-3 bg-indian-dark/50 border border-indian-gold/20 rounded-md outline-none focus:ring-2 focus:ring-indian-gold/50 text-indian-cream placeholder:text-indian-bronze/50"
                                    value={state}
                                    onChange={(e) => setState(e.target.value)}
                                />
                                <datalist id="states-list">
                                    <option value="Andhra Pradesh" />
                                    <option value="Arunachal Pradesh" />
                                    <option value="Assam" />
                                    <option value="Bihar" />
                                    <option value="Chhattisgarh" />
                                    <option value="Goa" />
                                    <option value="Gujarat" />
                                    <option value="Haryana" />
                                    <option value="Himachal Pradesh" />
                                    <option value="Jharkhand" />
                                    <option value="Karnataka" />
                                    <option value="Kerala" />
                                    <option value="Madhya Pradesh" />
                                    <option value="Maharashtra" />
                                    <option value="Manipur" />
                                    <option value="Meghalaya" />
                                    <option value="Mizoram" />
                                    <option value="Nagaland" />
                                    <option value="Odisha" />
                                    <option value="Punjab" />
                                    <option value="Rajasthan" />
                                    <option value="Sikkim" />
                                    <option value="Tamil Nadu" />
                                    <option value="Telangana" />
                                    <option value="Tripura" />
                                    <option value="Uttar Pradesh" />
                                    <option value="Uttarakhand" />
                                    <option value="West Bengal" />
                                    <option value="Andaman and Nicobar Islands" />
                                    <option value="Chandigarh" />
                                    <option value="Delhi" />
                                    <option value="Jammu and Kashmir" />
                                    <option value="Ladakh" />
                                </datalist>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-bold text-indian-gold mb-2">City (Associated Region)</label>
                                <input
                                    type="text"
                                    list="cities-list"
                                    placeholder="Type or select a city..."
                                    className="w-full px-4 py-3 bg-indian-dark/50 border border-indian-gold/20 rounded-md outline-none focus:ring-2 focus:ring-indian-gold/50 text-indian-cream placeholder:text-indian-bronze/50"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                />
                                <datalist id="cities-list">
                                    <option value="Mumbai" />
                                    <option value="Delhi" />
                                    <option value="Bengaluru" />
                                    <option value="Hyderabad" />
                                    <option value="Ahmedabad" />
                                    <option value="Chennai" />
                                    <option value="Kolkata" />
                                    <option value="Surat" />
                                    <option value="Pune" />
                                    <option value="Jaipur" />
                                    <option value="Lucknow" />
                                    <option value="Kanpur" />
                                    <option value="Nagpur" />
                                    <option value="Indore" />
                                    <option value="Thane" />
                                    <option value="Bhopal" />
                                    <option value="Visakhapatnam" />
                                    <option value="Patna" />
                                    <option value="Vadodara" />
                                    <option value="Ludhiana" />
                                    <option value="Agra" />
                                    <option value="Nashik" />
                                    <option value="Ranchi" />
                                    <option value="Faridabad" />
                                    <option value="Meerut" />
                                    <option value="Rajkot" />
                                    <option value="Varanasi" />
                                    <option value="Srinagar" />
                                    <option value="Aurangabad" />
                                    <option value="Dhanbad" />
                                    <option value="Amritsar" />
                                    <option value="Allahabad" />
                                    <option value="Guwahati" />
                                    <option value="Chandigarh" />
                                    <option value="Thiruvananthapuram" />
                                    <option value="Bhubaneswar" />
                                </datalist>
                            </div>

                            <div className="mb-8">
                                <label className="flex items-start gap-4 p-4 bg-indian-dark/40 backdrop-blur-md rounded-lg border border-indian-gold/20 cursor-pointer hover:bg-indian-dark/60 hover:border-indian-gold/40 shadow-emerald-glow transition">
                                    <input
                                        type="checkbox"
                                        className="mt-1 w-5 h-5 text-indian-gold rounded border-indian-gold/30 accent-indian-gold focus:ring-indian-gold"
                                        checked={consent}
                                        onChange={(e) => setConsent(e.target.checked)}
                                    />
                                    <span className="text-sm text-indian-bronze leading-snug">
                                        I confirm that I have obtained necessary consent to share and preserve this cultural knowledge for educational purposes.
                                    </span>
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">
                            <button onClick={resetCaptureFlow} className="flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-indian-dark/40 border border-indian-gold/20 text-indian-cream font-headline font-bold hover:bg-indian-dark/60 transition-all duration-300 active:scale-95">
                                <span className="material-symbols-outlined text-indian-gold">replay</span> Retry
                            </button>
                            <button onClick={playRecording} className="flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-transparent border border-indian-gold/40 text-indian-cream font-headline font-bold shadow-md hover:bg-white/5 transition-all duration-300 hover:scale-105 active:scale-95">
                                <span className="material-symbols-outlined text-indian-gold">volume_up</span> Play
                            </button>
                            <button onClick={handleUpload} disabled={!consent} className={`flex items-center justify-center gap-2 px-6 py-4 rounded-full font-headline font-bold shadow-lg transition-all duration-300 ${consent ? 'bg-gold-gradient border border-indian-gold/30 text-indian-dark hover:scale-105 active:scale-95 cursor-pointer' : 'bg-indian-dark/20 border border-indian-gold/10 text-indian-bronze/50 cursor-not-allowed'}`}>
                                <span className="material-symbols-outlined">upload</span> Upload
                            </button>
                        </div>
                    </section>
                )}

                {['uploading', 'processing'].includes(status) && (
                    <div className="w-full">
                        <ProcessingSteps steps={steps.map(step => ({ ...step, status: mapStepStatus(step.status) }))} />
                        <div className="pt-8">
                            <button onClick={() => setStatus('review')} className="px-8 py-3 rounded-full border border-indian-gold/30 text-indian-cream font-label font-medium hover:bg-white/5 transition-all duration-300 active:scale-95">
                                Cancel Processing
                            </button>
                        </div>
                    </div>
                )}

                {['idle', 'recording'].includes(status) && (
                    <section className="mt-24 grid md:grid-cols-2 gap-8 w-full max-w-4xl text-left">
                        <div className="bg-indian-dark/30 border border-indian-gold/15 backdrop-blur-md p-10 rounded-2xl space-y-4 shadow-emerald-glow hover:border-indian-gold/30 hover:bg-indian-dark/40 transition-all duration-300">
                            <span className="material-symbols-outlined text-indian-gold text-4xl">history_edu</span>
                            <h3 className="font-serif font-bold text-2xl text-indian-gold">Preservation Ethics</h3>
                            <p className="text-indian-bronze leading-relaxed">Every recording is encrypted and stored with cultural sensitivity. You retain full ownership of your story while contributing to the living ledger.</p>
                        </div>
                        <div className="bg-indian-dark/30 border border-indian-gold/15 backdrop-blur-md p-10 rounded-2xl space-y-4 shadow-emerald-glow hover:border-indian-gold/30 hover:bg-indian-dark/40 transition-all duration-300">
                            <span className="material-symbols-outlined text-indian-gold text-4xl">language</span>
                            <h3 className="font-serif font-bold text-2xl text-indian-gold">Dialect Mapping</h3>
                            <p className="text-indian-bronze leading-relaxed">Our AI recognizes nuanced linguistic patterns, ensuring your unique phrasing and regional expressions are preserved with absolute accuracy.</p>
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
