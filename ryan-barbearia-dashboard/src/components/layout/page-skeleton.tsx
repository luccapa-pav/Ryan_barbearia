import React from 'react'

function SkeletonBar({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`skeleton ${className ?? ''}`} style={style} />
}

interface PageSkeletonProps {
  /** Quantas linhas shimmer mostrar abaixo do header (default 5) */
  rows?: number
}

/**
 * Skeleton compartilhado — aparece enquanto o servidor busca os dados.
 * Mantém identidade de marca e tamanho consistente para evitar layout shift.
 */
export function PageSkeleton({ rows = 5 }: PageSkeletonProps) {
  return (
    <div className="animate-fade-up min-h-[60vh] flex flex-col gap-8 py-4">
      {/* Área do header da página */}
      <div className="flex flex-col items-center gap-3">
        {/* Marca RG */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-[0_4px_24px_hsl(25_95%_50%/0.35)] flex items-center justify-center select-none">
          <span
            className="font-black text-white text-xl tracking-tight"
            style={{ fontFamily: 'var(--font-rethink, system-ui)' }}
          >
            RG
          </span>
        </div>
        <SkeletonBar className="h-9 w-44 rounded-xl" />
        <SkeletonBar className="h-3.5 w-28" />
      </div>

      {/* Separador sutil */}
      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Linhas shimmer — sugere conteúdo sem copiar layout exato */}
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonBar
            key={i}
            className="h-12 rounded-xl"
            style={{
              width: `${100 - i * 8}%`,
              opacity: 1 - i * 0.12,
            } as React.CSSProperties}
          />
        ))}
      </div>
    </div>
  )
}
