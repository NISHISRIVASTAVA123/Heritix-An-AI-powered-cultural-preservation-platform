"use client";

import { Player } from '@remotion/player';
import { interpolate, useCurrentFrame } from 'remotion';

// The actual Remotion Composition that renders the video frames programmatically
const PreservationCore = () => {
    const frame = useCurrentFrame();

    // A continuous loop every 3 seconds (90 frames at 30fps)
    const loopDuration = 90;
    const progress = (frame % loopDuration) / loopDuration;

    // Wave 1 interpolations
    const scale1 = interpolate(progress, [0, 1], [0.5, 2.5]);
    const opacity1 = interpolate(progress, [0, 0.5, 1], [1, 0.5, 0]);

    // Wave 2 interpolations (staggered by 50%)
    const progress2 = (progress + 0.5) % 1;
    const scale2 = interpolate(progress2, [0, 1], [0.5, 2.5]);
    const opacity2 = interpolate(progress2, [0, 0.5, 1], [1, 0.5, 0]);

    return (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            {/* Outer Wave 1 */}
            <div style={{
                position: 'absolute',
                width: 100, height: 100,
                borderRadius: '50%',
                backgroundColor: 'rgba(139, 94, 60, 0.25)', // primary Earthy Heritage color
                transform: `scale(${scale1})`,
                opacity: opacity1,
            }} />

            {/* Outer Wave 2 */}
            <div style={{
                position: 'absolute',
                width: 100, height: 100,
                borderRadius: '50%',
                backgroundColor: 'rgba(139, 94, 60, 0.25)',
                transform: `scale(${scale2})`,
                opacity: opacity2,
            }} />

            {/* Core Icon */}
            <div style={{
                position: 'absolute',
                width: 70, height: 70,
                borderRadius: '50%',
                backgroundColor: '#8b5e3c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                zIndex: 10
            }}>
                <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>history_edu</span>
            </div>
        </div>
    );
};

export default function PreservationAnimation() {
    return (
        <div className="w-full h-48 flex items-center justify-center bg-background-light dark:bg-background-dark rounded-xl overflow-hidden relative shadow-sm border border-primary/20">
            {/* Subtle vintage texture background */}
            <div className="absolute inset-0 opacity-10 mix-blend-multiply" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/aged-paper.png")' }}></div>

            {/* Remotion React Player embedding the programmatic video */}
            <Player
                component={PreservationCore}
                durationInFrames={300} // Loops indefinitely anyway
                compositionWidth={600}
                compositionHeight={200}
                fps={30}
                style={{
                    width: '100%',
                    height: '100%',
                }}
                autoPlay
                loop
                controls={false}
            />
        </div>
    );
}
