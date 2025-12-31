import { Sidebar } from "@/components/Sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar - Visible only in Dashboard */}
            <Sidebar />

            {/* Main Content */}
            <main className="flex-1 ml-64 h-screen overflow-y-auto relative">
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
