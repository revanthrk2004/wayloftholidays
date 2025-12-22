import Header from "@/components/sections/Header";
import Hero from "@/components/sections/Hero";
import Trips from "@/components/sections/Trips";
import Experiences from "@/components/sections/Experiences";
import About from "@/components/sections/About";
import Contact from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Trips />
        <Experiences />
        <About />
        <Contact />
      </main>
    </>
  );
}
