import './globals.css'

export const metadata = {
  title: 'טוטו החברים',
  description: 'המקום לזכות בגדול! 💰',
}

export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl">
      <body className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
        {children}
      </body>
    </html>
  )
}
