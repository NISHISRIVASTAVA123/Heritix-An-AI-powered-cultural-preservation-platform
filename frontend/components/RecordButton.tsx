"use client";

import React from 'react';

interface RecordButtonProps {
    isRecording: boolean;
    onClick: () => void;
    disabled?: boolean;
}

export default function RecordButton({ isRecording, onClick, disabled }: RecordButtonProps) {
    return (
        <div className="relative group mb-8 md:mb-16">
            <div className={`absolute inset-0 rounded-full blur-3xl transition-opacity duration-700
                ${isRecording ? 'bg-error/30 opacity-100 animate-pulse' : 'bg-primary-container/20 opacity-50 group-hover:opacity-100'}
            `}></div>
            <button
                onClick={onClick}
                disabled={disabled}
                className={`relative z-10 w-48 h-48 md:w-64 md:h-64 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500
                    ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
                    ${isRecording ? 'bg-error text-on-error animate-pulse shadow-error/50' : 'bg-gradient-to-br from-primary to-primary-container text-on-primary'}
                `}
                aria-label={isRecording ? 'Stop Recording' : 'Start Recording'}
            >
                <span className="material-symbols-outlined text-7xl md:text-8xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {isRecording ? 'stop' : 'mic'}
                </span>
            </button>
        </div>
    );
}
