import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import FeaturedProducts from "./components/FeaturedProducts";
import Footer from "./components/Footer";
import Testimonials from "./components/Testimonials";
import SocialMediaSection from "./components/SocialMediaSection";
import {
  HomeStoryBanner,
  ShopBySpaceEditorial,
  StyledHomesInspiration,
} from "./components/HomeEditorialSections";

export const metadata = {
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <section className="trust-strip">
  <div className="container">
    <div className="trust-strip-inner">
      <div>
        <h6>Nationwide Delivery</h6>
        <p>Across Nigeria</p>
      </div>

      <div>
        <h6>Curated Pieces</h6>
        <p>Selected for elegant spaces</p>
      </div>

      <div>
        <h6>Home & Office</h6>
        <p>Décor solutions for every space</p>
      </div>
    </div>
  </div>
</section>
      <ShopBySpaceEditorial />
      <FeaturedProducts />
      <HomeStoryBanner />
      <StyledHomesInspiration />
      <Testimonials />
      <SocialMediaSection />
      <Footer />
    </>
  );
}
