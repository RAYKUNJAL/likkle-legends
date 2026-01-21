import AnansiGame from '@/components/games/AnansiGame';

export const metadata = {
    title: "Anansi's Web of Words | Likkle Legends",
    description: "Help Anansi spin his web by solving Caribbean riddles!"
};

export default function AnansiWebPage() {
    return (
        <div className="h-[calc(100vh-8rem)] p-4 md:p-8">
            <AnansiGame />
        </div>
    );
}
