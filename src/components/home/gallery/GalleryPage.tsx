import InstagramGallery from "./InstagramGallery";

export default function GalleryPage() {
    return (
        <div className="min-h-screen">
            <div className="text-center">
                <h1 className="text-4xl md:text-5xl xl:text-7xl font-moon">Gallery</h1>
                <p className="pb-2">ギャラリー</p>
                <div className="w-1/3 mx-auto h-0.5 border-color-dark"></div>
            </div>
            <div>
                <InstagramGallery />
            </div>
        </div>
    );
}
