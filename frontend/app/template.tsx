"use client";

import { motion } from "framer-motion";

export default function Template({ children }: { children: React.ReactNode }) {
    return (
        <div style={{ perspective: "2500px", display: "flex", flexDirection: "column", flex: 1, width: "100%" }}>
            <motion.div
                initial={{
                    rotateY: -90, // Starts sticking straight out towards the user from the left spine
                    rotateX: 2,   // Slight curling bend
                    z: 200,       // Lifted off the stack
                    transformOrigin: "left center",
                    opacity: 0,
                    boxShadow: "50px 0px 50px rgba(0, 0, 0, 0.2)", // Heavy casting shadow while lifted
                }}
                animate={{
                    rotateY: 0,
                    rotateX: 0,
                    z: 0,
                    opacity: 1,
                    boxShadow: "0px 0px 0px rgba(0, 0, 0, 0)", // Shadow resolves as page lands
                }}
                transition={{
                    duration: 0.8,
                    ease: [0.15, 0.85, 0.35, 1] // Custom snappy spring-like paper tension
                }}
                className="flex-1 flex flex-col w-full h-full bg-background-light dark:bg-background-dark origin-left z-10 relative overflow-hidden"
                style={{
                    transformStyle: "preserve-3d",
                    willChange: "transform",
                }}
            >
                {/* Book spine shading illusion */}
                <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-black/5 dark:from-black/40 to-transparent pointer-events-none z-50 mix-blend-multiply"></div>
                {children}
            </motion.div>
        </div>
    );
}
