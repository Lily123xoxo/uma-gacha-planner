import Header from "../components/Header";
import InputForm from "../components/InputForm";
import Timeline from "../components/Timeline";
import type { Metadata } from "next";

// App Router metadata replaces <Head>
export const metadata: Metadata = {
  title: "umaplanner",
  description:
    "Optimise your rolling plans for the gacha game Uma Musume with an interactive timeline and calculator. Track character banners, support banners, your carat gains, and optimize your pulls with ease.",
};

export default function HomePage() {
  return (
    <>
        <Header />

      <div id="main-body">
        <main>
          <InputForm />
          <Timeline />
        </main>
      </div>
    </>
  );
}
