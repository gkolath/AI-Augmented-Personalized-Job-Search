import { Navbar } from '@/components/layout/navbar'
import { HeroSection } from '@/components/home/hero-section'
import { StatsSection } from '@/components/home/stats-section'
import { FeaturesSection } from '@/components/home/features-section'
import { JobTicker } from '@/components/home/job-ticker'
import { HowItWorks } from '@/components/home/how-it-works'
import { TestimonialsSection } from '@/components/home/testimonials'
import { CTASection } from '@/components/home/cta-section'
import { Footer } from '@/components/layout/footer'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <JobTicker />
      <StatsSection />
      <FeaturesSection />
      <HowItWorks />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </main>
  )
}
