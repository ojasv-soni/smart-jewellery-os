'use client'

import { AlertTriangle, CheckCircle } from 'lucide-react'

interface AuditMismatch {
  inventory_id: string
  product_name: string
  recorded_quantity: number
  physical_quantity: number
  difference: number
  severity: 'green' | 'yellow' | 'orange' | 'red'
  reason: string
}

interface AuditComparisonProps {
  mismatches: AuditMismatch[]
  onApprove: (mismatches: AuditMismatch[]) => void
  onReject: () => void
  loading?: boolean
}

export function AuditComparison({ mismatches, onApprove, onReject, loading }: AuditComparisonProps) {
  const severityColor = (severity: string) => {
    switch (severity) {
      case 'green':
        return 'bg-green-900/20 border-green-900/50'
      case 'yellow':
        return 'bg-yellow-900/20 border-yellow-900/50'
      case 'orange':
        return 'bg-orange-900/20 border-orange-900/50'
      case 'red':
        return 'bg-red-900/20 border-red-900/50'
      default:
        return 'bg-muted/20 border-muted/50'
    }
  }

  const severityTextColor = (severity: string) => {
    switch (severity) {
      case 'green':
        return 'text-green-300'
      case 'yellow':
        return 'text-yellow-300'
      case 'orange':
        return 'text-orange-300'
      case 'red':
        return 'text-red-300'
      default:
        return 'text-muted-foreground'
    }
  }

  const totalMismatches = mismatches.length
  const criticalIssues = mismatches.filter((m) => m.severity === 'red').length

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-2xl font-bold text-foreground mb-4">Audit Summary</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-muted-foreground text-sm">Total Items Checked</p>
            <p className="text-3xl font-bold text-foreground">{totalMismatches}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Critical Issues</p>
            <p className={`text-3xl font-bold ${criticalIssues > 0 ? 'text-red-400' : 'text-green-400'}`}>
              {criticalIssues}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Status</p>
            <p className={`text-lg font-bold ${criticalIssues === 0 ? 'text-green-400' : 'text-red-400'}`}>
              {criticalIssues === 0 ? '✓ Clear' : '⚠ Issues'}
            </p>
          </div>
        </div>
      </div>

      {/* Mismatch Details */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-foreground">Details</h3>
        {mismatches.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-8 flex items-center justify-center gap-3">
            <CheckCircle className="text-green-400" size={20} />
            <span className="text-foreground">✓ No mismatches detected. All inventory matches!</span>
          </div>
        ) : (
          mismatches.map((mismatch) => (
            <div key={mismatch.inventory_id} className={`border rounded-lg p-4 ${severityColor(mismatch.severity)}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-bold text-foreground">{mismatch.product_name}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{mismatch.reason}</p>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded ${severityTextColor(mismatch.severity)}`}>
                  {mismatch.severity.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Recorded</span>
                  <p className="font-bold text-foreground">{mismatch.recorded_quantity}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Physical</span>
                  <p className="font-bold text-foreground">{mismatch.physical_quantity}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Difference</span>
                  <p className={`font-bold ${mismatch.difference > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {mismatch.difference > 0 ? '+' : ''}{mismatch.difference}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-4 pt-4">
        <button
          onClick={() => onApprove(mismatches)}
          disabled={loading}
          className="flex-1 bg-primary text-primary-foreground py-3 px-4 rounded-lg hover:bg-primary/90 transition font-bold disabled:opacity-50"
        >
          {loading ? 'Approving...' : 'Approve Adjustments'}
        </button>
        <button
          onClick={onReject}
          disabled={loading}
          className="flex-1 bg-secondary text-secondary-foreground py-3 px-4 rounded-lg hover:bg-secondary/90 transition font-bold disabled:opacity-50"
        >
          Review Again
        </button>
      </div>
    </div>
  )
}