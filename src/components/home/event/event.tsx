import "./event.css";
import React from "react";
import ExportedImage from "next-image-export-optimizer";

// イベントデータの型定義
type EventData = {
    date: string;
    title: string;
    image?: string;
};

// イベントデータ
const events: EventData[] = [
    { date: "5月", title: "新入生歓迎会", image: "/event/5新入生歓迎.jpg" },
    { date: "8月", title: "制作合宿(夏)", image: "/event/8夏制作合宿.jpg" },
    { date: "8月", title: "サタジャン", image: "/event/8サタジャン.jpg" },
    { date: "9月", title: "夏合宿", image: "/event/9夏合宿.jpg" },
    { date: "11月", title: "神山祭", image: "/event/11神山祭.jpg" },
    { date: "12月", title: "4回生追い出しコンパ", image: "/event/12追いコン.jpg" },
    { date: "2月", title: "制作合宿（春）", image: "/event/2春制作合宿.jpg" },
    { date: "2月", title: "合宿（春）", image: "/event/3春合宿.jpg" }
];

// イベントカードコンポーネント
const EventCard = ({ title, image }: EventData) => {
    return (
        <div className="event-card relative">
            {image && (
                <ExportedImage
                    src={image}
                    alt={title}
                    fill
                    className="object-cover rounded-[30px]"
                    loading="lazy"
                    sizes="(max-width: 480px) calc(100vw - 3rem), (max-width: 768px) 240px, (max-width: 1024px) 280px, 320px"
                />
            )}
        </div>
    );
};

// メインの Event コンポーネント
export default function Event() {
    return (
        <>
            <div className="text-center">
                <h1 className="text-4xl md:text-5xl xl:text-7xl font-moon">Event</h1>
                <p className="pb-2">行事</p>
                <div className="w-1/3 mx-auto h-0.5 border-color-dark mb-10"></div>
            </div>
            <div className="event-container">
                {events.map((event, index) => (
                    <EventCard key={index} {...event} />
                ))}
            </div>
        </>
    );
}
