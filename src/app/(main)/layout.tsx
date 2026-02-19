export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#0b0c0e] text-white">
      {/* Sidebar and Nav will be added here */}
      <main className="flex-1">{children}</main>
    </div>
  )
}
