"use client";

import { LetterGlitch } from "./LetterGlitch";

interface LoadingModalProps {
    message?: string;
}

export function LoadingModal({ message = "Analyzing your prompt..." }: LoadingModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="relative h-56 w-[min(90vw,28rem)] overflow-hidden rounded-2xl border border-[#2D3A3A]/20 shadow-xl">
                <LetterGlitch
                    glitchColors={["#040F0F", "#248232", "#2BA84A", "#2D3A3A", "#FCFFFC"]}
                    glitchSpeed={60}
                    centerVignette={false}
                    outerVignette={false}
                    smooth={true}
                    characters="dvlprDVLPR!@#$&*()-_+=/[]{};:<>.,"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="rounded-xl bg-white/90 px-6 py-4 text-center shadow-lg">
                        <p className="text-sm font-semibold text-[#040F0F]">Working on it</p>
                        <p className="text-xs text-[#2D3A3A]">{message}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
