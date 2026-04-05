"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import ExportedImage from "next-image-export-optimizer";
import "./about.css";

// 各ページの説明文データ
const descriptions = [
    {
        title: "デジタル系創作団体",
        description: [
            "CAC、正式名称:電子計算機応用部はデジタル系の創作活動を行っている団体です。",
            "活動日には新歓祭や神山祭に向けて創作活動に取り組んでおり、仲間と切磋琢磨することで、1人では作れなかった創作物を生み出すことができます。",
            "クリエイターの高みを目指して一歩を踏み出してみませんか。"
        ],
    },
    {
        title: "独自の班制度",
        description: [
            "専攻している分野に分かれた「班」システムを採用。",
            "同じ専攻の仲間と協力することでさらに技術や知識に磨きがかかります。技術習得のために欲しかった書籍を買ってもらえることも...",
            "班の種類と班ごとの詳しい概要は「GROUP」で確認できます。"
        ],
    },
    {
        title: "創作意欲溢れ出る環境",
        description: [
            "創作活動をするといいことがたくさん。",
            "毎月各班が主催するコンテストが開催。入賞すれば報酬を手に入れられるチャンスです。" ,
            "コンテスト以外でも作った作品は必ず日の目を浴びてくれます。オンラインでメンバーからリアクションをもらったり、神山祭（学祭）に展示したり..."
        ],
    },
    {
        title: "自由な活動",
        description: [
            "部活から強制的に渡されるタスクは基本ありません。",
            "活動時間中には好きなことができます。絵を描いたり、プログラミングをしたり...。迷惑さえかけなければ、雑談やゲームをしてもらっても大丈夫です。",
            "自分のやりたいことを見つけて、自分で進めることができる部活です。"
        ],
    },
    {
        title: "主体性を育む",
        description: [
            "自ら進んで活動することが求められます。",
            "自由で強制されない、すなわち自分から動かなければ何も起こらない環境です。主体的に活動するほど部活の恩恵が大きくなっていくことでしょう。",
            "所属する班の数に制限はありません。色々なことにチャレンジしましょう。"
        ],
    },
];

export default function About() {
    const [pageIndex, setPageIndex] = useState(0);
    const [direction, setDirection] = useState(1);

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 100 : -100,
            opacity: 0,
        }),
        center: { x: 0, opacity: 1 },
        exit: (direction: number) => ({
            x: direction < 0 ? 100 : -100,
            opacity: 0,
        }),
    };

    const nextPage = () => {
        setDirection(1);
        setPageIndex((prevIndex) =>
            prevIndex < descriptions.length - 1 ? prevIndex + 1 : 0
        );
    };

    const prevPage = () => {
        setDirection(-1);
        setPageIndex((prevIndex) =>
            prevIndex > 0 ? prevIndex - 1 : descriptions.length - 1
        );
    };

    return (
        <div className="pb-48 max-w-7xl mx-auto px-4">
            <div className="text-center mb-8">
                <h1 className="text-4xl md:text-5xl xl:text-7xl font-moon">About</h1>
                <p className="pb-2">C.A.C.について</p>
                <div className="w-1/3 mx-auto h-0.5 border-color-dark mb-10"></div>
            </div>
            <div className="pt-8 flex items-center justify-between flex-row about-content">
                {/* 画像部分 */}
                <div className="mt-8 md:mt-0 items center about-image">
                    <ExportedImage
                        src="/about/state_board.jpg"
                        alt="作業風景"
                        width={520}
                        height={490}
                        className="object-contain"
                        loading="lazy"
                    />
                </div>
                {/* テキスト部分 */}
                <div className="flex flex-row items-center justify-between about-text">
                    <button
                        onClick={prevPage}
                        className="text-4xl cursor-pointer mr-1.5 nextButton min-w-[44px] min-h-[44px] flex items-center justify-center"
                        aria-label="前のページ"
                    >
                        &#60;
                    </button>
                    <div className="relative w-[85%]">
                        <AnimatePresence initial={false} custom={direction} mode="wait">
                            <motion.div
                                key={pageIndex}
                                custom={direction}
                                variants={variants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                                className="motion-container"
                            >
                                <div className="text-left break-words px-4 md:px-0 pb-10">
                                    <h2 className="text-2xl font-zen-kurenaido mb-12">
                                        {descriptions[pageIndex].title}
                                    </h2>
                                    {descriptions[pageIndex].description.map((line, index) => (
                                        <p key={index} className="mb-1.5 leading-relaxed">
                                            {line}
                                        </p>
                                    ))}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                    <button
                        onClick={nextPage}
                        className="text-4xl cursor-pointer nextButton min-w-[44px] min-h-[44px] flex items-center justify-center"
                        aria-label="次のページ"
                    >
                        &#62;
                    </button>
                </div>
            </div>
        </div>
    );
}
