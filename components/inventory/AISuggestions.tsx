'use client'

import { AlertCircle, CheckCircle } from 'lucide-react'

interface AISuggestion {
  product_name: string
  category: string
  confidence: number
  duplicate_warning?: boolean
}

interface AISuggestionsProps {
  suggestions: AISuggestion | null
  onApply?: (suggestion: AISuggestion) => void
  loading?: boolean
}

export function AISuggestions({ suggestions, onApply, loading }: AISuggestionsProps) {
  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full mr-3"></div>
          <span className="text-foreground">Analyzing image with AI...</span>
        </div>
      </div>
    )
  }

  if (!suggestions) {
    return null
  }

  const confidenceColor =
    suggestions.confidence >= 80 ? 'text-green-400' : suggestions.confidence >= 60 ? 'text-yellow-400' : 'text-red-400'

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-start gap-4 mb-4">
          <CheckCircle className="text-primary flex-shrink-0 mt-1" size={20} />
          <div className="flex-1">
            <h3 className="text-foreground font-bold mb-2">AI Analysis Results</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground">Product Name:</span>
                <p className="text-foreground font-semibold">{suggestions.product_name}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Category:</span>
                <p className="text-foreground font-semibold">{suggestions.category}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Confidence:</span>
                <p className={`font-bold text-lg ${confidenceColor}`}>{suggestions.confidence}%</p>
              </div>
            </div>
          </div>
        </div>

        {suggestions.confidence < 80 && (
          <div className="bg-yellow-900/20 border border-yellow-900/50 rounded-lg p-3 flex gap-3 mb-4">
            <AlertCircle className="text-yellow-300 flex-shrink-0" size={18} />
            <p className="text-yellow-200 text-sm">
              Low confidence detected. Please review and edit details before saving.
            </p>
          </div>
        )}

        {suggestions.duplicate_warning && (
          <div className="bg-orange-900/20 border border-orange-900/50 rounded-lg p-3 flex gap-3 mb-4">
            <AlertCircle className="text-orange-300 flex-shrink-0" size={18} />
            <p className="text-orange-200 text-sm">
              Similar inventory item detected. Please verify this is not a duplicate.
            </p>
          </div>
        )}

        {onApply && (
          <button
            onClick={() => onApply(suggestions)}
            className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-lg hover:bg-primary/90 transition font-semibold"
          >
            Apply Suggestions
          </button>
        )}
      </div>
    </div>
  )
}