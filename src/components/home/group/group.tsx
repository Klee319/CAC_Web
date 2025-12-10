import EachPart from './each_part';
import siteConfig from '@/config/siteConfig.json';

export default function Group() {
    return (
        <>
            <div className="pb-48">
                <div className="text-center">
                    <h1 className="text-7xl font-moon">Group</h1>
                    <p className="pb-2">班活動</p>
                    <div className="w-1/3 mx-auto h-0.5 border-color-dark mb-2"></div>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mb-8">
                        画像をクリックで各班の活動詳細が閲覧できます
                    </p>
                </div>

                {/* レスポンシブなグリッドレイアウト */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 px-6">
                    {/* 各班のコンポーネントをconfigから生成 */}
                    {siteConfig.groups.map((group) => (
                        <EachPart
                            key={group.id}
                            group={group.name}
                            omit={group.omit}
                            description={group.description}
                            link={group.detailLink}
                            image={group.image}
                        />
                    ))}
                </div>
            </div>
        </>
    );
}
