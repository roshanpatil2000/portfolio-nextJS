import Nav from "@/components/Nav";
import Hero from "@/components/hero/Hero";
import ProjectGrid from "@/components/ProjectGrid";
import Experience from "@/components/Experience";
import Skills from "@/components/Skills";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import Rail from "@/components/rail/Rail";
import Choreography from "@/components/Choreography";

export default function Home() {
  return (
    <>
      <Nav />
      <main id="main">
        <Hero />
        <ProjectGrid />
        <Experience />
        <Skills />
        <Contact />
      </main>
      <Footer />
      <Rail />
      {/* Last, so its effect runs after every section above has hydrated. */}
      <Choreography />
    </>
  );
}
