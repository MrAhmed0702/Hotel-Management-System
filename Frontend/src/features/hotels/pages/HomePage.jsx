import React from 'react'
import HeroSection from '../components/HeroSection'
import Categories from '../components/Categories'
import Destinations from '../components/Destinations'
import FeaturedHotels from '../components/FeaturedHotels'
import TrustSection from '../components/TrustSection'
import ExperienceSection from '../components/ExperienceSection'
import Testimonials from '../components/Testimonials'
import CTASection from '../components/CTASection'

const HomePage = () => {
  return (
    <>
      <HeroSection />
      <Categories />
      <Destinations />
      <FeaturedHotels />
      <TrustSection />
      <ExperienceSection />
      <Testimonials />
      <CTASection />
    </>
  );
}

export default HomePage
