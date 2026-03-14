import type { Metadata } from 'next'
import { Rethink_Sans, Jost } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'

const rethinkSans = Rethink_Sans({
  subsets: ['latin'],
  variable: '--font-rethink',
  weight: ['400', '500', '600', '700', '800'],
})

const jost = Jost({
  subsets: ['latin'],
  variable: '--font-jost',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
})

export const metadata: Metadata = {
  title: 'Ryan Gomes | Barbearia',
  description: 'Dashboard de gerenciamento — Ryan Gomes Barbearia',
  icons: { icon: '/icon.svg' },
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
      <body className={`${rethinkSans.variable} ${jost.variable} font-sans antialiased`}>
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
