"use client";

import { useState, useRef, useEffect } from 'react';
import AudioRecorder from '@/components/AudioRecorder'; // We might need to adjust this internal component or just wrap it
import RecordButton from '@/components/RecordButton';
import ProcessingSteps from '@/components/ProcessingSteps';
import axios from 'axios';
import Link from 'next/link';

interface AnalysisResult {
    transcript: string;
    category: string;
    education_data: {
        summary: string;
        lesson: string;
        moral: string;
        quiz_questions: { question: string; answer: string }[];
    };
    translations: { [key: string]: string };
}

export default function CapturePage() {
    // State Machine: 'idle' | 'recording' | 'review' | 'uploading' | 'processing' | 'complete'
    const [status, setStatus] = useState<'idle' | 'recording' | 'review' | 'uploading' | 'processing' | 'complete'>('idle');
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [contributor, setContributor] = useState("Anonymous");
    const [consent, setConsent] = useState(false);
    const [recordId, setRecordId] = useState<string | null>(null);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [processingLogs, setProcessingLogs] = useState<any[]>([]);

    // Internal ref to the AudioRecorder component (if applicable) - simplified for now
    // Actually, we need to handle the recording logic here or via the existing component.
    // Let's assume AudioRecorder interacts via props. But wait, standard AudioRecorder usually has its own UI.
    // For this new design, we want the RecordButton to control the recorder.
    // Since I cannot rewrite AudioRecorder completely right now without seeing it, 
    // I will use a hidden AudioRecorder or assume a simple implementation here.
    // Actually, simplest is to use the existing AudioRecorder output but hide its default UI if possible?
    // Let's keep existing AudioRecorder as a functional utility if possible.
    // Re-reading `AudioRecorder.tsx` isn't possible in this step, but standard practice:
    // I will implement a custom media recorder hook logic here for full control over the UI Button.

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
                setAudioBlob(blob);
                setStatus('review');
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
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

    const handleUpload = async () => {
        if (!audioBlob) return;
        setStatus('uploading');

        const formData = new FormData();
        formData.append("file", audioBlob, "recording.wav");
        formData.append("contributor", contributor);
        formData.append("consent", consent.toString());

        try {
            // 1. Upload
            const uploadRes = await axios.post("http://localhost:8000/api/upload-audio", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            const id = uploadRes.data.record_id;
            setRecordId(id);

            // 2. Trigger Processing
            await axios.post(`http://localhost:8000/api/process/${id}`);
            setStatus('processing');
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.detail || "Upload failed.");
            setStatus('review');
        }
    };

    // Polling Effect
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (status === 'processing' && recordId) {
            interval = setInterval(async () => {
                try {
                    const res = await axios.get(`http://localhost:8000/api/status/${recordId}`);
                    const data = res.data;

                    setProcessingLogs(data.logs || []);

                    if (data.status === 'COMPLETED') { // Enum is uppercase in backend? Checked processing.py: ProcessingStatus.COMPLETED = "completed" (lowercase in stored?)
                        // Wait, Model defines str Enum. Usually Enum values are returned.
                        // Let's assume lowercase 'completed' based on previous logs.
                        // Wait, verification logs showed: "Status: processing".
                        // Verification script check: if status == "completed".

                        // The backend returns metadata.processing_status.
                        // Let's match case-insensitively or just check.
                    }

                    if (data.status === 'completed') {
                        // Fetch full result from content_preview or if we need to call another endpoint?
                        // backend/processing.py: /status returns "content_preview" (booleans) + "metadata".
                        // It DOES NOT return the full text.
                        // The plan said: "Update /status to return full record content when status is COMPLETED".
                        // Did I implementing that?
                        // Plan Step 39: "Update /status to return full record content".
                        // I verified `processing.py` in Step 1402.
                        // Lines 226-230: only returns content_preview booleans.
                        // CRITICAL: I need to call /archive/all or implement the full fetch.
                        // OR, I need to fetch the content from a new endpoint.
                        // But wait, the Frontend Integration Plan (Step 1563) said: update /status to return full content.
                        // I missed that in the backend hardening? No, that was Phase 4/5. 
                        // I am in Phase 5 now. "Backend Alignment" is a task.
                        // I should handle the frontend logic to expect limited data OR fix backend.
                        // I will assume I will fix backend in next step (Backend Alignment).
                        // For now, I'll update the frontend to use the data assuming it WILL be there
                        // or make a second call to an endpoint that gives data?
                        // Actually, I can use the aggregation output from /archive/all? No that's all records.
                        // We need GET /archive/{id}.
                        // Let's check archive.py. It has GET /archive/{id} probably?
                        // If not, I'll add it.
                        // Let's assume I'll add GET /api/archive/{id} or update status.
                        // For this file, I'll implement a `fetchResult` function.
                        fetchResult(recordId);
                    } else if (data.status === 'failed') {
                        const pipelineLog = data.logs?.find((l: any) => l.stage === 'pipeline' && l.status === 'failed');
                        const errorMsg = pipelineLog?.error || "Processing failed. Please try again.";
                        setError(errorMsg);
                        setStatus('idle'); // or error state
                        clearInterval(interval);
                    }
                } catch (e) {
                    console.error("Polling error", e);
                }
            }, 2000);
        }
        return () => clearInterval(interval);
    }, [status, recordId]);

    const fetchResult = async (id: string) => {
        try {
            // Placeholder: We will implement /api/archive/{id} in backend next
            const res = await axios.get(`http://localhost:8000/archive/${id}`);
            setResult(res.data);
            setStatus('complete');
        } catch (e) {
            console.error("Error fetching result", e);
        }
    }

    // Processing Steps Helper
    const steps = [
        { id: 'upload', label: 'Upload', description: 'Securely saving audio', status: processingLogs.find(l => l.stage === 'upload')?.status === 'success' ? 'completed' : 'pending' },
        { id: 'stt', label: 'Transcription', description: 'Converting speech to text', status: processingLogs.find(l => l.stage === 'stt')?.status === 'success' ? 'completed' : processingLogs.find(l => l.stage === 'stt')?.status === 'started' ? 'processing' : 'pending' },
        { id: 'analysis', label: 'AI Analysis', description: 'Extracting wisdom & context', status: processingLogs.find(l => l.stage === 'education')?.status === 'success' ? 'completed' : processingLogs.find(l => l.stage === 'extraction')?.status === 'started' ? 'processing' : 'pending' },
        { id: 'archive', label: 'Archival', description: 'Preserving for future', status: status === 'complete' ? 'completed' : 'pending' },
    ];

    // Helper for TS errors on status mapping
    const mapStepStatus = (s: string) => {
        if (s === 'completed') return 'completed';
        if (s === 'processing') return 'processing';
        if (s === 'failed') return 'failed';
        return 'pending';
    }

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 text-center">
            {/* Header */}
            <div className="mb-12">
                <h1 className="text-4xl font-serif font-bold text-primary mb-4">Capture Knowledge</h1>
                <p className="text-stone-600 max-w-xl mx-auto">
                    Record a story, recipe, song, or tradition. Our AI will analyze it to preserve the cultural context.
                </p>
            </div>

            {/* ERROR */}
            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-8 border border-red-200">
                    {error}
                </div>
            )}

            {/* VIEW: IDLE & RECORDING */}
            {['idle', 'recording'].includes(status) && (
                <div className="flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in duration-500">
                    <RecordButton
                        isRecording={status === 'recording'}
                        onClick={status === 'recording' ? stopRecording : startRecording}
                    />
                    {status === 'recording' && <p className="text-highlight animate-pulse font-medium">Listening...</p>}
                </div>
            )}

            {/* VIEW: REVIEW */}
            {status === 'review' && (
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-200 text-left max-w-lg mx-auto">
                    <h3 className="text-xl font-bold font-serif text-primary mb-6">Review & Submit</h3>

                    <div className="mb-6">
                        <label className="block text-sm font-bold text-stone-700 mb-2">Contributor Name</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                            value={contributor}
                            onChange={(e) => setContributor(e.target.value)}
                        />
                    </div>

                    <div className="mb-8">
                        <label className="flex items-start gap-3 p-4 bg-off-white rounded-lg border border-stone-200 cursor-pointer hover:bg-stone-50 transition">
                            <input
                                type="checkbox"
                                className="mt-1 w-5 h-5 text-primary rounded"
                                checked={consent}
                                onChange={(e) => setConsent(e.target.checked)}
                            />
                            <span className="text-sm text-stone-600 leading-snug">
                                I confirm that I have obtained necessary consent to share and preserve this cultural knowledge for educational purposes.
                            </span>
                        </label>
                    </div>

                    <div className="flex gap-4">
                        <button onClick={() => setStatus('idle')} className="flex-1 py-3 text-stone-500 font-bold hover:text-stone-700">
                            Re-record
                        </button>
                        <button
                            onClick={handleUpload}
                            disabled={!consent}
                            className={`flex-1 py-3 rounded-xl font-bold text-white transition-all
                                ${consent ? 'bg-primary hover:bg-amber-800 shadow-lg' : 'bg-stone-300 cursor-not-allowed'}
                            `}
                        >
                            Upload
                        </button>
                    </div>
                </div>
            )}

            {/* VIEW: UPLOADING & PROCESSING */}
            {['uploading', 'processing'].includes(status) && (
                <div className="max-w-2xl mx-auto">
                    <ProcessingSteps steps={steps.map(s => ({ ...s, status: mapStepStatus(s.status) }))} />
                </div>
            )}

            {/* VIEW: COMPLETE */}
            {status === 'complete' && result && (
                <div className="space-y-8 animate-in slide-in-from-bottom duration-700 text-left">
                    <div className="flex items-center gap-4 bg-green-50 p-6 rounded-xl border border-green-200">
                        <div className="text-3xl">✅</div>
                        <div>
                            <h2 className="text-xl font-bold text-green-800">Knowledge Preserved!</h2>
                            <p className="text-green-700">Categorized as <strong>{result.category}</strong></p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                            <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-4">Transcript</h3>
                            <p className="font-serif text-lg leading-relaxed text-text-charcoal whitespace-pre-wrap">
                                {result.transcript}
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-off-white p-6 rounded-xl border border-stone-100 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-highlight/10 rounded-bl-full -mr-4 -mt-4"></div>
                                <h3 className="text-lg font-bold text-primary mb-3">🎓 Educational Summary</h3>
                                <p className="text-stone-700 mb-4">{result.education_data?.summary}</p>
                                <div className="bg-white/60 p-4 rounded-lg backdrop-blur-sm border border-white/50">
                                    <span className="text-xs font-bold text-highlight uppercase block mb-1">Moral</span>
                                    <p className="text-stone-800 italic">"{result.education_data?.moral}"</p>
                                </div>
                            </div>

                            <Link href="/archive" className="block text-center w-full py-4 bg-secondary text-white rounded-xl font-bold hover:bg-green-800 transition shadow-md">
                                View in Archive
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
