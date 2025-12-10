import Image from "next/image";
import insragramSvg from '../../../public/logo/Instagram_logo_2016.svg';
import XSvg from "../../../public/logo/X_logo_2023.svg";
import "./footer.css";

export default function Footer() {
    return (
        <footer className="pb-4 pt-4">
            {/* フッターのメイン部分 */}
            <div className="flex flex-row items-center justify-around space-y-0">
                {/* ロゴとタイトル */}
                <div className="flex items-center logo">
                    <Image
                        src="/logo/newCAC.png"
                        alt="C.A.C. logo"
                        width={220}
                        height={100}
                        className="cac"
                    />
                    <p className="font-zen-kurenaido text-color text">©電子計算機応用部</p>
                </div>

                {/* ソーシャルリンク */}
                <div className="flex items-center social">
                    <div className="flex flex-row items-center social-icons">
                        <a href="https://www.instagram.com/c_a_c_official" className="mr-4">
                            <Image
                                src={insragramSvg}
                                alt="Instagram"
                                width={40}
                                height={40}
                                className="scale-100 hover:scale-125 transition-transform insta-logo"
                            />
                        </a>
                        <a href="https://twitter.com/c_a_c_official">
                            <Image
                                src={XSvg}
                                alt="X"
                                width={40}
                                height={40}
                                className="scale-100 hover:scale-125 transition-transform x-icon"
                            />
                        </a>
                    </div>
                    <p className="font-zen-kurenaido text-color text">公式SNS/お問い合わせ</p>
                </div>
            </div>
        </footer>
    );
}
