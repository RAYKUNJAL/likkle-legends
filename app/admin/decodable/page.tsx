
import DecodableDashboard from "@/components/DecodableDashboard";

export const metadata = {
    title: "Decodable Reader Factory | Likkle Legends Admin",
    description: "Multi-agent factory for generating phonics-controlled Caribbean stories.",
};

export default function DecodablePage() {
    return (
        <main className="bg-slate-50 min-h-screen">
            <DecodableDashboard />
        </main>
    );
}
