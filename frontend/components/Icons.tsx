import React from 'react';

export function MandalaIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="0.5">
            <circle cx="100" cy="100" r="95" strokeDasharray="3,3" />
            <circle cx="100" cy="100" r="85" />
            <circle cx="100" cy="100" r="70" strokeDasharray="5,5" />
            <circle cx="100" cy="100" r="50" />
            <circle cx="100" cy="100" r="30" />
            {/* Rays / Petals */}
            {Array.from({ length: 24 }).map((_, i) => {
                const angle = (i * 15 * Math.PI) / 180;
                const x1 = 100 + 30 * Math.cos(angle);
                const y1 = 100 + 30 * Math.sin(angle);
                const x2 = 100 + 95 * Math.cos(angle);
                const y2 = 100 + 95 * Math.sin(angle);
                return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
            })}
            {/* Little circles */}
            {Array.from({ length: 12 }).map((_, i) => {
                const angle = (i * 30 * Math.PI) / 180;
                const x = 100 + 60 * Math.cos(angle);
                const y = 100 + 60 * Math.sin(angle);
                return <circle key={i} cx={x} cy={y} r="4" fill="currentColor" fillOpacity="0.3" />;
            })}
            {/* Outer scalloped loops */}
            {Array.from({ length: 36 }).map((_, i) => {
                const angle = (i * 10 * Math.PI) / 180;
                const x = 100 + 85 * Math.cos(angle);
                const y = 100 + 85 * Math.sin(angle);
                return <circle key={i} cx={x} cy={y} r="2" fill="currentColor" />;
            })}
        </svg>
    );
}

export function LotusIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 100 100" fill="currentColor">
            <path d="M50,15 C45,35 30,45 25,55 C35,55 45,45 50,25 C55,45 65,55 75,55 C70,45 55,35 50,15 Z" />
            <path d="M50,35 C40,50 20,60 10,70 C25,70 40,60 50,45 C60,60 75,70 90,70 C80,60 60,50 50,35 Z" opacity="0.8" />
            <path d="M50,55 C42,68 25,75 5,80 C22,80 38,72 50,62 C62,72 78,80 95,80 C75,75 58,68 50,55 Z" opacity="0.6" />
            <path d="M30,85 C40,88 50,90 50,90 C50,90 60,88 70,85 C58,85 50,87 30,85 Z" />
        </svg>
    );
}
