



import Header from "@/components/sections/Header";
import Hero from "@/components/sections/Hero";
import Trips from "@/components/sections/Trips";
import Experiences from "@/components/sections/Experiences";
import About from "@/components/sections/About";
import Contact from "@/components/sections/Contact";
import ChatWidget from "@/components/ai/ChatWidget";

import { getHomeData } from "@/sanity/lib/queries";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function Home() {
  const home = await getHomeData();

  return (
    <>
      <Header />
      <main>
        <Hero cms={home ?? undefined} />
        <Trips cms={home ?? undefined} />
        <Experiences cms={home ?? undefined} />
        <About cms={home ?? undefined} />
        <Contact cms={home ?? undefined} />
      </main>
      <ChatWidget />
    </>
  );
}
