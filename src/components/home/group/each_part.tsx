import ExportedImage from 'next-image-export-optimizer';

// EachPartコンポーネントのプロパティの型定義
interface EachPartProps {
    group: string;
    omit: string;
    description: string;
    link: string;
    image: string;
}

// 型定義を利用したEachPartコンポーネント
export default function EachPart({ group, omit, description, link, image }: EachPartProps) {
    return (
        <div className="relative group m-8">
            <div className="text-center">
                <h2 className="text-4xl font-moon">{group}</h2>
                <p className="pb-2">{description}</p>
            </div>
        <div className="relative overflow-hidden">
            <ExportedImage
                src={image}
                alt={group}
                width={550}
                height={310}
                className="w-full h-full object-cover transition-transform transform group-hover:scale-105 "
                loading="lazy"
            />
            <a href={link} target="_blank" rel="noopener noreferrer">
                <div className="absolute inset-0 bg-gray-900 bg-opacity-0 group-hover:bg-opacity-50 "></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 ">
                    <p className="text-center text-2xl font-zen-kurenaido">{omit}班の詳細を見る</p>
                </div>
            </a>
        </div>
        </div>
    );
}

