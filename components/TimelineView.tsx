import React, { useRef, useEffect, useState } from 'react';
import { Scene } from '../types';
import { GripVertical } from 'lucide-react';

interface TimelineViewProps {
    scenes: Scene[];
    currentPlaybackTime?: number;
    totalDuration?: number;
    onSceneClick: (id: number) => void;
    onTimeChange?: (time: number) => void;
    onReorder?: (start: number, end: number) => void;
    pixelsPerSecond?: number;
}

const TimelineView: React.FC<TimelineViewProps> = ({
    scenes,
    currentPlaybackTime = 0,
    onSceneClick,
    onTimeChange,
    pixelsPerSecond = 40
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [isScrubbing, setIsScrubbing] = useState(false);

    // Calculate total duration for scaling
    const totalDuration = scenes.reduce((acc, s) => acc + (s.duration_est || 5), 0);
    // const PIXELS_PER_SECOND = 40; // Replaced by prop

    // Auto-scroll to current time (only if NOT scrubbing)
    useEffect(() => {
        if (!isScrubbing && containerRef.current && currentPlaybackTime > 0) {
            const scrollPos = currentPlaybackTime * pixelsPerSecond - containerRef.current.clientWidth / 2;
            // Only scroll if playhead is out of view or close to edge? 
            // For now, center it roughly if it moves significantly?
            // Or just simple Centering:
            // containerRef.current.scrollTo({ left: scrollPos, behavior: 'auto' }); 
            // But auto-scroll on every frame is annoying if user wants to look away.
            // Let's scroll only if offscreen.

            const currentScroll = containerRef.current.scrollLeft;
            const width = containerRef.current.clientWidth;
            const playheadPos = currentPlaybackTime * pixelsPerSecond;

            if (playheadPos < currentScroll || playheadPos > currentScroll + width) {
                containerRef.current.scrollTo({ left: scrollPos, behavior: 'smooth' });
            }
        }
    }, [currentPlaybackTime, isScrubbing]);

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsScrubbing(true);
        handleScrub(e);

        const handleMouseMove = (ev: MouseEvent) => handleScrub(ev);
        const handleMouseUp = () => {
            setIsScrubbing(false);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    const handleScrub = (e: React.MouseEvent | MouseEvent) => {
        if (!containerRef.current || !contentRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const scrollLeft = containerRef.current.scrollLeft;

        // Calculate Time
        let time = (scrollLeft + offsetX) / pixelsPerSecond;
        time = Math.max(0, Math.min(time, totalDuration));

        onTimeChange?.(time);
    };

    return (
        <div className="w-full bg-slate-900 border-t border-slate-700 select-none flex flex-col h-full">
            {/* Time Ruler */}
            <div
                className="h-6 bg-slate-800 border-b border-slate-700 flex text-[9px] text-slate-500 overflow-hidden relative cursor-ew-resize shrink-0"
                onMouseDown={handleMouseDown}
            >
                {/* We need to sync ruler scroll with container scroll? 
                   Actually simpler to put ruler INSIDE the scrollable area or sync them.
                   For now, let's make the container the main scrollable area and put ruler inside.
                */}
            </div>

            {/* Tracks Container (Main Scroll) */}
            <div
                ref={containerRef}
                className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar relative bg-slate-950/50"
                onMouseDown={(e) => {
                    // Only trigger scrub if clicking on empty space or ruler area (if integrated)
                    // But if checking children clicks (scene cards), we might want to allow scene selection logic instead.
                    // For now, let's allow scrub on the top layer or if clicking background.
                    if (e.target === containerRef.current || e.target === contentRef.current) {
                        handleMouseDown(e);
                    }
                }}
            >
                <div
                    ref={contentRef}
                    className="flex h-full flex-col min-w-max pb-4 pt-0 relative"
                    style={{ width: Math.max(containerRef.current?.clientWidth || 0, totalDuration * pixelsPerSecond + 400) }}
                >
                    {/* Ruler Inside Wrapper for Scroll Sync */}
                    <div className="h-6 w-full border-b border-white/5 relative mb-2" onMouseDown={handleMouseDown}>
                        {Array.from({ length: Math.ceil(totalDuration / 1) + 1 }).map((_, i) => (
                            i % 5 === 0 && (
                                <div key={i} className="absolute top-0 bottom-0 flex flex-col justify-start border-l border-slate-600 pl-1 h-full select-none pointer-events-none"
                                    style={{ left: i * pixelsPerSecond }}>
                                    <span className="text-[9px] text-slate-500 leading-none mt-1">{i}s</span>
                                </div>
                            )
                        ))}
                        {Array.from({ length: Math.ceil(totalDuration) }).map((_, i) => (
                            i % 5 !== 0 && (
                                <div key={i} className="absolute bottom-0 h-2 border-l border-slate-700"
                                    style={{ left: i * pixelsPerSecond }}></div>
                            )
                        ))}
                    </div>

                    <div className="flex items-center px-4 h-24">
                        {scenes.map((scene, index) => {
                            const width = (scene.duration_est || 5) * pixelsPerSecond;
                            const bgColor = scene.status === 'completed' ? 'bg-indigo-600' :
                                scene.status === 'generating' ? 'bg-indigo-900/50 animate-pulse' :
                                    'bg-slate-700';

                            return (
                                <div
                                    key={scene.id}
                                    className={`relative h-20 rounded-lg border border-white/10 shrink-0 group cursor-pointer transition-all hover:brightness-110 mr-1 overflow-hidden flex flex-col`}
                                    style={{ width: width }}
                                    onClick={(e) => { e.stopPropagation(); onSceneClick(scene.id); }}
                                >
                                    {/* Thumbnail Background */}
                                    {scene.imageUrl && (
                                        <img src={scene.imageUrl} className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity" draggable={false} />
                                    )}

                                    {/* Content Overlay */}
                                    <div className={`relative z-10 flex-1 p-2 flex flex-col justify-between ${bgColor} bg-opacity-40 backdrop-blur-sm`}>
                                        <div className="flex justify-between items-start">
                                            <span className="text-[10px] font-bold text-white bg-black/50 px-1.5 rounded truncate max-w-full">
                                                {index + 1}. {scene.stageLabel}
                                            </span>
                                        </div>
                                        <div className="text-[9px] text-slate-300 bg-black/30 self-start px-1 rounded">
                                            {(scene.duration_est || 5).toFixed(1)}s
                                        </div>
                                    </div>

                                    {/* Drag Handle (Visual only for now) */}
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing z-20">
                                        <GripVertical size={12} className="text-white/80 drop-shadow-md" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Playhead Indicator */}
                    <div
                        className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-50 cursor-ew-resize shadow-[0_0_10px_red] group/head"
                        style={{ left: (currentPlaybackTime * pixelsPerSecond) }}
                        onMouseDown={handleMouseDown}
                    >
                        <div className="absolute -top-0 -left-1.5 w-3 h-3 bg-red-500 transform rotate-45 group-hover/head:scale-125 transition-transform" />
                        <div className="absolute top-0 bottom-0 -left-4 w-8 bg-transparent cursor-ew-resize" /> {/* Hit area */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TimelineView;
