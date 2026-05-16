'use client'

import { ToastProvider } from '@/lib/toast-context'
import { ToastContainer } from '@/components/common/ToastContainer'
import { ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      {children}
      <ToastContainer />
    </ToastProvider>
  )
}
