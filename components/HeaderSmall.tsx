"use client";

import Link from "next/link";
import { LetterGlitch } from "./LetterGlitch";
import { Code2 } from "lucide-react";
// Note: You may need to install lucide-react: npm install lucide-react
// This component assumes you have Tailwind CSS set up.
const HeaderSmall = () => {
    const scrollTo = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }
    };
    return (
        <header className="z-50 h-16 md:h-20 bg-black/90 backdrop-blur-xl border-b border-emerald-500/20 shadow-lg overflow-hidden transition-all duration-500">
            <div className="absolute inset-0 -z-10 opacity-20">
                <LetterGlitch
                    glitchColors={["#040F0F", "#248232", "#2BA84A", "#2D3A3A", "#FCFFFC"]}
                    glitchSpeed={50}
                    centerVignette={false}
                    outerVignette={false}
                    smooth={true}
                    characters="dvlprDVLPR!@#$&*()-_+=/[]{};:<>.,"
                />
            </div>
            <div className="relative z-10 h-full w-full max-w-7xl mx-auto px-6 flex flex-row items-center justify-between">
                <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
                    <div className="bg-[#2BA84A] p-2 rounded-lg text-[#FCFFFC] shadow-md shadow-[#2BA84A]/30">
                        <Code2 className="h-5 w-5" />
                    </div>
                    <h1 className="text-xl font-bold text-[#FCFFFC] tracking-tight">
                        Prompt Coach by <span className="font-mono text-xl font-bold leading-none tracking-tighter text-bright-green">
                            dvlpr<span className="animate-pulse">&gt;_</span>
                        </span>
                    </h1>
                </Link>
            </div>
        </header>
    );
};
export { HeaderSmall };