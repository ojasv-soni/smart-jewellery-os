'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuditComparison } from '@/components/audit/AuditComparison'
import { ArrowLeft } from 'lucide-react'

export default function AuditPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [auditData, setAuditData] = useState<any>({})
  const [mismatches, setMismatches] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // Step 1: Enter Physical Inventory
  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Compare physical count with recorded
      const response = await fetch('/api/audit/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(auditData),
      })
      const data = await response.json()
      setMismatches(data.mismatches || [])
      setStep(2)
    } catch (error) {
      alert('Error comparing inventory')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Approve Adjustments
  const handleApprove = async (approvedMismatches: any[]) => {
    setLoading(true)
    try {
      await fetch('/api/audit/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audit_date: new Date().toISOString(),
          mismatches: approvedMismatches,
        }),
      })
      alert('✓ Audit completed successfully!')
      router.push('/dashboard')
    } catch (error) {
      alert('Error approving audit')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border p-6 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-primary hover:text-primary/80 transition mb-4"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <h1 className="text-3xl font-bold text-foreground">Inventory Audit</h1>
          <p className="text-muted-foreground mt-1">Compare physical inventory with recorded stock</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto p-6">
        {step === 1 ? (
          // Step 1: Enter Physical Count
          <div className="bg-card border border-border rounded-lg p-8 shadow-lg">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-foreground mb-2">Step 1: Enter Physical Inventory</h2>
              <p className="text-muted-foreground">Count your physical stock and enter the numbers below</p>
            </div>

            <form onSubmit={handleStep1Submit} className="space-y-6">
              {/* Audit Note */}
              <div>
                <label className="block text-foreground font-semibold mb-2">Audit Notes (optional)</label>
                <textarea
                  value={auditData.notes || ''}
                  onChange={(e) => setAuditData({ ...auditData, notes: e.target.value })}
                  className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground placeholder-muted-foreground"
                  placeholder="Any special conditions for this audit..."
                  rows={3}
                />
              </div>

              {/* Sample Items to Count */}
              <div className="bg-muted/20 border border-muted rounded-lg p-4">
                <p className="text-foreground font-semibold mb-3">Sample: Count these items</p>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-4 items-end">
                      <div className="flex-1">
                        <label className="block text-muted-foreground text-sm mb-1">Item {i}</label>
                        <input
                          type="text"
                          placeholder="Product name"
                          className="w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground"
                        />
                      </div>
                      <div className="w-24">
                        <label className="block text-muted-foreground text-sm mb-1">Count</label>
                        <input
                          type="number"
                          placeholder="0"
                          className="w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg hover:bg-primary/90 transition font-bold disabled:opacity-50"
              >
                {loading ? 'Comparing...' : 'Compare Inventory'}
              </button>
            </form>
          </div>
        ) : (
          // Step 2: Review Mismatches
          <div className="bg-card border border-border rounded-lg p-8 shadow-lg">
            <AuditComparison
              mismatches={mismatches}
              onApprove={handleApprove}
              onReject={() => setStep(1)}
              loading={loading}
            />
          </div>
        )}
      </main>
    </div>
  )
}