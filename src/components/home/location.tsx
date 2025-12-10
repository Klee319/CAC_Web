import ExportedImage from "next-image-export-optimizer";
import "./location.css";
import siteConfig from '@/config/siteConfig.json';

export default function Location() {
    const { schedules, image } = siteConfig.activity;

    return (
        <div className="pb-48">
            <h1 className="text-center location-title text-7xl font-moon">Location & Dates</h1>
            <p className="pb-2 text-center">活動場所、日時</p>
            <div className="w-2/3 mx-auto h-0.5 border-color-dark mb-20"></div>
            <div className="flex flex-wrap justify-center w-full">
                <div>
                    <ExportedImage
                        src={image}
                        alt="作業風景"
                        width={640}
                        height={360}
                        loading="lazy"
                    />
                </div>
                <div className="flex-row mx-28 date-content text-center">
                    {schedules.map((schedule, index) => (
                        <div key={schedule.day}>
                            <p className={`text-3xl font-zen-kurenaido ${index === 0 ? 'pt-10' : 'pt-32'} mb-1 date ${index > 0 ? 'top-m' : ''}`}>
                                {schedule.day}
                            </p>
                            <p className="text-3xl font-zen-kurenaido place">
                                {schedule.location} ({schedule.time})
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
