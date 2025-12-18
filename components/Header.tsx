"use client";

import Link from 'next/link';
import { Code2 } from 'lucide-react';

export function Header() {
    return (
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
                    <div className="bg-blue-600 p-2 rounded-lg text-white">
                        <Code2 className="h-5 w-5" />
                    </div>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                        Prompt Coach <span className="text-slate-400 font-normal">for Coding</span>
                    </h1>
                </Link>
            </div>
        </header>
    );
}
