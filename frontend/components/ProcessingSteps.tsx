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
    return (
        <div className="w-full max-w-2xl mx-auto space-y-6">
            {steps.map((step, index) => (
                <div key={step.id} className="relative flex items-center gap-6">
                    {/* Connecting Line */}
                    {index !== steps.length - 1 && (
                        <div className={`
                            absolute left-6 top-10 bottom-[-24px] w-0.5 
                            ${step.status === 'completed' ? 'bg-secondary' : 'bg-muted'}
                        `} />
                    )}

                    {/* Icon Circle */}
                    <div className={`
                        relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 text-xl transition-all duration-500
                        ${step.status === 'completed' ? 'bg-secondary border-secondary text-white' :
                            step.status === 'processing' ? 'bg-highlight border-highlight text-white animate-pulse' :
                                step.status === 'failed' ? 'bg-red-100 border-red-500 text-red-600' :
                                    'bg-white border-muted text-muted'}
                    `}>
                        {step.status === 'completed' ? '✓' :
                            step.status === 'failed' ? '⚠' :
                                step.status === 'processing' ? '⚡' :
                                    (index + 1)}
                    </div>

                    {/* Text Content */}
                    <div className="flex-1">
                        <h3 className={`font-serif font-bold text-lg ${step.status === 'completed' ? 'text-secondary' :
                                step.status === 'processing' ? 'text-highlight' :
                                    'text-stone-500'
                            }`}>
                            {step.label}
                        </h3>
                        <p className="text-sm text-stone-600">{step.description}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
