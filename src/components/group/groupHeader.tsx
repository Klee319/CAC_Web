"use client";
import { useState } from "react";
import ExportedImage from "next-image-export-optimizer";
// @ts-ignore
import cacLogo from '../../../public/logo/newCAC.png';
import SwitchLightDark from "@/components/main/switchLightDark";

export default function GroupHeader() {
    const [isMenuOpen, setIsMenuOpen] = useState(false); // メニューの開閉状態
    const [isDarkMode, setIsDarkMode] = useState(true);   // ダークモードの状態

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);    // メニューの開閉をトグル
    const toggleMode = () => setIsDarkMode(prev => !prev);   // ダークモードの切替

    return (
        <>
            {/* ヘッダー */}
            <header className="fixed w-full top-0 left-0 p-8 shadow-md z-50 ">
                <div className="flex items-center justify-between">
                    {/* 左側: ロゴとスイッチボタン */}
                    <div className="flex items-center space-x-4">
                        <ExportedImage src={cacLogo} alt="C.A.C. logo" style={{ width: 100, height: 'auto' }} className="block" />
                        <div className="text-1xl font-moon">
                            <SwitchLightDark isDarkMode={isDarkMode} toggleMode={toggleMode} />
                        </div>
                    </div>

                    {/* ハンバーガーメニューアイコン (スマホ用) */}
                    <div className="md:hidden">
                        <button onClick={toggleMenu} aria-label="Open Menu" className="relative z-50">
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

                    {/* PC用ナビゲーションリンク */}
                    <nav className="hidden md:flex space-x-8 text-2xl font-moon">
                        <a href="#programing" className="hover:text-link-hover-color">Programing</a>
                        <a href="#graphic" className="hover:text-link-hover-color">Graphic</a>
                        <a href="#music" className="hover:text-link-hover-color">Music</a>
                        <a href="#cg" className="hover:text-link-hover-color">CG</a>
                        <a href="#video" className="hover:text-link-hover-color">Video</a>
                        <a href="#scenario" className="hover:text-link-hover-color">Scenario</a>
                    </nav>
                </div>
            </header>

            {/* メニュー */}
            <div
                className={`absolute top-[85px] right-0 w-full shadow-lg z-40 transition-transform duration-300 ease-in-out overflow-hidden menu-bar ${
                    isMenuOpen ? "translate-y-0" : "-translate-y-full"
                }`}
                style={{ width: 200 }} // ヘッダーの高さを引いた高さを設定
            >
                <nav className="p-4 text-center">
                    {["Programing", "Graphic", "Music", "CG", "Video", "Scenario"].map((item, index) => (
                        <div key={index} className="flex flex-col">
                            <hr className="border-t border-gray-300" />
                            <a
                                href={`#${item.toLowerCase().replace(/ & /g, "-").replace(/\s+/g, "")}`}
                                className="block text-lg py-4"
                            >
                                {item}
                            </a>
                            <hr className="border-t border-gray-300" />
                        </div>
                    ))}
                </nav>
            </div>
        </>
    );
}
