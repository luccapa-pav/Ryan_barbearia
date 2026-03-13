'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const TAB_KEYS: Record<string, string> = {
  '1': '/visao-geral',
  '2': '/agendamentos',
  '3': '/clientes',
  '4': '/calendario',
  '5': '/configuracoes',
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
      // Ignora quando foco está em input/textarea
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if (e.metaKey || e.ctrlKey || e.altKey) return

      const key = e.key.toLowerCase()

      if (TAB_KEYS[key]) {
        e.preventDefault()
        router.push(TAB_KEYS[key])
        return
      }

      if (PERIODO_KEYS[key] && window.location.pathname === '/visao-geral') {
        e.preventDefault()
        router.push(`/visao-geral?periodo=${PERIODO_KEYS[key]}`)
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [router])

  return null
}
