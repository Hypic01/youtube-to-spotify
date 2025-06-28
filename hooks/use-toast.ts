import { useState } from 'react'

interface Toast {
  title: string
  description?: string
  variant?: 'default' | 'destructive'
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = (toastData: Toast) => {
    setToasts(prev => [...prev, toastData])
    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t !== toastData))
    }, 5000)
  }

  return { toast, toasts }
} 