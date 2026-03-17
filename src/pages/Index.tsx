import Navbar from "@/components/Navbar";
import OceanMap from "@/components/OceanMap";
import LeftPanel from "@/components/LeftPanel";
import RightPanel from "@/components/RightPanel";
import BottomPrediction from "@/components/BottomPrediction";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-ocean-gradient flex flex-col">
      <Navbar />

      {/* Main Dashboard */}
      <main className="flex-1 pt-14 flex flex-col">
        <div className="flex-1 relative flex">
          {/* Left Panel */}
          <div className="hidden lg:flex absolute top-4 left-4 z-[500]">
            <LeftPanel />
          </div>

          {/* Map */}
          <div className="flex-1 min-h-[500px]">
            <OceanMap />
          </div>

          {/* Right Panel */}
          <div className="hidden lg:flex absolute top-4 right-4 z-[500]">
            <RightPanel />
          </div>
        </div>

        {/* Bottom Prediction */}
        <div className="px-4 pb-4 -mt-4 relative z-[500]">
          <BottomPrediction />
        </div>

        {/* Mobile Panels */}
        <div className="lg:hidden px-4 pb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <LeftPanel />
          <RightPanel />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
