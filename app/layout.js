import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html className="h-full w-full bg-off-white">
      <body className="h-full w-full">{children}</body>
    </html>
  );
}
