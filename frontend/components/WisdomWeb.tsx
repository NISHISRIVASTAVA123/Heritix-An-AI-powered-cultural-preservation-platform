"use client";

import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { apiUrl } from '@/lib/api';
import { MandalaIcon, LotusIcon } from '@/components/Icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface StoryNode {
    id: string;
    type: 'story';
    title: string;
    category: string;
    contributor: string;
    summary?: string | { en?: string; hi?: string; native?: string };
    transcript?: string;
    audio_url?: string;
    illustration_url?: string;
    created_at: string;
    motifs: string[];
    // 3D coordinates
    x: number;
    y: number;
    z: number;
    // Projected 2D coordinates
    px?: number;
    py?: number;
    pScale?: number;
}

interface RawRecord {
    _id: string;
    title: string;
    category?: string;
    contributor?: string;
    summary?: string | { en?: string; hi?: string; native?: string };
    transcript?: string;
    audio_url?: string;
    illustration_url?: string;
    created_at: string;
    motifs?: string[];
}

interface MotifNode {
    id: string;
    type: 'motif';
    label: string;
    // 3D coordinates
    x: number;
    y: number;
    z: number;
    // Projected 2D coordinates
    px?: number;
    py?: number;
    pScale?: number;
}

type Node = StoryNode | MotifNode;

interface Link {
    source: string; // Story ID
    target: string; // Motif ID (motif_...)
}

const CATEGORY_COLORS: Record<string, { main: string; glow: string; text: string; bg: string }> = {
    "Folk Medicine": { main: "#ef4444", glow: "rgba(239, 68, 68, 0.4)", text: "text-red-400", bg: "bg-red-950/30" },
    "Agriculture": { main: "#10b981", glow: "rgba(16, 185, 129, 0.4)", text: "text-emerald-400", bg: "bg-emerald-950/30" },
    "Folklore & Stories": { main: "#f59e0b", glow: "rgba(245, 158, 11, 0.4)", text: "text-amber-400", bg: "bg-amber-950/30" },
    "Cultural Rituals": { main: "#8b5cf6", glow: "rgba(139, 92, 246, 0.4)", text: "text-purple-400", bg: "bg-purple-950/30" },
    "Life Advice & Ethics": { main: "#ec4899", glow: "rgba(236, 72, 153, 0.4)", text: "text-pink-400", bg: "bg-pink-950/30" },
    "Uncategorized": { main: "#3b82f6", glow: "rgba(59, 130, 246, 0.4)", text: "text-blue-400", bg: "bg-blue-950/30" }
};

export default function WisdomWeb() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stories, setStories] = useState<StoryNode[]>([]);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [activeMotifStories, setActiveMotifStories] = useState<StoryNode[]>([]);
    const [mouseCoords, setMouseCoords] = useState({ x: 0, y: 0 });
    
    // Audio player states
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioDuration, setAudioDuration] = useState(0);
    const [audioCurrentTime, setAudioCurrentTime] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Canvas references
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    // 3D physics / viewport variables
    const nodesRef = useRef<Node[]>([]);
    const linksRef = useRef<Link[]>([]);
    const rotationRef = useRef({ x: 0, y: 0 });
    const isDraggingRef = useRef(false);
    const lastMousePosRef = useRef({ x: 0, y: 0 });
    const zoomRef = useRef(1.0);
    const hoveredNodeIdRef = useRef<string | null>(null);
    const [hoveredNodeName, setHoveredNodeName] = useState<string | null>(null);

    // Fetch and populate network data
    useEffect(() => {
        async function loadNetwork() {
            try {
                const response = await axios.get(apiUrl('/archive/all'));
                const records = response.data;
                
                // Set story nodes
                const storyNodes: StoryNode[] = [];
                const motifSet = new Set<string>();
                const links: Link[] = [];

                records.forEach((record: RawRecord) => {
                    const motifs = record.motifs || [];
                    
                    // Generate random positions on sphere surface for each story
                    const theta = Math.random() * Math.PI * 2;
                    const phi = Math.acos((Math.random() * 2) - 1);
                    const r = 180 + Math.random() * 40; // Story layer radius

                    const storyNode: StoryNode = {
                        id: record._id,
                        type: 'story',
                        title: record.title,
                        category: record.category || 'Uncategorized',
                        contributor: record.contributor || 'Anonymous',
                        summary: record.summary,
                        transcript: record.transcript,
                        audio_url: record.audio_url,
                        illustration_url: record.illustration_url,
                        created_at: record.created_at,
                        motifs: motifs,
                        x: r * Math.sin(phi) * Math.cos(theta),
                        y: r * Math.sin(phi) * Math.sin(theta),
                        z: r * Math.cos(phi)
                    };

                    storyNodes.push(storyNode);

                    motifs.forEach((m: string) => {
                        motifSet.add(m);
                        links.push({
                            source: record._id,
                            target: `motif_${m}`
                        });
                    });
                });

                // Generate motif nodes placed further outward in a shell
                const motifNodes: MotifNode[] = [];
                const motifsArray = Array.from(motifSet);
                motifsArray.forEach((motif, idx) => {
                    // Golden ratio distribution of points on a sphere for uniform layout
                    const offset = 2 / motifsArray.length;
                    const increment = Math.PI * (3 - Math.sqrt(5));
                    const y = ((idx * offset) - 1) + (offset / 2);
                    const r = Math.sqrt(1 - y * y);
                    const phi = idx * increment;

                    const radius = 280; // Motif shell radius
                    
                    motifNodes.push({
                        id: `motif_${motif}`,
                        type: 'motif',
                        label: motif,
                        x: Math.cos(phi) * r * radius,
                        y: y * radius,
                        z: Math.sin(phi) * r * radius
                    });
                });

                nodesRef.current = [...storyNodes, ...motifNodes];
                linksRef.current = links;
                setStories(storyNodes);
            } catch (err) {
                console.error("Failed to load 3D network: ", err);
                setError("Failed to generate wisdom web.");
            } finally {
                setLoading(false);
            }
        }

        loadNetwork();
    }, []);

    // Selection handlers
    const selectNode = useCallback((node: Node) => {
        setSelectedNode(node);
        setIsPlaying(false);
        if (audioRef.current) {
            audioRef.current.pause();
            setAudioCurrentTime(0);
        }

        if (node.type === 'motif') {
            // Find all stories connected to this motif
            const motifName = node.id.replace('motif_', '');
            const matching = stories.filter(s => s.motifs.includes(motifName));
            setActiveMotifStories(matching);
        }
    }, [stories]);

    // Canvas animation loop and event binding
    useEffect(() => {
        if (loading || error || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        const autoRotateAngleY = 0.001; // slow background rotation

        const resizeCanvas = () => {
            if (!containerRef.current || !canvasRef.current) return;
            const width = containerRef.current.clientWidth;
            const height = containerRef.current.clientHeight;
            
            // Adjust for Retina displays
            const dpr = window.devicePixelRatio || 1;
            canvasRef.current.width = width * dpr;
            canvasRef.current.height = height * dpr;
            canvasRef.current.style.width = `${width}px`;
            canvasRef.current.style.height = `${height}px`;
            ctx.scale(dpr, dpr);
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Core 3D engine projection calculations
        const draw = () => {
            const width = canvas.width / (window.devicePixelRatio || 1);
            const height = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, width, height);

            const fov = 400;
            const cameraDistance = 500 * zoomRef.current;
            const cx = width / 2;
            const cy = height / 2;

            // Combine manual drag rotations with automatic idle orbit
            if (!isDraggingRef.current) {
                rotationRef.current.y += autoRotateAngleY;
            }

            const rotX = rotationRef.current.x;
            const rotY = rotationRef.current.y;

            // Dynamic scale factor based on screen height/width to expand coordinates
            const sizeFactor = Math.min(width, height) / 360;

            // Project all 3D points to 2D canvas coordinates
            const nodes = nodesRef.current;
            nodes.forEach(node => {
                const nx = node.x * sizeFactor;
                const ny = node.y * sizeFactor;
                const nz = node.z * sizeFactor;

                // Apply Y-axis rotation (yaw)
                const x1 = nx * Math.cos(rotY) - nz * Math.sin(rotY);
                const z1 = nx * Math.sin(rotY) + nz * Math.cos(rotY);

                // Apply X-axis rotation (pitch)
                const y2 = ny * Math.cos(rotX) - z1 * Math.sin(rotX);
                const z2 = ny * Math.sin(rotX) + z1 * Math.cos(rotX);

                // Perspective projection scale divisor
                const scale = fov / (fov + z2 + cameraDistance);
                node.px = cx + x1 * scale;
                node.py = cy + y2 * scale;
                node.pScale = scale;
            });

            // Handle link drawing (draw lines behind nodes)
            const links = linksRef.current;
            const hoveredId = hoveredNodeIdRef.current;
            let activeLinks: Link[] = [];
            
            if (hoveredId) {
                activeLinks = links.filter(l => l.source === hoveredId || l.target === hoveredId);
            } else if (selectedNode) {
                activeLinks = links.filter(l => l.source === selectedNode.id || l.target === selectedNode.id);
            }

            // 1. Draw Inactive / Dull Lines
            ctx.lineWidth = 0.5;
            ctx.strokeStyle = "rgba(212, 175, 55, 0.04)";
            
            links.forEach(link => {
                const s = nodes.find(n => n.id === link.source);
                const t = nodes.find(n => n.id === link.target);
                
                if (s && t && s.px && s.py && t.px && t.py) {
                    // Check if this link is part of the highlighted selection
                    const isActive = activeLinks.some(al => al.source === link.source && al.target === link.target);
                    if (!isActive) {
                        ctx.beginPath();
                        ctx.moveTo(s.px, s.py);
                        ctx.lineTo(t.px, t.py);
                        ctx.stroke();
                    }
                }
            });

            // 2. Draw Highlighted / Active Lines
            if (activeLinks.length > 0) {
                ctx.lineWidth = 1.5;
                
                activeLinks.forEach(link => {
                    const s = nodes.find(n => n.id === link.source);
                    const t = nodes.find(n => n.id === link.target);
                    
                    if (s && t && s.px && s.py && t.px && t.py) {
                        const gradient = ctx.createLinearGradient(s.px, s.py, t.px, t.py);
                        const categoryColor = s.type === 'story' ? (CATEGORY_COLORS[s.category]?.main || "#d4af37") : "#d4af37";
                        
                        gradient.addColorStop(0, categoryColor);
                        gradient.addColorStop(1, "rgba(212, 175, 55, 0.8)"); // Gold motif node glow
                        
                        ctx.strokeStyle = gradient;
                        ctx.beginPath();
                        ctx.moveTo(s.px, s.py);
                        ctx.lineTo(t.px, t.py);
                        ctx.stroke();
                    }
                });
            }

            // Sort nodes by depth (z-index projection) so foreground draws over background
            const sortedNodes = [...nodes].sort((a, b) => {
                const az = a.z * Math.sin(rotX) + (a.x * Math.sin(rotY) + a.z * Math.cos(rotY)) * Math.cos(rotX);
                const bz = b.z * Math.sin(rotX) + (b.x * Math.sin(rotY) + b.z * Math.cos(rotY)) * Math.cos(rotX);
                return bz - az; // Draw deeper nodes first
            });

            const pulseTime = Date.now() / 400;

            // 3. Draw Nodes
            sortedNodes.forEach(node => {
                if (!node.px || !node.py || !node.pScale) return;
                
                const isHovered = hoveredId === node.id;
                const isSelected = selectedNode?.id === node.id;
                const isDimmed = (hoveredId || selectedNode) && !isHovered && !isSelected && 
                    !activeLinks.some(al => al.source === node.id || al.target === node.id);

                const opacity = isDimmed ? 0.15 : 1.0;
                ctx.globalAlpha = opacity;

                if (node.type === 'motif') {
                    // Draw Golden Motif Node (Enlarged)
                    const baseRadius = 11 * node.pScale;
                    const r = isHovered || isSelected ? baseRadius * 1.4 : baseRadius;

                    // Glow halo
                    ctx.beginPath();
                    ctx.arc(node.px, node.py, r * 2.5 + Math.sin(pulseTime) * 3, 0, Math.PI * 2);
                    ctx.fillStyle = "rgba(212, 175, 55, 0.1)";
                    ctx.fill();

                    // Star polygon shape
                    ctx.beginPath();
                    drawStar(ctx, node.px, node.py, 4, r * 1.5, r * 0.6);
                    ctx.fillStyle = "#d4af37";
                    ctx.shadowColor = "#d4af37";
                    ctx.shadowBlur = isHovered || isSelected ? 15 : 4;
                    ctx.fill();
                    ctx.shadowBlur = 0; // reset shadow

                } else {
                    // Draw Story Node (Colored Circle - Enlarged)
                    const baseRadius = 7 * node.pScale;
                    const r = isHovered || isSelected ? baseRadius * 1.4 : baseRadius;
                    const colors = CATEGORY_COLORS[node.category] || CATEGORY_COLORS["Uncategorized"];

                    // Outer pulse ring for selection
                    if (isSelected || isHovered) {
                        ctx.beginPath();
                        ctx.arc(node.px, node.py, r * 2, 0, Math.PI * 2);
                        ctx.strokeStyle = colors.main;
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }

                    ctx.beginPath();
                    ctx.arc(node.px, node.py, r, 0, Math.PI * 2);
                    ctx.fillStyle = colors.main;
                    ctx.shadowColor = colors.main;
                    ctx.shadowBlur = isHovered || isSelected ? 12 : 3;
                    ctx.fill();
                    ctx.shadowBlur = 0;
                }

                // Draw Text labels for motifs (always when not dimmed) and stories (when in front/foreground)
                const z2 = node.z * Math.sin(rotX) + (node.x * Math.sin(rotY) + node.z * Math.cos(rotY)) * Math.cos(rotX);
                const isForeground = z2 < 0; // closer to camera than center of sphere
                const showLabel = isHovered || isSelected || 
                    (node.type === 'motif' && !isDimmed) || 
                    (node.type === 'story' && isForeground && !isDimmed);

                if (showLabel) {
                    ctx.font = isHovered || isSelected ? 'bold 12px sans-serif' : '10px sans-serif';
                    ctx.fillStyle = isHovered || isSelected ? '#d4af37' : 'rgba(250, 245, 236, 0.75)';
                    ctx.textAlign = 'center';
                    
                    const labelText = node.type === 'motif' ? node.label : node.title;
                    const truncateLen = node.type === 'motif' ? 22 : 18;
                    const displayLabel = labelText.length > truncateLen ? `${labelText.substring(0, truncateLen)}...` : labelText;
                    
                    ctx.fillText(displayLabel, node.px, node.py - (node.type === 'motif' ? 16 : 12));
                }

                ctx.globalAlpha = 1.0; // reset alpha
            });

            animationFrameId = requestAnimationFrame(draw);
        };

        draw();

        // Helper star polygon renderer
        function drawStar(context: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) {
            let rot = Math.PI / 2 * 3;
            let x = cx;
            let y = cy;
            const step = Math.PI / spikes;

            context.moveTo(cx, cy - outerRadius);
            for (let i = 0; i < spikes; i++) {
                x = cx + Math.cos(rot) * outerRadius;
                y = cy + Math.sin(rot) * outerRadius;
                context.lineTo(x, y);
                rot += step;

                x = cx + Math.cos(rot) * innerRadius;
                y = cy + Math.sin(rot) * innerRadius;
                context.lineTo(x, y);
                rot += step;
            }
            context.lineTo(cx, cy - outerRadius);
            context.closePath();
        }

        // Pointer event bindings
        const handleMouseDown = (e: MouseEvent) => {
            isDraggingRef.current = true;
            lastMousePosRef.current = { x: e.clientX, y: e.clientY };
        };

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            // Track cursor coordinates
            setMouseCoords({ x: mouseX, y: mouseY });

            if (isDraggingRef.current) {
                // Dragging to rotate
                const dx = e.clientX - lastMousePosRef.current.x;
                const dy = e.clientY - lastMousePosRef.current.y;
                
                rotationRef.current.y += dx * 0.005;
                rotationRef.current.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, rotationRef.current.x + dy * 0.005));
                
                lastMousePosRef.current = { x: e.clientX, y: e.clientY };
            } else {
                // Check hover collision logic
                let foundHoverId: string | null = null;
                let foundHoverName: string | null = null;
                const nodes = nodesRef.current;
                
                for (let i = nodes.length - 1; i >= 0; i--) {
                    const node = nodes[i];
                    if (node.px && node.py && node.pScale) {
                        const dist = Math.hypot(mouseX - node.px, mouseY - node.py);
                        const radius = node.type === 'motif' ? 12 : 7;
                        
                        if (dist < radius + 4) {
                            foundHoverId = node.id;
                            foundHoverName = node.type === 'motif' ? node.label : node.title;
                            break;
                        }
                    }
                }

                if (hoveredNodeIdRef.current !== foundHoverId) {
                    hoveredNodeIdRef.current = foundHoverId;
                    setHoveredNodeName(foundHoverName);
                }
            }
        };

        const handleMouseUp = () => {
            isDraggingRef.current = false;
        };

        const handleMouseLeave = () => {
            isDraggingRef.current = false;
            hoveredNodeIdRef.current = null;
            setHoveredNodeName(null);
        };

        const handleCanvasClick = (e: MouseEvent) => {
            // Click to select node
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            const nodes = nodesRef.current;
            for (let i = nodes.length - 1; i >= 0; i--) {
                const node = nodes[i];
                if (node.px && node.py && node.pScale) {
                    const dist = Math.hypot(mouseX - node.px, mouseY - node.py);
                    const clickRadius = node.type === 'motif' ? 24 : 18;
                    
                    if (dist < clickRadius) {
                        selectNode(node);
                        return;
                    }
                }
            }
        };

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            const zoomDelta = e.deltaY * 0.001;
            zoomRef.current = Math.max(0.4, Math.min(2.0, zoomRef.current + zoomDelta));
        };

        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        canvas.addEventListener('mouseleave', handleMouseLeave);
        canvas.addEventListener('click', handleCanvasClick);
        canvas.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            canvas.removeEventListener('mouseleave', handleMouseLeave);
            canvas.removeEventListener('click', handleCanvasClick);
            canvas.removeEventListener('wheel', handleWheel);
        };
    }, [loading, error, stories, selectNode, selectedNode]);

    // Audio handlers
    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setAudioCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setAudioDuration(audioRef.current.duration);
        }
    };

    const getAudioUrl = (url?: string) => {
        if (!url) return '';
        if (url.includes('/uploads/')) {
            const filename = url.split('/uploads/')[1];
            return apiUrl(`/uploads/${filename}`);
        }
        return url;
    };

    const formatTime = (time: number) => {
        if (isNaN(time)) return "0:00";
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const progressPercent = audioDuration > 0 ? (audioCurrentTime / audioDuration) * 100 : 0;

    return (
        <div ref={containerRef} className="w-full h-full relative flex flex-col lg:flex-row">
            {/* Ambient Background Grid */}
            <div className="absolute inset-0 opacity-[0.035] pointer-events-none bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:24px_24px] z-0"></div>
            
            {/* Visual Header / Instructions Overlay */}
            <div className="absolute top-6 left-6 z-10 space-y-2 pointer-events-none">
                <h3 className="text-indian-gold font-bold tracking-[0.2em] uppercase text-xs font-headline flex items-center gap-2">
                    <span className="animate-pulse w-2 h-2 rounded-full bg-indian-gold inline-block"></span>
                    Semantic Preservations
                </h3>
                <h2 className="text-2xl font-serif text-indian-cream font-bold">Wisdom Constellation</h2>
                <p className="text-indian-cream/60 text-xs max-w-sm hidden md:block">
                    Click and drag to rotate the coordinate sphere. Scroll to zoom in/out. Hover over nodes to highlight connections, and click any node to explore its lineage details.
                </p>
            </div>

            {/* Hover Tooltip Overlay tracking mouse cursor */}
            {hoveredNodeName && (
                <div 
                    className="absolute z-30 pointer-events-none px-3 py-1.5 bg-indian-dark/95 backdrop-blur-md rounded-xl border border-indian-gold/30 text-xs font-bold text-indian-gold flex items-center gap-2 shadow-2xl animate-in fade-in duration-100"
                    style={{
                        left: `${mouseCoords.x + 15}px`,
                        top: `${mouseCoords.y + 15}px`,
                    }}
                >
                    <span className="material-symbols-outlined text-sm">hub</span>
                    {hoveredNodeName}
                </div>
            )}

            {/* Interactive Legend & Info Overlay */}
            <div className="absolute bottom-6 left-6 z-10 p-5 bg-indian-dark/85 backdrop-blur-md rounded-2xl border border-indian-gold/25 shadow-2xl max-w-xs space-y-3 hidden md:block animate-in slide-in-from-bottom duration-500">
                <div className="flex items-center gap-2 border-b border-indian-gold/15 pb-2">
                    <span className="material-symbols-outlined text-indian-gold text-base">info</span>
                    <span className="text-[10px] font-headline font-bold text-indian-gold uppercase tracking-wider">Semantic Connections</span>
                </div>
                <p className="text-[10px] text-indian-cream/60 leading-relaxed font-body">
                    Traditional recordings share deep cultural motifs. Hover over a golden star (motif) or colored circle (story) to highlight conceptual links across India.
                </p>
                <div className="space-y-1.5 pt-1 text-[10px] font-medium font-body text-indian-cream/80">
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-indian-gold shadow-sm animate-pulse"></span>
                        <span>Motif Node (Shared Concept)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]"></span>
                        <span>Folk Medicine cures</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span>
                        <span>Agriculture traditions</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]"></span>
                        <span>Folklore & Legends</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#8b5cf6]"></span>
                        <span>Cultural Rituals</span>
                    </div>
                </div>
            </div>

            {/* Main Interactive Canvas */}
            <div className="flex-grow h-full relative z-0 min-h-[450px]">
                {loading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-indian-cream bg-indian-dark/10 backdrop-blur-sm z-20">
                        <MandalaIcon className="w-20 h-20 text-indian-gold/15 animate-[spin_100s_linear_infinite] mb-4" />
                        <div className="w-10 h-10 border-2 border-indian-gold/20 border-t-indian-gold rounded-full animate-spin"></div>
                        <p className="text-xs font-bold uppercase tracking-widest text-indian-gold/80 mt-4 animate-pulse">Mapping connections...</p>
                    </div>
                )}

                {error && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-indian-cream z-20">
                        <span className="material-symbols-outlined text-5xl text-indian-gold/60 mb-2">error</span>
                        <p className="text-sm font-headline text-indian-cream/80">{error}</p>
                    </div>
                )}

                <canvas ref={canvasRef} className="cursor-grab active:cursor-grabbing block w-full h-full" />
            </div>

            {/* Info Side Drawer Panel - Absolute Slide-over style */}
            <div className={`absolute right-0 top-0 h-full w-full sm:w-[450px] border-l border-indian-gold/15 bg-indian-dark/85 backdrop-blur-2xl flex flex-col z-20 transition-transform duration-300 ease-out shadow-2xl overflow-hidden ${selectedNode ? 'translate-x-0' : 'translate-x-full pointer-events-none'}`}>
                {selectedNode && (
                    <div className="h-full flex flex-col">
                        {/* Drawer Header */}
                        <div className="px-6 py-5 border-b border-indian-gold/15 flex items-center justify-between bg-black/25">
                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-indian-gold border border-indian-gold/30 px-2.5 py-1 rounded bg-indian-gold/5 flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[12px]">{selectedNode.type === 'motif' ? 'star' : 'menu_book'}</span>
                                {selectedNode.type === 'motif' ? 'MOTIF NODE' : 'STORY NODE'}
                            </span>
                            <button 
                                onClick={() => {
                                    setSelectedNode(null);
                                    setIsPlaying(false);
                                    if (audioRef.current) audioRef.current.pause();
                                }} 
                                className="text-indian-cream/55 hover:text-indian-gold hover:bg-white/5 p-1.5 rounded-full transition-colors cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-lg">close</span>
                            </button>
                        </div>

                        {/* Drawer Content */}
                        <div className="flex-grow overflow-y-auto px-6 py-6 space-y-6">
                            {selectedNode.type === 'motif' ? (
                                // --- MOTIF NODE DETAIL VIEW ---
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-indian-gold">
                                            <LotusIcon className="w-5 h-5" />
                                            <h4 className="font-serif text-2xl font-bold tracking-tight">{selectedNode.label}</h4>
                                        </div>
                                        <p className="text-xs text-indian-cream/60 leading-relaxed font-body">
                                            This motif weaves together multiple oral recordings across our repository, capturing cultural logic and intergenerational symbols passed down through communities.
                                        </p>
                                    </div>

                                    {/* Connected Stories */}
                                    <div className="space-y-4">
                                        <h5 className="text-xs font-bold uppercase tracking-widest text-indian-gold/80 border-b border-indian-gold/10 pb-2">Connected Manuscripts ({activeMotifStories.length})</h5>
                                        {activeMotifStories.length === 0 ? (
                                            <p className="text-sm text-indian-cream/50 italic">No connections indexed yet.</p>
                                        ) : (
                                            <div className="space-y-3">
                                                {activeMotifStories.map(story => {
                                                    const color = CATEGORY_COLORS[story.category] || CATEGORY_COLORS["Uncategorized"];
                                                    return (
                                                        <div 
                                                            key={story.id} 
                                                            onClick={() => selectNode(story)}
                                                            className="p-4 bg-black/15 hover:bg-black/35 rounded-xl border border-indian-gold/10 hover:border-indian-gold/30 transition-all duration-300 cursor-pointer group flex items-start gap-3"
                                                        >
                                                            <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0`} style={{ backgroundColor: color.main }}></div>
                                                            <div className="space-y-1 min-w-0">
                                                                <p className="font-headline font-bold text-sm text-indian-cream group-hover:text-indian-gold transition-colors truncate">{story.title}</p>
                                                                <p className="text-[11px] text-indian-cream/50 uppercase tracking-wider">{story.category} • by {story.contributor}</p>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                // --- STORY NODE DETAIL VIEW ---
                                <div className="space-y-6">
                                    {/* Title and Category */}
                                    <div className="space-y-2">
                                        <span className="text-[10px] font-bold tracking-widest text-indian-gold uppercase">{selectedNode.category}</span>
                                        <h4 className="font-serif text-2xl font-bold text-indian-cream leading-tight">{selectedNode.title}</h4>
                                        <p className="text-xs text-indian-cream/60 font-medium">Contributed by {selectedNode.contributor}</p>
                                    </div>

                                    {/* Playback widget if audio exists */}
                                    {selectedNode.audio_url && (
                                        <div className="bg-black/25 rounded-2xl p-4 border border-indian-gold/15 space-y-3">
                                            <audio
                                                ref={audioRef}
                                                src={getAudioUrl(selectedNode.audio_url)}
                                                onTimeUpdate={handleTimeUpdate}
                                                onLoadedMetadata={handleLoadedMetadata}
                                                onEnded={() => setIsPlaying(false)}
                                                onPlay={() => setIsPlaying(true)}
                                                onPause={() => setIsPlaying(false)}
                                                className="hidden"
                                            />
                                            <div className="flex items-center gap-4">
                                                <button 
                                                    onClick={togglePlay}
                                                    className="w-10 h-10 shrink-0 rounded-full bg-gold-gradient text-indian-dark flex items-center justify-center shadow hover:scale-105 active:scale-95 transition-transform duration-300 cursor-pointer"
                                                >
                                                    <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                                                        {isPlaying ? 'pause' : 'play_arrow'}
                                                    </span>
                                                </button>
                                                <div className="flex-grow min-w-0">
                                                    <div className="relative w-full h-1.5 bg-white/10 rounded-full overflow-hidden cursor-pointer" onClick={(e) => {
                                                        if (audioRef.current && audioDuration > 0) {
                                                            const rect = e.currentTarget.getBoundingClientRect();
                                                            const percent = (e.clientX - rect.left) / rect.width;
                                                            audioRef.current.currentTime = percent * audioDuration;
                                                        }
                                                    }}>
                                                        <div className="absolute top-0 left-0 h-full bg-indian-gold rounded-full" style={{ width: `${progressPercent}%` }}></div>
                                                    </div>
                                                    <div className="flex justify-between mt-1 text-[10px] font-bold text-indian-cream/50 tracking-wider">
                                                        <span>{formatTime(audioCurrentTime)}</span>
                                                        <span>{formatTime(audioDuration)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Illustration frame if generated */}
                                    {selectedNode.illustration_url && (
                                        <div className="aspect-video w-full rounded-2xl overflow-hidden border border-indian-gold/15 shadow-inner">
                                            <img src={selectedNode.illustration_url} alt="AI story illustration" className="w-full h-full object-cover" />
                                        </div>
                                    )}

                                    {/* Summary */}
                                    {selectedNode.summary && (
                                        <div className="space-y-2">
                                            <h5 className="text-xs font-bold uppercase tracking-widest text-indian-gold/80 border-b border-indian-gold/10 pb-2">Cultural Summary</h5>
                                            <div className="prose prose-invert text-xs leading-relaxed text-indian-cream/80 prose-p:leading-relaxed">
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                    {typeof selectedNode.summary === 'string' 
                                                         ? selectedNode.summary 
                                                         : (selectedNode.summary.en || selectedNode.summary.native || '')}
                                                </ReactMarkdown>
                                            </div>
                                        </div>
                                    )}

                                    {/* Motifs Tags inside story */}
                                    <div className="space-y-3">
                                        <h5 className="text-xs font-bold uppercase tracking-widest text-indian-gold/80 border-b border-indian-gold/10 pb-2">Associated Motifs</h5>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedNode.motifs.map((motif, i) => (
                                                <span 
                                                    key={i} 
                                                    onClick={() => {
                                                        const node = nodesRef.current.find(n => n.id === `motif_${motif}`);
                                                        if (node) selectNode(node);
                                                    }}
                                                    className="bg-indian-gold/10 hover:bg-indian-gold/25 border border-indian-gold/30 hover:border-indian-gold/60 text-indian-gold text-[10px] font-bold px-3 py-1.5 rounded-full cursor-pointer transition-all duration-300"
                                                >
                                                    #{motif}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Full details link */}
                                    <div className="pt-4 text-center">
                                        <a 
                                            href={`/archive/${selectedNode.id}`}
                                            className="inline-flex items-center justify-center gap-1.5 w-full py-3 bg-white/5 border border-indian-gold/30 hover:border-indian-gold rounded-xl font-headline font-bold text-xs tracking-wider uppercase text-indian-gold hover:bg-white/10 hover:text-indian-cream transition-all duration-300"
                                        >
                                            View Full Manuscript & Quiz
                                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
