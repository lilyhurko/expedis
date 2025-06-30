import React from "react";
import HeroCarousel from "./HeroCarousel.jsx";
import TopDestinations from "./TopDestinations.jsx";
import Testimonials from "./Testimonials.jsx";
import Footer from "./Footer.jsx";

function Home() {
  return (
    <>
      
      <HeroCarousel />
       <TopDestinations />
      <Testimonials />
      <Footer />
    </>
  );
}

export default Home;
