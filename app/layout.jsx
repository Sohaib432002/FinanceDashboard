import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import {ThemeProvider} from './useContext/useContext'

import Newlayout from './Newlayout'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata = {
  title: 'Finance Dashboard',
  description: 'A modern and responsive finance dashboard built with Next.js and Tailwind CSS.',
}
export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.1/css/all.min.css"
        precedence="default"
      />
      <body className="min-h-full flex flex-col">
      <ThemeProvider>
        <Newlayout>{children}</Newlayout>
      </ThemeProvider>
      </body>
    </html>
  )
}
