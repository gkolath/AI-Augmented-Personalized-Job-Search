'use client'

import Link from 'next/link'
import { useTheme } from 'next-themes'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Moon, Sun, Zap, Menu, X, ChevronDown } from 'lucide-react'
import { useState } from 'react'

const NAV_GROUPS = [
  {
    label: 'Jobs',
    items: [
      { href: '/jobs', label: '🔍 Find Jobs', desc: 'Search 50+ job boards' },
      { href: '/freelance', label: '⚡ Freelance', desc: 'Contract & gig work' },
      { href: '/applications', label: '📋 Applications', desc: 'Track your pipeline' },
    ]
  },
  {
    label: 'AI Tools',
    items: [
      { href: '/resume', label: '📄 Resume Studio', desc: 'ATS optimize & tailor' },
      { href: '/interview', label: '🎤 Mock Interview', desc: 'AI interview practice' },
      { href: '/coaching', label: '🎯 Career Coach', desc: 'Weekly action plans' },
    ]
  },
  {
    label: 'Insights',
    items: [
      { href: '/salary', label: '💰 Salary Intel', desc: 'Market data & scripts' },
      { href: '/learn', label: '📚 Learning Path', desc: 'Close skill gaps fast' },
      { href: '/dashboard', label: '📊 Dashboard', desc: 'Your progress hub' },
    ]
  },
]

export function Navbar() {
  const { theme, setTheme } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openGroup, setOpenGroup] = useState<string | null>(null)
  const pathname = usePathname()

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-border/50 glass">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg gradient-text hidden sm:block">AI Job Hunter</span>
          </Link>

          {/* Desktop Nav Groups */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_GROUPS.map(group => (
              <div key={group.label} className="relative">
                <button
                  onMouseEnter={() => setOpenGroup(group.label)}
                  onMouseLeave={() => setOpenGroup(null)}
                  className={`flex items-center gap-1 px-3 py-2 text-sm rounded-lg transition-colors ${
                    group.items.some(i => isActive(i.href))
                      ? 'text-primary font-medium'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {group.label}
                  <ChevronDown className={`h-3 w-3 transition-transform ${openGroup === group.label ? 'rotate-180' : ''}`} />
                </button>

                {openGroup === group.label && (
                  <div
                    className="absolute top-full left-0 mt-1 w-56 bg-background/95 backdrop-blur border border-border/50 rounded-xl shadow-xl overflow-hidden"
                    onMouseEnter={() => setOpenGroup(group.label)}
                    onMouseLeave={() => setOpenGroup(null)}
                  >
                    {group.items.map(item => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-start gap-3 px-4 py-3 text-sm hover:bg-muted/50 transition-colors ${isActive(item.href) ? 'bg-primary/10' : ''}`}
                      >
                        <div>
                          <div className={`font-medium ${isActive(item.href) ? 'text-primary' : ''}`}>{item.label}</div>
                          <div className="text-xs text-muted-foreground">{item.desc}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="h-9 w-9"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
            <Link href="/login" className="hidden sm:block">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-primary hover:bg-primary/90">Get Started</Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-border/50 bg-background/98 backdrop-blur px-4 py-4 space-y-4 max-h-[80vh] overflow-y-auto">
          {NAV_GROUPS.map(group => (
            <div key={group.label}>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{group.label}</div>
              <div className="space-y-1">
                {group.items.map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      isActive(item.href) ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
          <div className="pt-2 border-t border-border/50 flex gap-2">
            <Link href="/login" className="flex-1" onClick={() => setMobileOpen(false)}>
              <Button variant="outline" size="sm" className="w-full">Sign In</Button>
            </Link>
            <Link href="/signup" className="flex-1" onClick={() => setMobileOpen(false)}>
              <Button size="sm" className="w-full bg-primary">Get Started</Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
