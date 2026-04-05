import Programing from "@/components/group/programing";
import GroupHeader from "@/components/group/groupHeader";
import Graphic from "@/components/group/graphic";
import Music from "@/components/group/music";
import Cg from "@/components/group/cg";
import Video from "@/components/group/video";
import Scenario from "@/components/group/scenario";
import Footer from "@/components/main/footer";


export default function Page() {
    return (
        <>
            <GroupHeader></GroupHeader>
            <div className="h-[128px]">
            </div>
            <div id="programing">
                <Programing />
            </div>
            <div id="graphic">
            <Graphic></Graphic>
            </div>
            <div id="music">
            <Music></Music>
            </div>
            <div id="cg">
            <Cg></Cg>
            </div>
            <div id="video">
            <Video></Video>
            </div>
            <div id="scenario">
            <Scenario></Scenario>
            </div>
            <Footer></Footer>
        </>
    )
};