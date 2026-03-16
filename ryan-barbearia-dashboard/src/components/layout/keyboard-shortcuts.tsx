'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const TAB_KEYS: Record<string, string> = {
  '1': '/visao-geral',
  '2': '/calendario',
  '3': '/agendamentos',
  '4': '/clientes',
  '5': '/configuracoes',
  '6': '/admin',
}

const PERIODO_KEYS: Record<string, string> = {
  h: 'hoje',
  s: 'semana',
  m: 'mes',
}

export function KeyboardShortcuts() {
  const router = useRouter()

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if ((e.target as HTMLElement).isContentEditable) return
      if (e.metaKey || e.ctrlKey || e.altKey) return

      const key = e.key.toLowerCase()

      if (TAB_KEYS[key]) {
        e.preventDefault()
        router.push(TAB_KEYS[key])
        return
      }

      if (PERIODO_KEYS[key] && window.location.pathname === '/visao-geral') {
        e.preventDefault()
        window.dispatchEvent(
          new CustomEvent('visao-geral:periodo', { detail: { periodo: PERIODO_KEYS[key] } })
        )
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [router])

  return null
}
