"use client";

import React from 'react';
import GroqCulturalMap from './GroqCulturalMap';

export default function ExploreClient() {
    return (
        <div className="w-full h-full relative flex flex-col">
            <div className="w-full h-full relative flex-grow overflow-hidden">
                <GroqCulturalMap />
            </div>
        </div>
    );
}
