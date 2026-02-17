"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LetterGlitch } from "./LetterGlitch";
import { Code2, Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { onAuthChange, signOut } from "@/lib/auth/client";

const HeaderSmall = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthChange((user) => setUserEmail(user?.email ?? null));
        return unsubscribe;
    }, []);

    useEffect(() => {
        if (!menuOpen) {
            document.body.style.overflow = "";
            return;
        }

        document.body.style.overflow = "hidden";
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setMenuOpen(false);
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => {
            document.body.style.overflow = "";
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [menuOpen]);

    const logout = async () => {
        await signOut();
        setMenuOpen(false);
        router.push("/");
    };

    return (
        <>
            <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-xl border-b border-emerald-500/20 shadow-lg transition-all duration-500">
                <div className="absolute inset-0 -z-10 opacity-50">
                    <LetterGlitch
                        glitchColors={["#040F0F", "#248232", "#2BA84A", "#2D3A3A", "#FCFFFC"]}
                        glitchSpeed={50}
                        centerVignette={false}
                        outerVignette={false}
                        smooth={true}
                        characters="dvlprDVLPR!@#$&*()-_+=/[]{};:<>.,"
                    />
                </div>
                <div className="relative z-10 h-16 md:h-20 w-full max-w-7xl mx-auto px-6 flex flex-row items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity group">
                        <div className="bg-[#2BA84A] p-2 rounded-lg text-[#FCFFFC] shadow-md shadow-[#2BA84A]/30">
                            <Code2 className="h-5 w-5" />
                        </div>
                        <h1 className="text-xl font-bold text-[#FCFFFC] tracking-tight">
                            Prompt Coach by <span className="font-mono text-xl font-bold leading-none tracking-tighter text-bright-green">
                                <span className="group-hover:underline">dvlpr</span><span className="animate-pulse">&gt;_</span>
                            </span>
                        </h1>
                    </Link>

                    <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-md border border-white/20 bg-black/30 p-2 text-white hover:bg-black/50"
                        aria-label={menuOpen ? "Close menu" : "Open menu"}
                        aria-expanded={menuOpen}
                        aria-controls="primary-nav"
                        onClick={() => setMenuOpen((v) => !v)}
                    >
                        {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </header>

            {menuOpen && (
                <div className="fixed inset-0 z-60 overflow-hidden" aria-hidden={!menuOpen}>
                    <button
                        type="button"
                        className="absolute inset-0 bg-black/25 backdrop-blur-md"
                        aria-label="Close menu overlay"
                        onClick={() => setMenuOpen(false)}
                    />

                    <nav
                        id="primary-nav"
                        className="absolute right-0 top-0 h-full w-[min(90vw,22rem)] bg-white shadow-2xl border-l border-[#2D3A3A]/15 p-6"
                    >
                        <div className="flex items-center justify-between border-b border-[#2D3A3A]/15 pb-4">
                            <h2 className="text-sm font-semibold uppercase tracking-wide text-[#2D3A3A]">Navigation</h2>
                            <button
                                type="button"
                                className="inline-flex items-center justify-center rounded-md border border-[#2D3A3A]/20 p-2 text-[#2D3A3A] hover:bg-[#2D3A3A]/5"
                                aria-label="Close menu"
                                onClick={() => setMenuOpen(false)}
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <ul className="space-y-4 text-base text-[#040F0F] pt-6">
                            <li>
                                <Link href="/#recent-prompts" onClick={() => setMenuOpen(false)} className="hover:text-[#248232]">
                                    Recent Prompts
                                </Link>
                            </li>
                            <li>
                                <Link href="/" onClick={() => setMenuOpen(false)} className="hover:text-[#248232]">
                                    Enhancer
                                </Link>
                            </li>
                            {userEmail && (
                                <li>
                                    <Link href="/search" onClick={() => setMenuOpen(false)} className="hover:text-[#248232]">
                                        Search
                                    </Link>
                                </li>
                            )}
                            {!userEmail && (
                                <li>
                                    <Link href="/auth?returnTo=/" onClick={() => setMenuOpen(false)} className="hover:text-[#248232]">
                                        Login/Register
                                    </Link>
                                </li>
                            )}
                            {userEmail && (
                                <>
                                    <li className="text-sm text-[#2D3A3A] break-all">Account: {userEmail}</li>
                                    <li>
                                        <button
                                            type="button"
                                            onClick={logout}
                                            className="hover:text-[#248232]"
                                        >
                                            Logout
                                        </button>
                                    </li>
                                </>
                            )}
                        </ul>
                    </nav>
                </div>
            )}
        </>
    );
};
export { HeaderSmall };
