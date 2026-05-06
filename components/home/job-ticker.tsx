'use client'

const tickerJobs = [
  '🔥 Senior React Dev @ Google — Remote — $180k',
  '⚡ QA Engineer @ Amazon — Dubai — Visa Sponsored',
  '🌟 Full Stack Dev @ Stripe — Remote — $160k',
  '🚀 DevOps @ Microsoft — Germany — Relocation Pkg',
  '💎 ML Engineer @ OpenAI — SF — $250k',
  '🌍 Playwright QA @ Shopify — Canada — Work Permit',
  '🔥 Backend Dev @ Netflix — Remote — $200k',
  '⚡ iOS Dev @ Apple — Cupertino — Visa Available',
  '🌟 Data Scientist @ Meta — London — Sponsored',
  '🚀 Go Engineer @ Cloudflare — Remote — $170k',
]

export function JobTicker() {
  const doubled = [...tickerJobs, ...tickerJobs]

  return (
    <div className="border-y border-border/30 bg-muted/20 py-3 overflow-hidden">
      <div className="flex gap-12 animate-ticker whitespace-nowrap">
        {doubled.map((job, i) => (
          <span key={i} className="text-sm text-muted-foreground shrink-0">
            {job}
          </span>
        ))}
      </div>
    </div>
  )
}
