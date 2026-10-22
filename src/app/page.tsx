import Nav from "@/components/Nav";
import Hero from "@/components/hero/Hero";
import FeatureGrid from "@/components/FeatureGrid";
import OwnershipGrid from "@/components/OwnershipGrid";
import CommunityGrid from "@/components/CommunityGrid";
import FinalCta from "@/components/FinalCta";
import Footer from "@/components/Footer";
import Rail from "@/components/rail/Rail";
import Choreography from "@/components/Choreography";

export default function Home() {
  return (
    <>
      <Nav />
      <main id="main">
        <Hero />
        <FeatureGrid />
        <OwnershipGrid />
        <CommunityGrid />
        <FinalCta />
      </main>
      <Footer />
      <Rail />
      {/* Last, so its effect runs after every section above has hydrated. */}
      <Choreography />
    </>
  );
}
