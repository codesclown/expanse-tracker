interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-16 animate-fade-in">
      <div className="w-24 h-24 mx-auto mb-6 relative">
        <div className="w-full h-full text-muted-foreground/20">
          {icon}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 bg-primary/20 rounded-full animate-ping"></div>
        </div>
      </div>
      <p className="text-lg font-semibold mb-2">{title}</p>
      <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/30 hover:scale-105"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
