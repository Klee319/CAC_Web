import { useEffect, useState } from "react";

// Instagram APIのレスポンス型定義
interface InstagramMedia {
    media_url?: string;
    thumbnail_url?: string;
    permalink: string;
}

interface InstagramResponse {
    media?: {
        data: InstagramMedia[];
    };
    error?: {
        message: string;
    };
}

// 表示用の画像データ型
interface DisplayMedia {
    mediaUrl: string;
    permalink: string;
}

// APIエンドポイント（トークンは環境変数から取得）
const INSTAGRAM_TOKEN = process.env.NEXT_PUBLIC_INSTAGRAM_TOKEN ?? "";
const INSTAGRAM_USER_ID = process.env.NEXT_PUBLIC_INSTAGRAM_USER_ID ?? "17841452314795723";
const INSTAGRAM_API_URL = `https://graph.facebook.com/v18.0/${INSTAGRAM_USER_ID}?access_token=${INSTAGRAM_TOKEN}&fields=media{media_url,thumbnail_url,permalink}`;

export const useInstagramImages = () => {
    const [images, setImages] = useState<DisplayMedia[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const fetchInstagramImages = async () => {
            if (!INSTAGRAM_TOKEN) {
                if (isMounted) {
                    setError("Instagram API token is not configured.");
                    setLoading(false);
                }
                return;
            }

            try {
                const response = await fetch(INSTAGRAM_API_URL);

                if (!response.ok) {
                    throw new Error(`API responded with status: ${response.status}`);
                }

                const jsonData = await response.json() as InstagramResponse;

                if (!isMounted) return;

                if (jsonData.error) {
                    throw new Error(jsonData.error.message);
                }

                if (jsonData.media?.data?.length) {
                    const displayMedias = jsonData.media.data.map(media => ({
                        mediaUrl: media.thumbnail_url || media.media_url || '',
                        permalink: media.permalink
                    })).filter(media => media.mediaUrl);

                    setImages(displayMedias);
                } else {
                    throw new Error("No media data found.");
                }
            } catch (err) {
                console.error("Failed to fetch Instagram images:", err);
                if (isMounted) {
                    setError("ギャラリーの読み込みに失敗しました。");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchInstagramImages();

        return () => {
            isMounted = false;
        };
    }, []);

    return { images, loading, error };
};
