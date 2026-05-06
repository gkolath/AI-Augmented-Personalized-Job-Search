import Link from 'next/link'
import { Zap } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-border/50 py-12 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold gradient-text">AI Global Job Hunter</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">AI-powered global job search platform. Find jobs, apply automatically, ace interviews.</p>
          </div>
          <div className="grid grid-cols-3 gap-8 text-sm">
            <div>
              <div className="font-semibold mb-3">Platform</div>
              <div className="space-y-2 text-muted-foreground">
                <Link href="/jobs" className="block hover:text-foreground">Find Jobs</Link>
                <Link href="/freelance" className="block hover:text-foreground">Freelance</Link>
                <Link href="/dashboard" className="block hover:text-foreground">Dashboard</Link>
              </div>
            </div>
            <div>
              <div className="font-semibold mb-3">Account</div>
              <div className="space-y-2 text-muted-foreground">
                <Link href="/signup" className="block hover:text-foreground">Sign Up</Link>
                <Link href="/login" className="block hover:text-foreground">Sign In</Link>
                <Link href="/profile" className="block hover:text-foreground">Profile</Link>
              </div>
            </div>
            <div>
              <div className="font-semibold mb-3">Company</div>
              <div className="space-y-2 text-muted-foreground">
                <span className="block">Privacy</span>
                <span className="block">Terms</span>
                <span className="block">Contact</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
          © 2025 AI Global Job Hunter. Built with Next.js, Supabase & OpenAI.
        </div>
      </div>
    </footer>
  )
}
