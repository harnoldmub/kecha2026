import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props} className="bg-background border-primary/20 shadow-luxury">
            <div className="grid gap-1">
              {title && <ToastTitle className="font-serif italic">{title}</ToastTitle>}
              {description && (
                <ToastDescription className="font-sans text-xs opacity-60 uppercase tracking-widest">{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose className="text-primary/50 hover:text-primary" />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
