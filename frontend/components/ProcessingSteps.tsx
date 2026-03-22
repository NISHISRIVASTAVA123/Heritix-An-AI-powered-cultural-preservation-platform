"use client";

import React from 'react';

interface Step {
    id: string;
    label: string;
    description: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
}

interface ProcessingStepsProps {
    steps: Step[];
}

export default function ProcessingSteps({ steps }: ProcessingStepsProps) {
    const getIcon = (id: string, status: string) => {
        if (status === 'completed') return 'check_circle';
        if (id === 'upload') return 'cloud_upload';
        if (id === 'stt') return 'psychology';
        if (id === 'analysis') return 'auto_awesome';
        if (id === 'archive') return 'history_edu';
        return 'hourglass_empty';
    };

    return (
        <div className="bg-surface-container-lowest p-8 md:p-12 rounded-lg shadow-[0_20px_40px_rgba(27,28,25,0.06)] relative overflow-hidden group max-w-2xl mx-auto">
            {/* Subtle Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50 pointer-events-none"></div>

            <div className="relative z-10 space-y-12">
                {steps.map((step) => {
                    const isCompleted = step.status === 'completed';
                    const isProcessing = step.status === 'processing';
                    const isFailed = step.status === 'failed';
                    const isPending = step.status === 'pending';

                    let iconBg = 'bg-surface-container-highest';
                    let iconColor = 'text-on-surface-variant';
                    if (isCompleted) {
                        iconBg = 'bg-primary';
                        iconColor = 'text-on-primary';
                    } else if (isProcessing) {
                        iconBg = 'bg-primary-container';
                        iconColor = 'text-on-primary';
                    } else if (isFailed) {
                        iconBg = 'bg-error-container';
                        iconColor = 'text-error';
                    }

                    let titleColor = isCompleted || isProcessing ? 'text-on-surface' : 'text-on-surface-variant';
                    if (isCompleted) titleColor = 'text-primary';

                    return (
                        <div key={step.id} className={`flex flex-col md:flex-row items-center gap-6 text-left group/step ${isPending ? 'opacity-50' : ''}`}>
                            <div className={`w-14 h-14 rounded-full ${iconBg} bg-opacity-100 flex items-center justify-center shrink-0 transition-transform duration-500 group-hover/step:scale-110 ${isProcessing ? 'animate-pulse' : ''}`}>
                                <span className={`material-symbols-outlined ${iconColor}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                                    {getIcon(step.id, step.status)}
                                </span>
                            </div>
                            
                            <div className="flex-grow w-full space-y-3">
                                <div className="flex justify-between items-end">
                                    <h3 className={`font-headline font-bold text-xl ${titleColor}`}>{step.label}</h3>
                                    <span className={`text-xs font-label font-semibold tracking-widest uppercase ${isCompleted || isProcessing ? 'text-primary/70' : 'text-on-surface-variant/50'}`}>
                                        {step.status}
                                    </span>
                                </div>
                                <div className="h-3 w-full bg-surface-container rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full relative ${
                                            isCompleted ? 'bg-gradient-to-r from-primary to-primary-container w-full' : 
                                            isProcessing ? 'bg-gradient-to-r from-primary to-primary-container w-[65%]' : 
                                            isFailed ? 'bg-error w-[10%]' :
                                            'bg-transparent w-0'
                                        }`}
                                    >
                                        {isProcessing && <div className="absolute inset-0 bg-white/20 animate-pulse"></div>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
