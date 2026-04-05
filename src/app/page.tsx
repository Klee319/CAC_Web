"use client";
import About from '@/components/home/about/about';
import Group from '@/components/home/group/group';
import Location from '@/components/home/location';
import Event from "@/components/home/event/event";
import Footer from "@/components/main/footer";
import HomeHeader from '@/components/home/header/homeHeader';
import Welcome from "@/components/home/welcome/welcome";
import GalleryPage from "@/components/home/gallery/GalleryPage";
import { useCallback, useEffect, useState } from "react";

export default function Page() {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const toggleMode = useCallback(() => setIsDarkMode(prev => !prev), []);

    // 初期化（1回のみ実行）
    useEffect(() => {
        // ブラウザエンジンの検出
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        const isGoogleApp = /GSA/i.test(navigator.userAgent);

        if (!isSafari || isGoogleApp) {
            document.body.classList.add("google");
        } else {
            document.body.classList.add("safari");
        }

        // デバイスタイプの検出
        const isTablet = /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent);
        if (isTablet) {
            document.body.classList.add('tablet');
        }

        // ビューポートの高さを設定
        const setViewportHeight = () => {
            const vh = window.innerHeight * 0.01;
            document.body.style.setProperty('--vh', `${vh}px`);
        };

        setViewportHeight();
        window.addEventListener("resize", setViewportHeight);

        return () => {
            window.removeEventListener("resize", setViewportHeight);
        };
    }, []);

    // ダークモード切替（isDarkMode変更時のみ）
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark-mode');
        } else {
            document.documentElement.classList.remove('dark-mode');
        }
    }, [isDarkMode]);

    return (
        <div className="body">
            <div className="main-content relative">
                <div id="welcome">
                    <Welcome isDarkMode={isDarkMode} />
                </div>

                <HomeHeader isDarkMode={isDarkMode} toggleMode={toggleMode} />

                <div className="relative">
                    <div className="stripe"></div>
                    <div className="description-main">
                        <div className="h-[128px]"></div>
                        <div id="about">
                            <About />
                        </div>
                        <div id="group">
                            <Group />
                        </div>
                        <div id="location">
                            <Location />
                        </div>
                        <div id="event">
                            <Event />
                        </div>
                        <div id="gallery">
                            <GalleryPage />
                        </div>
                    </div>
                </div>

                <Footer />
            </div>
        </div>
    );
}
