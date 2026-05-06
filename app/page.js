import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import CategoryShowcase from "./components/CategoryShowcase";
import FeaturedProducts from "./components/FeaturedProducts";
import TrustSection from "./components/TrustSection";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <CategoryShowcase />
      <FeaturedProducts />
      <TrustSection />
      <Footer />
    </>
  );
}