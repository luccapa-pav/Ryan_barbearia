import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Ryan Barbearia',
  description: 'Dashboard de gerenciamento — Ryan Barbearia',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* Apply saved theme before paint — default: light */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('theme')||'light';document.documentElement.classList.toggle('dark',t==='dark');})()`,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster
          theme="system"
          position="top-right"
          toastOptions={{
            classNames: {
              toast: 'bg-card border border-border text-foreground shadow-elevated',
            },
          }}
        />
      </body>
    </html>
  )
}
