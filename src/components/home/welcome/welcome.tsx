import ExportedImage from "next-image-export-optimizer";
import "./welcome.css";
import React from 'react';
import WelcomeJS from "@/components/home/welcome/welcomeJS";

type Props = {
    isDarkMode: boolean;
};

export default function Welcome({ isDarkMode }: Props) {
    return (
        <>
            <WelcomeJS isDarkMode={isDarkMode} />
            <div className="relative w-full overflow-hidden welcome">
                <div className="white-layer"></div>
                <div className="absolute welcome-background"></div>
                <canvas id="spotlightCanvas" aria-hidden="true"></canvas>

                <div className="animation-container">
                    <div className="spotlightL"></div>
                    <div className="spotlightR"></div>
                    <ExportedImage
                        src="/home/welcome/cacCat1.png"
                        width={300}
                        height={400}
                        alt="Character"
                        className="catA del"
                        loading="lazy"
                    />
                    <ExportedImage
                        src="/home/welcome/cacCat5.png"
                        width={300}
                        height={400}
                        alt="Character"
                        className="catB del"
                        loading="lazy"
                    />
                </div>

                <div className="relative flex flex-col items-center justify-center content">
                    <ExportedImage
                        src="/home/welcome/backgroundBoard.png"
                        alt="イメージキャラクター"
                        width={400}
                        height={300}
                        className="cac-board del"
                        loading="lazy"
                    />
                    <ExportedImage
                        src="/home/welcome/imageCAT.png"
                        alt="イメージキャラクター"
                        width={500}
                        height={600}
                        priority
                        className="cac-cat-main del"
                    />
                    <ExportedImage
                        src="/home/welcome/CACmainLogo.png"
                        alt="C.A.C. ロゴ"
                        width={460}
                        height={192}
                        priority
                        className="cac-logoL del"
                        style={isDarkMode ? { filter: 'hue-rotate(177deg) brightness(1.11) saturate(1.2)' } : undefined}
                    />
                </div>
            </div>
        </>
    );
}

