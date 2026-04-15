"use client";

import { useState, useRef, useEffect } from 'react';
import RecordButton from '@/components/RecordButton';
import ProcessingSteps from '@/components/ProcessingSteps';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';

interface ProcessingLogEntry {
    stage: string;
    status: string;
    error?: string;
}

export default function CapturePage() {
    const [status, setStatus] = useState<'idle' | 'recording' | 'review' | 'uploading' | 'processing' | 'failed'>('idle');
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [contributor, setContributor] = useState("Anonymous");
    const [consent, setConsent] = useState(false);
    const [recordId, setRecordId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [processingLogs, setProcessingLogs] = useState<ProcessingLogEntry[]>([]);
    
    // New states for recording metrics
    const [recordingTime, setRecordingTime] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

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
                const res = await axios.get(`http://localhost:8000/api/status/${recordId}`, {
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
    }, [status, recordId, router]);

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

        try {
            const token = await getToken();
            const uploadRes = await axios.post("http://localhost:8000/api/upload-audio", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "Authorization": `Bearer ${token}`
                },
            });
            const id = uploadRes.data.record_id;
            setRecordId(id);

            await axios.post(`http://localhost:8000/api/process/${id}`, {}, {
                headers: { "Authorization": `Bearer ${token}` }
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
        <div className="min-h-screen pt-32 pb-20 px-6 flex flex-col items-center justify-center max-w-5xl mx-auto text-center w-full">
            {['idle', 'recording', 'review'].includes(status) && (
                <header className="mb-16 space-y-4 max-w-2xl">
                    <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight text-primary">Capture the Oral History</h1>
                    <p className="text-on-surface-variant text-lg leading-relaxed">Your voice is a bridge across generations. Speak freely, and let the ledger record your truth.</p>
                </header>
            )}

            {['uploading', 'processing'].includes(status) && (
                <div className="space-y-6 mb-16">
                    <div className="inline-flex items-center justify-center p-4 bg-surface-container-low rounded-full mb-4">
                        <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>history_edu</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-headline font-extrabold text-on-surface tracking-tight max-w-2xl mx-auto leading-tight">
                        We are carefully analyzing your heritage.
                    </h1>
                    <p className="text-lg text-on-surface-variant font-body max-w-lg mx-auto">
                        Taking a moment to digitize the soul of your story with the dignity it deserves.
                    </p>
                </div>
            )}

            {status === 'failed' && (
                <section className="w-full max-w-2xl animate-in slide-in-from-bottom duration-500">
                    <div className="bg-error-container text-error rounded-2xl border border-error/20 p-8 shadow-[0_20px_40px_rgba(27,28,25,0.06)]">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-error/10 mb-6">
                            <span className="material-symbols-outlined text-4xl">error</span>
                        </div>
                        <h2 className="text-3xl font-headline font-extrabold mb-4">Recording could not be processed</h2>
                        <p className="text-base leading-relaxed mb-8">
                            {error || "It looks like the audio wasn't recorded properly or was empty. Please try recording again."}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={resetCaptureFlow}
                                className="px-8 py-4 rounded-full bg-gradient-to-br from-primary to-primary-container text-on-primary font-headline font-bold shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
                            >
                                Try Recording Again
                            </button>
                            <button
                                onClick={() => setStatus('review')}
                                className="px-8 py-4 rounded-full bg-surface-container-high text-on-surface font-headline font-bold transition-all duration-300 hover:bg-surface-variant"
                            >
                                Review Last Recording
                            </button>
                        </div>
                    </div>
                </section>
            )}

            {error && status !== 'failed' && (
                <div className="bg-error-container text-error p-4 rounded-xl mb-8 border border-error/20 max-w-2xl w-full">
                    {error}
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
                            <div className="absolute -inset-8 -z-10 rounded-full border border-error/30 animate-ping"></div>
                        )}
                    </div>
                    
                    {status === 'recording' ? (
                        <div className="mb-10 text-center animate-pulse">
                            <span className="font-headline font-extrabold text-4xl text-error drop-shadow-md">
                                {formatDuration(recordingTime)}
                            </span>
                            <p className="text-sm font-bold text-error/80 uppercase tracking-widest mt-2 flex items-center justify-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-error"></span> Recording Active
                            </p>
                        </div>
                    ) : (
                        <div className="mb-10 text-center">
                            <p className="font-headline font-semibold text-xl text-secondary italic">
                                "You may speak in any language or dialect."
                            </p>
                            <p className="text-sm text-on-surface-variant/80 mt-2">
                                Supported formats: WebM, OGG (auto-selected)
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-6 w-full max-w-md px-4">
                        <button onClick={startRecording} disabled={status === 'recording'} className={`flex items-center justify-center gap-3 px-8 py-5 rounded-full font-headline font-bold text-lg shadow-lg transition-all duration-300 ${status === 'recording' ? 'bg-surface-dim text-on-surface-variant cursor-not-allowed' : 'bg-gradient-to-br from-primary to-primary-container text-on-primary hover:shadow-xl hover:scale-105 active:scale-95'}`}>
                            <span className="material-symbols-outlined">play_arrow</span>
                            Start
                        </button>
                        <button onClick={stopRecording} disabled={status !== 'recording'} className={`flex items-center justify-center gap-3 px-8 py-5 rounded-full font-headline font-bold text-lg shadow-lg transition-all duration-300 ${status !== 'recording' ? 'bg-surface-dim text-on-surface-variant cursor-not-allowed' : 'bg-secondary text-on-secondary hover:shadow-xl hover:scale-105 active:scale-95'}`}>
                            <span className="material-symbols-outlined">stop</span>
                            Stop
                        </button>
                    </div>
                </section>
            )}

            {status === 'review' && (
                <section className="w-full flex flex-col items-center animate-in slide-in-from-bottom duration-500 max-w-2xl">
                    <audio ref={audioPlayerRef} className="hidden" controls />

                    <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-[0_20px_40px_rgba(27,28,25,0.06)] border border-surface-container text-left w-full mb-8">
                        <h3 className="text-2xl font-bold font-headline text-primary mb-2">Review & Submit</h3>
                        <p className="text-on-surface-variant font-medium mb-8 flex items-center gap-4">
                            <span className="flex items-center gap-1.5 bg-surface px-3 py-1.5 rounded-md border border-surface-container-highest shadow-sm text-sm">
                                <span className="material-symbols-outlined text-sm">timer</span>
                                {formatDuration(recordingTime)}
                            </span>
                            <span className="flex items-center gap-1.5 bg-surface px-3 py-1.5 rounded-md border border-surface-container-highest shadow-sm text-sm">
                                <span className="material-symbols-outlined text-sm">folder_open</span>
                                {audioBlob ? formatFileSize(audioBlob.size) : '0 B'}
                            </span>
                        </p>

                        <div className="mb-6">
                            <label className="block text-sm font-bold text-on-surface-variant mb-2">Contributor Name</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 bg-surface-container-highest rounded-md outline-none focus:ring-2 focus:ring-primary/50 text-on-surface"
                                value={contributor}
                                onChange={(e) => setContributor(e.target.value)}
                            />
                        </div>

                        <div className="mb-8">
                            <label className="flex items-start gap-4 p-4 bg-surface-container-low rounded-lg border border-outline-variant/20 cursor-pointer hover:bg-surface-container transition">
                                <input
                                    type="checkbox"
                                    className="mt-1 w-5 h-5 text-primary rounded border-outline"
                                    checked={consent}
                                    onChange={(e) => setConsent(e.target.checked)}
                                />
                                <span className="text-sm text-on-surface-variant leading-snug">
                                    I confirm that I have obtained necessary consent to share and preserve this cultural knowledge for educational purposes.
                                </span>
                            </label>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">
                        <button onClick={resetCaptureFlow} className="flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-surface-container-high text-on-surface font-headline font-bold hover:bg-surface-variant transition-all duration-300">
                            <span className="material-symbols-outlined">replay</span> Retry
                        </button>
                        <button onClick={playRecording} className="flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-secondary-fixed text-on-secondary-fixed font-headline font-bold shadow-md hover:bg-secondary-container transition-all duration-300 hover:scale-105">
                            <span className="material-symbols-outlined">volume_up</span> Play
                        </button>
                        <button onClick={handleUpload} disabled={!consent} className={`flex items-center justify-center gap-2 px-6 py-4 rounded-full font-headline font-bold shadow-lg transition-all duration-300 ${consent ? 'bg-gradient-to-br from-primary to-primary-container text-on-primary hover:scale-105 active:scale-95' : 'bg-surface-dim text-on-surface-variant cursor-not-allowed'}`}>
                            <span className="material-symbols-outlined">upload</span> Upload
                        </button>
                    </div>
                </section>
            )}

            {['uploading', 'processing'].includes(status) && (
                <div className="w-full">
                    <ProcessingSteps steps={steps.map(step => ({ ...step, status: mapStepStatus(step.status) }))} />
                    <div className="pt-8">
                        <button onClick={() => setStatus('review')} className="px-8 py-3 rounded-full border border-outline-variant/30 text-on-surface-variant font-label font-medium hover:bg-surface-container-high transition-all duration-300 active:scale-95">
                            Cancel Processing
                        </button>
                    </div>
                </div>
            )}

            {['idle', 'recording'].includes(status) && (
                <section className="mt-24 grid md:grid-cols-2 gap-8 w-full max-w-4xl text-left">
                    <div className="bg-surface-container-low p-10 rounded-lg space-y-4">
                        <span className="material-symbols-outlined text-secondary text-4xl">history_edu</span>
                        <h3 className="font-headline font-bold text-2xl text-primary">Preservation Ethics</h3>
                        <p className="text-on-surface-variant leading-relaxed">Every recording is encrypted and stored with cultural sensitivity. You retain full ownership of your story while contributing to the living ledger.</p>
                    </div>
                    <div className="bg-surface-container-low p-10 rounded-lg space-y-4">
                        <span className="material-symbols-outlined text-secondary text-4xl">language</span>
                        <h3 className="font-headline font-bold text-2xl text-primary">Dialect Mapping</h3>
                        <p className="text-on-surface-variant leading-relaxed">Our AI recognizes nuanced linguistic patterns, ensuring your unique phrasing and regional expressions are preserved with absolute accuracy.</p>
                    </div>
                </section>
            )}
        </div>
    );
}
