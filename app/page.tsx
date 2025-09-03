import Header from "../components/Header";
import Footer from "../components/Footer";
import InputForm from "../components/InputForm";
import Timeline from "../components/Timeline";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "umaplanner",
  description:
    "Optimise your rolling plans for the Uma Musume gacha game with umaplanner; an interactive timeline and calculator. Track character banners, support banners and more.",
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
