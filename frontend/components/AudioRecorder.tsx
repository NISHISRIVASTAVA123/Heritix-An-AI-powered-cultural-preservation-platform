'use client';

import { useState, useRef } from 'react';
import axios from 'axios';

export default function AudioRecorder() {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [message, setMessage] = useState('');
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            chunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorderRef.current.onstop = async () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                await uploadAudio(blob);
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setMessage("Recording...");
        } catch (err) {
            console.error("Error accessing microphone:", err);
            setMessage("Error accessing microphone.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setIsProcessing(true);
            setMessage("Processing...");
        }
    };

    const uploadAudio = async (blob: Blob) => {
        const formData = new FormData();
        formData.append('file', blob, 'recording.webm');
        formData.append('contributor', 'User'); // In real app, get from auth
        formData.append('consent', 'true');

        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/capture/audio`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setMessage(`Success! Knowledge ID: ${response.data.id}`);
        } catch (error) {
            console.error("Upload failed", error);
            setMessage("Upload failed. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="p-6 bg-stone-100 rounded-lg shadow-inner text-center">
            <h3 className="text-xl mb-4 font-semibold text-stone-800">Share Your Story</h3>
            <div className="flex justify-center gap-4">
                {!isRecording ? (
                    <button
                        onClick={startRecording}
                        disabled={isProcessing}
                        className="bg-amber-700 hover:bg-amber-800 text-white px-6 py-3 rounded-full font-bold transition disabled:opacity-50"
                    >
                        {isProcessing ? 'Processing...' : 'Start Recording'}
                    </button>
                ) : (
                    <button
                        onClick={stopRecording}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-bold transition animate-pulse"
                    >
                        Stop Recording
                    </button>
                )}
            </div>
            {message && <p className="mt-4 text-stone-600 font-medium">{message}</p>}
        </div>
    );
}
