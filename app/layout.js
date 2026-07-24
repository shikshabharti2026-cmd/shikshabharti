import './globals.css'
import { Inter } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata = {
  title: 'Shiksha Bharti — Learn Today. Build Tomorrow.',
  description:
    'Premium AI-powered EdTech platform for Jharkhand & India. Courses, live classes, ITI trades, government exam prep, programming, AI, and career skills — with a personal AI Tutor.',
  keywords: [
    'Shiksha Bharti',
    'Jharkhand',
    'JSSC',
    'JPSC',
    'ITI',
    'NEET',
    'JEE',
    'Programming',
    'AI Tutor',
    'EdTech India',
  ],
  openGraph: {
    title: 'Shiksha Bharti — Learn Today. Build Tomorrow.',
    description: 'AI-powered EdTech for Jharkhand & India.',
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
          <Toaster richColors position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  )
}
