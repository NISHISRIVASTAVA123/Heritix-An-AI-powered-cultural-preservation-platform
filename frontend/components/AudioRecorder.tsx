"use client";

import { useState, useRef } from "react";

interface AudioRecorderProps {
    onAudioReady: (audioBlob: Blob) => void;
}

export default function AudioRecorder({ onAudioReady }: AudioRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            chunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: "audio/wav" });
                const url = URL.createObjectURL(blob);
                setAudioUrl(url);
                onAudioReady(blob);
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Could not access microphone. Please ensure permission is granted.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);

            // Stop all tracks to release microphone
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    return (
<<<<<<< HEAD
        <div className="flex flex-col items-center gap-4 p-6 border-2 border-dashed border-stone-300 rounded-xl bg-stone-50">
=======
        <div className="flex flex-col items-center gap-4 p-6 border-2 border-dashed border-outline-variant rounded-xl bg-surface-container-low">
>>>>>>> nishi_20
            <div className="flex gap-4">
                {!isRecording ? (
                    <button
                        onClick={startRecording}
<<<<<<< HEAD
                        className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-semibold transition-all shadow-md"
                    >
                        <span className="w-3 h-3 bg-white rounded-full animate-pulse" />
=======
                        className="flex items-center gap-2 px-6 py-3 bg-error hover:bg-error-container text-on-error hover:text-on-error-container rounded-full font-semibold transition-all shadow-md"
                    >
                        <span className="w-3 h-3 bg-current rounded-full animate-pulse" />
>>>>>>> nishi_20
                        Start Recording
                    </button>
                ) : (
                    <button
                        onClick={stopRecording}
<<<<<<< HEAD
                        className="flex items-center gap-2 px-6 py-3 bg-stone-800 hover:bg-stone-900 text-white rounded-full font-semibold transition-all shadow-md"
                    >
                        <div className="w-3 h-3 bg-white rounded-sm" />
=======
                        className="flex items-center gap-2 px-6 py-3 bg-secondary hover:bg-secondary-container text-on-secondary hover:text-on-secondary-container rounded-full font-semibold transition-all shadow-md"
                    >
                        <div className="w-3 h-3 bg-current rounded-sm" />
>>>>>>> nishi_20
                        Stop Recording
                    </button>
                )}
            </div>

            {isRecording && (
<<<<<<< HEAD
                <div className="text-red-600 font-medium animate-pulse">
=======
                <div className="text-error font-medium animate-pulse">
>>>>>>> nishi_20
                    Recording in progress...
                </div>
            )}

            {audioUrl && !isRecording && (
                <div className="w-full mt-4">
                    <audio controls src={audioUrl} className="w-full" />
                </div>
            )}
        </div>
    );
}
