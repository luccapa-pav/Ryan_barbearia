'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('theme')
    const dark = stored === 'dark'
    setIsDark(dark)
    document.documentElement.classList.toggle('dark', dark)
  }, [])

  function toggle() {
    const next = !isDark
    document.documentElement.classList.add('no-transition')
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
    setIsDark(next)
    requestAnimationFrame(() => {
      document.documentElement.classList.remove('no-transition')
    })
  }

  return (
    <button
      onClick={toggle}
      aria-label="Alternar tema"
      className="relative flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all duration-200 active:scale-90 hover:scale-110"
    >
      <Sun className={`absolute h-4 w-4 transition-all duration-300 ${isDark ? 'opacity-0 scale-50 rotate-90' : 'opacity-100 scale-100 rotate-0'}`} />
      <Moon className={`absolute h-4 w-4 transition-all duration-300 ${isDark ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 -rotate-90'}`} />
    </button>
  )
}
