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
        <div className="flex flex-col items-center gap-4 p-6 border-2 border-dashed border-stone-300 rounded-xl bg-stone-50">
            <div className="flex gap-4">
                {!isRecording ? (
                    <button
                        onClick={startRecording}
                        className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-semibold transition-all shadow-md"
                    >
                        <span className="w-3 h-3 bg-white rounded-full animate-pulse" />
                        Start Recording
                    </button>
                ) : (
                    <button
                        onClick={stopRecording}
                        className="flex items-center gap-2 px-6 py-3 bg-stone-800 hover:bg-stone-900 text-white rounded-full font-semibold transition-all shadow-md"
                    >
                        <div className="w-3 h-3 bg-white rounded-sm" />
                        Stop Recording
                    </button>
                )}
            </div>

            {isRecording && (
                <div className="text-red-600 font-medium animate-pulse">
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
