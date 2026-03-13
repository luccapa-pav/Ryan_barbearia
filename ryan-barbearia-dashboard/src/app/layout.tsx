import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Ryan Barbearia',
  description: 'Dashboard de gerenciamento — Ryan Barbearia',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster
          theme="dark"
          position="top-right"
          toastOptions={{
            style: {
              background: 'hsl(240 10% 7%)',
              border: '1px solid hsl(240 4% 16%)',
              color: 'hsl(0 0% 98%)',
            },
          }}
        />
      </body>
    </html>
  )
}
