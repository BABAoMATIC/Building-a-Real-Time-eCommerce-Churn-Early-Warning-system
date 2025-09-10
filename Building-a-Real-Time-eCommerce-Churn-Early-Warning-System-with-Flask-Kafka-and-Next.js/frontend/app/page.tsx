'use client'

import LandingNavigation from '@/components/layout/LandingNavigation'
import HeroSection from '@/components/sections/HeroSection'
import FeaturesSection from '@/components/sections/FeaturesSection'
import BenefitsSection from '@/components/sections/BenefitsSection'
import HowItWorksSection from '@/components/sections/HowItWorksSection'
import Footer from '@/components/layout/Footer'

export default function Home() {
  return (
    <div className="min-h-screen">
      <LandingNavigation />
      <HeroSection />
      <FeaturesSection />
      <BenefitsSection />
      <HowItWorksSection />
      <Footer />
    </div>
  )
}