import Header from "../components/Header";
import Footer from "../components/Footer";
import InputForm from "../components/InputForm";
import Timeline from "../components/Timeline";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Uma Planner - Gacha banner timeline & planner | umaplanner",
  description:
    "Plan your pulls and track banners with Uma Planner; an interactive timeline and calculator. Track character banners, support banners and your carats.",
};

export default function HomePage() {
  return (
    <>    
        <Header />

      <div id="main-body">
        <div className="container">
          <main>
            <InputForm />
            <Timeline />
          </main>
        </div>
      </div>
      
        <Footer />
    </>
  );
}
