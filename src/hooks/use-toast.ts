import { toast as sonnerToast } from 'sonner'

export function useToast() {
  return {
    toast: (options: {
      variant?: 'default' | 'destructive'
      title?: string
      description?: string
    }) => {
      if (options.variant === 'destructive') {
        sonnerToast.error(options.title || 'Error', {
          description: options.description,
        })
      } else {
        sonnerToast.success(options.title || 'Success', {
          description: options.description,
        })
      }
    },
  }
}

