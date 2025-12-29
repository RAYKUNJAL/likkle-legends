import { Mail, ShieldCheck, Laptop, Award, Palette, GraduationCap } from 'lucide-react';

const features = [
    {
        icon: <Mail className="w-8 h-8" />,
        title: "Personalized Letter",
        desc: "A story-driven message from a Likkle Legend character, tailored to your child's age track.",
        color: "bg-orange-100 text-orange-600"
    },
    {
        icon: <ShieldCheck className="w-8 h-8" />,
        title: "Card & Coloring",
        desc: "Collectible cultural flashcards and creative coloring pages to bring the story to life.",
        color: "bg-blue-100 text-blue-600"
    },
    {
        icon: <Laptop className="w-8 h-8" />,
        title: "Digital Universe",
        desc: "Unlock lessons, interactive stories, and Missions in our private age-based portal.",
        color: "bg-pink-100 text-pink-600"
    },
    {
        icon: <GraduationCap className="w-8 h-8" />,
        title: "AI Reading Buddy",
        desc: "Gemini-powered buddy that listens to your child read and provides gentle feedback.",
        color: "bg-purple-100 text-purple-600"
    }
];

export default function Features() {
    return (
        <section id="how-it-works" className="py-24">
            <div className="container">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((f, i) => (
                        <div key={i} className="p-8 rounded-3xl bg-white border border-border shadow-sm hover:shadow-md transition-shadow group">
                            <div className={`w-14 h-14 ${f.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                {f.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                            <p className="text-deep/70 text-sm leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
