import Header from "../components/Header";
import Footer from "../components/Footer";
import InputForm from "../components/InputForm";
import Timeline from "../components/Timeline";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Home',
  description:
    'Track character and support banners and plan your pulls with Uma Planner.',
}

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
