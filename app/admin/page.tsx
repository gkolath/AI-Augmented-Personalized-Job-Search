'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/layout/navbar'
import { BarChart3, Users, Search, RefreshCw } from 'lucide-react'

export default function AdminPage() {
  const [stats, setStats] = useState({ users: 0, applications: 0, searches: 0 })
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    async function check() {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
      if (profile?.is_admin) {
        setIsAdmin(true)
        const [{ count: users }, { count: apps }] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('applications').select('*', { count: 'exact', head: true }),
        ])
        setStats({ users: users || 0, applications: apps || 0, searches: 0 })
      }
    }
    check()
  }, [])

  if (!isAdmin) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-32 text-center text-muted-foreground">
        <p>Admin access required.</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 px-4 pb-16 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Admin Panel</h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Users', value: stats.users, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
            { label: 'Applications', value: stats.applications, icon: BarChart3, color: 'text-green-400', bg: 'bg-green-400/10' },
            { label: 'Job Searches', value: stats.searches, icon: Search, color: 'text-purple-400', bg: 'bg-purple-400/10' },
          ].map((s, i) => (
            <Card key={i} className="p-5 border-border/50">
              <div className={`inline-flex p-2 rounded-lg ${s.bg} mb-3`}><s.icon className={`h-5 w-5 ${s.color}`} /></div>
              <div className="text-3xl font-bold">{s.value}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </Card>
          ))}
        </div>

        <Card className="p-6 border-border/50">
          <h2 className="font-semibold mb-4">System Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" /> Clear Job Cache
            </Button>
            <Button variant="outline" className="gap-2">
              <Search className="h-4 w-4" /> Trigger Scrape Jobs
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
