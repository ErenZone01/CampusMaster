'use client'

export function TimelineCursor() {
  return (
    <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
      {/* "Aujourd'hui" label */}
      <div className="bg-accent text-accent-foreground text-xs font-medium px-2 py-0.5 rounded-full mb-1 whitespace-nowrap">
        Aujourd&apos;hui
      </div>
      
      {/* Pulsing indicator */}
      <div className="relative">
        <div className="absolute inset-0 h-3 w-3 rounded-full bg-accent animate-ping opacity-75" />
        <div className="relative h-3 w-3 rounded-full bg-accent" />
      </div>
    </div>
  )
}
