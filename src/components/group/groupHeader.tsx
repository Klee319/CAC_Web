"use client";
import { useCallback, useEffect, useState } from "react";
import ExportedImage from "next-image-export-optimizer";
import SwitchLightDark from "@/components/main/switchLightDark";

export default function GroupHeader() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    const toggleMenu = useCallback(() => setIsMenuOpen(prev => !prev), []);
    const toggleMode = useCallback(() => setIsDarkMode(prev => !prev), []);

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark-mode');
        } else {
            document.documentElement.classList.remove('dark-mode');
        }
    }, [isDarkMode]);

    const menuItems = ["Programing", "Graphic", "Music", "CG", "Video", "Scenario"];

    return (
        <>
            <header className="fixed w-full top-0 left-0 p-3 shadow-md z-50 header" style={{ paddingTop: 20, paddingBottom: 20 }}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="h-auto w-[100px]">
                            <ExportedImage
                                src="/logo/newCAC.png"
                                alt="C.A.C. logo"
                                width={460}
                                height={192}
                                className="block"
                                style={isDarkMode ? { filter: 'hue-rotate(175deg) brightness(1.11) saturate(1.8)' } : undefined}
                            />
                        </div>
                        <div className="text-1xl font-moon">
                            <SwitchLightDark isDarkMode={isDarkMode} toggleMode={toggleMode} />
                        </div>
                    </div>

                    <div className="xl:hidden">
                        <button onClick={toggleMenu} aria-label="メニューを開く" className="relative z-50 min-w-[44px] min-h-[44px] flex items-center justify-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-8 h-8 hamburger-icon"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
                            </svg>
                        </button>
                    </div>

                    <nav className="hidden xl:flex space-x-8 text-2xl font-moon">
                        {menuItems.map((item) => (
                            <a key={item} href={`#${item.toLowerCase()}`} className="hover:text-link-hover-color">
                                {item}
                            </a>
                        ))}
                    </nav>
                </div>
            </header>

            <div
                className={`menu-bar fixed right-0 shadow-lg z-40 transition-all duration-300 ease-in-out overflow-hidden p-1 menu-top ${
                    isMenuOpen ? "translate-y-0 scale-100 opacity-100" : "-translate-y-full scale-80 opacity-90"
                }`}
                style={{
                    width: "fit-content",
                    maxWidth: "100vw",
                    maxHeight: isMenuOpen ? "fit-content" : "0",
                    transformOrigin: "top center"
                }}
            >
                <nav className="p-4 text-center font-moon">
                    {menuItems.map((item, index) => (
                        <div key={index} className="flex flex-col">
                            <a
                                href={`#${item.toLowerCase()}`}
                                className="block text-lg py-4"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {item}
                            </a>
                            <hr className="menu-border" />
                        </div>
                    ))}
                </nav>
            </div>
        </>
    );
}
