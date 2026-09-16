import "./globals.css";
import { Sidebar } from "../components/Sidebar";

export const metadata = {
  title: "RestoVyn - Restaurant Management & Operations",
  description:
    "Enterprise internal management platform for restaurant operations",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                RestoVyn Operations Dashboard
              </h1>
              <p className="text-xs text-slate-500">
                Live single-restaurant management & oversight
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                ● Live Central API Connected
              </span>
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-800">
                  Ratnadeep Parya
                </p>
                <p className="text-xs text-slate-500">OWNER</p>
              </div>
            </div>
          </header>
          <div className="p-8 flex-1">{children}</div>
        </main>
      </body>
    </html>
  );
}
