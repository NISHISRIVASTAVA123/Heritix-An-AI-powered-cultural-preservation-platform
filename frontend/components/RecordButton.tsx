"use client";

import React from 'react';

interface RecordButtonProps {
    isRecording: boolean;
    onClick: () => void;
    disabled?: boolean;
}

export default function RecordButton({ isRecording, onClick, disabled }: RecordButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
                relative group flex flex-col items-center justify-center
                w-48 h-48 rounded-full transition-all duration-300
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
                ${isRecording ? 'bg-red-600 shadow-red-900/50' : 'bg-primary shadow-primary/50'}
                text-white font-serif shadow-2xl border-4 border-white/20
            `}
        >
            {/* Pulsing Ring Animation when recording */}
            {isRecording && (
                <span className="absolute w-full h-full rounded-full bg-red-600 opacity-75 animate-ping"></span>
            )}

            {/* Icon */}
            <div className={`relative z-10 text-5xl mb-2 transition-transform ${isRecording ? 'scale-110' : ''}`}>
                {isRecording ? '⏹' : '🎙'}
            </div>

            {/* Label */}
            <span className="relative z-10 text-lg font-semibold tracking-wide uppercase">
                {isRecording ? 'Stop Recording' : 'Start Recording'}
            </span>
        </button>
    );
}
