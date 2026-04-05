"use client";
import { useInstagramImages } from "./useInstagramImages";
import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";

const Gallery = () => {
    const { images, loading, error } = useInstagramImages();
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (images.length === 0) return;

        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) =>
                prevIndex === images.length - 1 ? 0 : prevIndex + 1
            );
        }, 6000);

        return () => clearInterval(interval);
    }, [images.length]);

    const [galleryHeight, setGalleryHeight] = useState('80vh');

    const updateGalleryHeight = useCallback(() => {
        if (window.innerWidth <= 1024) {
            setGalleryHeight('600px');
        } else {
            setGalleryHeight('80vh');
        }
    }, []);

    useEffect(() => {
        updateGalleryHeight();
        window.addEventListener('resize', updateGalleryHeight);

        return () => {
            window.removeEventListener('resize', updateGalleryHeight);
        };
    }, [updateGalleryHeight]);

    // 次の画像をプリロード
    useEffect(() => {
        if (images.length <= 1) return;
        const nextIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
        const nextImage = images[nextIndex];
        if (nextImage) {
            const img = new Image();
            img.src = nextImage.mediaUrl;
        }
    }, [currentIndex, images]);

    if (loading) {
        return (
            <div className="relative w-full flex items-center justify-center" style={{ height: galleryHeight }}>
                <p className="text-xl">Loading gallery...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="relative w-full flex items-center justify-center" style={{ height: galleryHeight }}>
                <p className="text-xl text-red-500">ギャラリーの読み込みに失敗しました</p>
            </div>
        );
    }

    if (images.length === 0) {
        return (
            <div className="relative w-full flex items-center justify-center" style={{ height: galleryHeight }}>
                <p className="text-xl">No images available</p>
            </div>
        );
    }

    const image = images[currentIndex];

    return (
        <div className="relative w-full flex items-center justify-center overflow-hidden" style={{ height: galleryHeight }}>
            <AnimatePresence mode="wait">
                {image && (
                    <motion.img
                        key={currentIndex}
                        src={image.mediaUrl}
                        alt={`Instagram media ${currentIndex + 1}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.7 }}
                        className="absolute w-[80%] h-auto max-h-[80%] object-contain"
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Gallery;
