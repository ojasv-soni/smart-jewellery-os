'use client'

import { useToast } from '@/lib/toast-context'
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react'

export function ToastContainer() {
  const { toasts, removeToast } = useToast()

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-destructive" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-600" />
    }
  }

  const getBgColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'error':
        return 'bg-red-50 border-destructive/20'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200'
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 p-4 rounded-lg border ${getBgColor(toast.type)} shadow-lg animate-in slide-in-from-top-2`}
        >
          {getIcon(toast.type)}
          <p className="text-sm text-foreground flex-1">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-muted-foreground hover:text-foreground transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
