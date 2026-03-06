import { notFound } from 'next/navigation';
import { PrintButton } from './PrintButton';

/* ─── Shared sub-components ─────────────────────────────────────── */

function WorksheetHeader({
    title,
    subtitle,
    emoji,
    instructions,
}: {
    title: string;
    subtitle?: string;
    emoji: string;
    instructions: string;
}) {
    return (
        <div style={{ marginBottom: '24px', borderBottom: '3px solid #fbbf24', paddingBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <span style={{ fontSize: '2.5rem' }}>{emoji}</span>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#1e293b', margin: 0, lineHeight: 1.1 }}>
                        {title}
                    </h1>
                    {subtitle && (
                        <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0', fontWeight: 600 }}>
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>
            <div style={{ display: 'flex', gap: '24px', marginTop: '12px' }}>
                <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Name</span>
                    <div style={{ borderBottom: '2px solid #cbd5e1', marginTop: '4px', height: '24px' }} />
                </div>
                <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Date</span>
                    <div style={{ borderBottom: '2px solid #cbd5e1', marginTop: '4px', height: '24px' }} />
                </div>
            </div>
            <div style={{
                marginTop: '12px', background: '#fef3c7', border: '2px solid #fbbf24',
                borderRadius: '8px', padding: '8px 12px',
                fontSize: '0.8rem', color: '#92400e', fontWeight: 600
            }}>
                📋 {instructions}
            </div>
        </div>
    );
}

function DrawBox({ label, height = 80 }: { label?: string; height?: number }) {
    return (
        <div style={{ marginBottom: '8px' }}>
            {label && <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0 0 4px', fontWeight: 600 }}>{label}</p>}
            <div style={{
                border: '2px dashed #cbd5e1', borderRadius: '8px',
                height: `${height}px`, background: '#f8fafc'
            }} />
        </div>
    );
}

/* ─── Individual Worksheet Components ───────────────────────────── */

function CaribbeanAlphabetAM() {
    const letters = 'ABCDEFGHIJKLM'.split('');
    const words: Record<string, string> = {
        A: 'Aloe', B: 'Breadfruit', C: 'Coconut', D: 'Dasheen',
        E: 'Eddoe', F: 'Flamboyant', G: 'Guava', H: 'Hibiscus',
        I: 'Ixora', J: 'Juniper', K: 'Kale', L: 'Lime', M: 'Mango'
    };
    return (
        <>
            <WorksheetHeader
                emoji="🔤"
                title="Caribbean Alphabet — A to M"
                subtitle="Likkle Legends Learning"
                instructions="Trace each letter, then draw a picture of the Caribbean word in the box!"
            />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                {letters.map(l => (
                    <div key={l} style={{
                        border: '2px solid #e2e8f0', borderRadius: '12px',
                        padding: '10px', textAlign: 'center', background: '#fffbeb'
                    }}>
                        <div style={{ fontSize: '2rem', fontWeight: 900, color: '#f59e0b', lineHeight: 1 }}>{l}</div>
                        <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, marginBottom: '6px' }}>{words[l]}</div>
                        <div style={{ border: '2px dashed #fbbf24', borderRadius: '6px', height: '60px', background: '#fef9ee' }} />
                    </div>
                ))}
                <div style={{ border: '2px solid #e2e8f0', borderRadius: '12px', padding: '10px', background: '#f0fdf4', gridColumn: 'span 1' }}>
                    <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#166534', margin: 0 }}>🌴 Did you know?</p>
                    <p style={{ fontSize: '0.65rem', color: '#15803d', margin: '4px 0 0' }}>
                        Mangoes grow all across the Caribbean! Jamaica, Trinidad, and Barbados all have their own special kinds.
                    </p>
                </div>
            </div>
        </>
    );
}

function CaribbeanAlphabetNZ() {
    const letters = 'NOPQRSTUVWXYZ'.split('');
    const words: Record<string, string> = {
        N: 'Nutmeg', O: 'Okra', P: 'Papaya', Q: 'Queenfish',
        R: 'Rose Apple', S: 'Soursop', T: 'Tamarind', U: 'Ugli Fruit',
        V: 'Vanilla', W: 'Watermelon', X: 'Ximenia', Y: 'Yam', Z: 'Zucchini'
    };
    return (
        <>
            <WorksheetHeader
                emoji="🔤"
                title="Caribbean Alphabet — N to Z"
                subtitle="Likkle Legends Learning"
                instructions="Trace each letter, then draw a picture of the Caribbean word in the box!"
            />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                {letters.map(l => (
                    <div key={l} style={{
                        border: '2px solid #e2e8f0', borderRadius: '12px',
                        padding: '10px', textAlign: 'center', background: '#fffbeb'
                    }}>
                        <div style={{ fontSize: '2rem', fontWeight: 900, color: '#f59e0b', lineHeight: 1 }}>{l}</div>
                        <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, marginBottom: '6px' }}>{words[l]}</div>
                        <div style={{ border: '2px dashed #fbbf24', borderRadius: '6px', height: '60px', background: '#fef9ee' }} />
                    </div>
                ))}
            </div>
            <div style={{ marginTop: '16px', background: '#fef3c7', border: '2px solid #fbbf24', borderRadius: '8px', padding: '10px' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#92400e', margin: '0 0 4px' }}>🌿 Fun Fact!</p>
                <p style={{ fontSize: '0.7rem', color: '#78350f', margin: 0 }}>
                    Nutmeg is grown in Grenada — they even have a nutmeg on their flag! Soursop is used to make delicious juice and ice cream across the islands.
                </p>
            </div>
        </>
    );
}

function CountTheCoconuts() {
    const rows = [
        { count: 1 }, { count: 2 }, { count: 3 }, { count: 4 }, { count: 5 },
        { count: 6 }, { count: 7 }, { count: 8 }, { count: 9 }, { count: 10 },
    ];
    return (
        <>
            <WorksheetHeader
                emoji="🥥"
                title="Count the Coconuts!"
                subtitle="Likkle Legends Learning — Numbers 1–10"
                instructions="Count the coconuts in each row and write the number in the box!"
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {rows.map(row => (
                    <div key={row.count} style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        background: '#fffbeb', border: '2px solid #fde68a',
                        borderRadius: '10px', padding: '8px 12px'
                    }}>
                        <div style={{ display: 'flex', gap: '6px', flex: 1, flexWrap: 'wrap' }}>
                            {Array.from({ length: row.count }).map((_, i) => (
                                <span key={i} style={{ fontSize: '1.5rem' }}>🥥</span>
                            ))}
                        </div>
                        <div style={{
                            border: '3px solid #fbbf24', borderRadius: '8px',
                            width: '48px', height: '48px', background: 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600
                        }}>
                            write
                        </div>
                    </div>
                ))}
            </div>
            <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ background: '#ecfdf5', border: '2px solid #6ee7b7', borderRadius: '8px', padding: '10px' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#065f46', margin: '0 0 4px' }}>BONUS: Draw 5 coconuts here!</p>
                    <div style={{ border: '2px dashed #6ee7b7', borderRadius: '6px', height: '60px' }} />
                </div>
                <div style={{ background: '#eff6ff', border: '2px solid #93c5fd', borderRadius: '8px', padding: '10px' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e40af', margin: '0 0 4px' }}>BONUS: Draw 10 coconuts here!</p>
                    <div style={{ border: '2px dashed #93c5fd', borderRadius: '6px', height: '60px' }} />
                </div>
            </div>
        </>
    );
}

function IslandAnimalsMatching() {
    const animals = [
        { animal: '🦜 Parrot', island: 'St. Vincent' },
        { animal: '🐢 Leatherback Turtle', island: 'Trinidad' },
        { animal: '🦎 Green Iguana', island: 'Jamaica' },
        { animal: '🐦 Rufous-throated Solitaire', island: 'Dominica' },
        { animal: '🦩 Flamingo', island: 'Bonaire' },
        { animal: '🐊 Spectacled Caiman', island: 'Guyana' },
        { animal: '🦈 Nurse Shark', island: 'Belize' },
        { animal: '🐟 Flying Fish', island: 'Barbados' },
    ];
    const shuffledIslands = [...animals].sort(() => 0.5 - Math.random()).map(a => a.island);
    return (
        <>
            <WorksheetHeader
                emoji="🦎"
                title="Island Animals Matching"
                subtitle="Likkle Legends Learning — Caribbean Wildlife"
                instructions="Draw a line matching each animal to the island where it lives!"
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 1fr', gap: '8px', alignItems: 'center' }}>
                <div style={{ fontWeight: 800, fontSize: '0.75rem', color: '#475569', textAlign: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '6px' }}>Animal</div>
                <div />
                <div style={{ fontWeight: 800, fontSize: '0.75rem', color: '#475569', textAlign: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '6px' }}>Island Home</div>
                {animals.map((item, i) => (
                    <>
                        <div key={`a-${i}`} style={{
                            background: '#fffbeb', border: '2px solid #fde68a', borderRadius: '8px',
                            padding: '8px 12px', fontSize: '0.8rem', fontWeight: 600, color: '#1e293b'
                        }}>
                            {item.animal}
                        </div>
                        <div key={`line-${i}`} style={{ borderBottom: '2px dotted #cbd5e1', height: '1px', margin: '0 4px', alignSelf: 'center' }} />
                        <div key={`i-${i}`} style={{
                            background: '#eff6ff', border: '2px solid #bfdbfe', borderRadius: '8px',
                            padding: '8px 12px', fontSize: '0.8rem', fontWeight: 600, color: '#1e293b'
                        }}>
                            🌴 {animals[i].island}
                        </div>
                    </>
                ))}
            </div>
            <p style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '12px', textAlign: 'center' }}>
                * Note: Lines shown above — on printed version, draw your own lines connecting each pair!
            </p>
        </>
    );
}

function HeritageIslandMap() {
    return (
        <>
            <WorksheetHeader
                emoji="🗺️"
                title="My Heritage Island Map"
                subtitle="Likkle Legends Learning — Caribbean Geography"
                instructions="Label the islands you know, colour in your family's homeland, and answer the questions below!"
            />
            {/* Simplified Caribbean map outline using SVG */}
            <div style={{ border: '3px solid #e2e8f0', borderRadius: '12px', padding: '12px', background: '#eff6ff', marginBottom: '16px' }}>
                <svg viewBox="0 0 500 260" style={{ width: '100%', height: 'auto', maxHeight: '200px' }}>
                    {/* Ocean background */}
                    <rect width="500" height="260" fill="#dbeafe" />
                    {/* Cuba */}
                    <ellipse cx="180" cy="80" rx="70" ry="22" fill="#fef3c7" stroke="#fbbf24" strokeWidth="2" />
                    <text x="180" y="84" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#92400e">Cuba</text>
                    {/* Jamaica */}
                    <ellipse cx="195" cy="120" rx="25" ry="14" fill="#d1fae5" stroke="#34d399" strokeWidth="2" />
                    <text x="195" y="124" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#065f46">Jamaica</text>
                    {/* Haiti / DR */}
                    <ellipse cx="270" cy="95" rx="38" ry="18" fill="#fce7f3" stroke="#f472b6" strokeWidth="2" />
                    <text x="264" y="99" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#9d174d">Haiti/DR</text>
                    {/* Puerto Rico */}
                    <ellipse cx="335" cy="100" rx="18" ry="12" fill="#ede9fe" stroke="#a78bfa" strokeWidth="2" />
                    <text x="335" y="103" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#4c1d95">PR</text>
                    {/* Lesser Antilles chain */}
                    {[
                        { x: 370, y: 118, label: 'USVI' },
                        { x: 380, y: 135, label: 'Antig.' },
                        { x: 388, y: 155, label: 'Guad.' },
                        { x: 395, y: 175, label: 'Dom.' },
                        { x: 400, y: 195, label: 'Mart.' },
                        { x: 404, y: 215, label: 'St. Luc.' },
                        { x: 407, y: 232, label: 'St. Vin.' },
                        { x: 408, y: 248, label: 'Gren.' },
                    ].map((isle, i) => (
                        <g key={i}>
                            <circle cx={isle.x} cy={isle.y} r="8" fill="#fef9c3" stroke="#fbbf24" strokeWidth="1.5" />
                            <text x={isle.x - 14} y={isle.y + 3} fontSize="6" fill="#78350f">{isle.label}</text>
                        </g>
                    ))}
                    {/* Trinidad */}
                    <ellipse cx="415" cy="200" rx="10" ry="8" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1.5" />
                    <text x="430" y="203" fontSize="7" fill="#78350f">T&T</text>
                    {/* Barbados */}
                    <circle cx="432" cy="188" r="7" fill="#ffe4e6" stroke="#fb7185" strokeWidth="1.5" />
                    <text x="442" y="191" fontSize="7" fill="#9f1239">Bdos</text>
                    {/* Bahamas */}
                    <ellipse cx="240" cy="58" rx="30" ry="10" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="1.5" />
                    <text x="240" y="62" textAnchor="middle" fontSize="7" fill="#0c4a6e">Bahamas</text>
                    {/* Belize / Central America coast */}
                    <rect x="80" y="110" width="25" height="40" rx="5" fill="#dcfce7" stroke="#4ade80" strokeWidth="1.5" />
                    <text x="87" y="132" fontSize="6" fill="#166534">Bze</text>
                    {/* Guyana / mainland */}
                    <rect x="310" y="235" width="80" height="20" rx="4" fill="#fafafa" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4,2" />
                    <text x="350" y="248" textAnchor="middle" fontSize="7" fill="#475569">South America</text>
                    {/* Compass rose */}
                    <text x="460" y="48" fontSize="20" textAnchor="middle">🧭</text>
                    <text x="460" y="62" fontSize="7" textAnchor="middle" fill="#475569">North</text>
                </svg>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                    'Which island is my family from?',
                    'Name 3 islands you can find on the map:',
                    'Which sea surrounds the Caribbean islands?',
                    'Draw and colour the flag of your island below:',
                ].map((q, i) => (
                    <div key={i} style={{ background: '#fffbeb', border: '2px solid #fde68a', borderRadius: '8px', padding: '10px' }}>
                        <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#92400e', margin: '0 0 6px' }}>{i + 1}. {q}</p>
                        <div style={{ border: '2px dashed #fbbf24', borderRadius: '6px', height: '50px', background: 'white' }} />
                    </div>
                ))}
            </div>
        </>
    );
}

function PatoisWordMatching() {
    const pairs = [
        { patois: 'Likkle', english: 'Little / Small' },
        { patois: 'Wah gwaan?', english: 'What\'s going on?' },
        { patois: 'Dutty', english: 'Dirty' },
        { patois: 'Irie', english: 'Everything is good' },
        { patois: 'Lick mi lipreez', english: 'It\'s very tasty' },
        { patois: 'Mi deh yah', english: 'I\'m here / I\'m fine' },
        { patois: 'Nuh badda', english: 'Don\'t bother' },
        { patois: 'Pickney', english: 'Child / Children' },
        { patois: 'Soon come', english: 'Coming shortly' },
        { patois: 'Leggo', english: 'Let\'s go!' },
    ];
    return (
        <>
            <WorksheetHeader
                emoji="💬"
                title="Patois Word Matching"
                subtitle="Likkle Legends Learning — Caribbean Languages"
                instructions="Draw a line to match each Patois / Creole word or phrase to its English meaning!"
            />
            <div style={{ background: '#fef3c7', border: '2px solid #fbbf24', borderRadius: '8px', padding: '8px 12px', marginBottom: '14px', fontSize: '0.72rem', color: '#78350f' }}>
                🌍 Patois (also called Jamaican Creole) is a language that blends English with African languages. It grew from the rich cultural heritage of enslaved Africans brought to the Caribbean.
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 40px 1fr', gap: '6px', alignItems: 'center' }}>
                <div style={{ fontWeight: 800, fontSize: '0.72rem', color: '#475569', paddingBottom: '6px', borderBottom: '2px solid #fde68a' }}>Patois / Creole</div>
                <div />
                <div style={{ fontWeight: 800, fontSize: '0.72rem', color: '#475569', paddingBottom: '6px', borderBottom: '2px solid #fde68a' }}>English Meaning</div>
                {pairs.map((pair, i) => (
                    <>
                        <div key={`p-${i}`} style={{
                            background: '#fffbeb', border: '2px solid #fde68a', borderRadius: '6px',
                            padding: '6px 10px', fontSize: '0.78rem', fontWeight: 700, color: '#1e293b'
                        }}>
                            {pair.patois}
                        </div>
                        <div key={`dot-${i}`} style={{ textAlign: 'center', color: '#cbd5e1', fontSize: '1.2rem' }}>•</div>
                        <div key={`e-${i}`} style={{
                            background: '#f0fdf4', border: '2px solid #bbf7d0', borderRadius: '6px',
                            padding: '6px 10px', fontSize: '0.78rem', fontWeight: 600, color: '#1e293b'
                        }}>
                            {pairs[pairs.length - 1 - i].english}
                        </div>
                    </>
                ))}
            </div>
        </>
    );
}

function CaribbeanFruitsColoring() {
    const fruits = [
        { name: 'Mango', emoji: '🥭', fact: 'Sweet and juicy!' },
        { name: 'Coconut', emoji: '🥥', fact: 'Has coconut water inside!' },
        { name: 'Papaya', emoji: '🫐', fact: 'Orange inside, full of vitamins!' },
        { name: 'Soursop', emoji: '💚', fact: 'Spiky green skin, creamy white inside' },
        { name: 'Guava', emoji: '💛', fact: 'Pink inside, sweet-tart!' },
        { name: 'Star Fruit', emoji: '⭐', fact: 'Shaped like a star when sliced!' },
        { name: 'Tamarind', emoji: '🟤', fact: 'Sour pod used in cooking' },
        { name: 'Sugar Apple', emoji: '💚', fact: 'Bumpy outside, sweet custard inside' },
        { name: 'Plantain', emoji: '🍌', fact: 'Like a banana — fried or boiled!' },
    ];
    return (
        <>
            <WorksheetHeader
                emoji="🥭"
                title="Caribbean Fruits Coloring Page"
                subtitle="Likkle Legends Learning — Island Fruits"
                instructions="Draw each fruit in its box, then colour it in with the correct colours!"
            />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {fruits.map(fruit => (
                    <div key={fruit.name} style={{
                        border: '3px solid #fde68a', borderRadius: '12px',
                        overflow: 'hidden', background: '#fffbeb'
                    }}>
                        <div style={{ background: '#fef3c7', padding: '6px', textAlign: 'center', borderBottom: '2px solid #fde68a' }}>
                            <p style={{ margin: 0, fontWeight: 900, fontSize: '0.85rem', color: '#92400e' }}>{fruit.name}</p>
                        </div>
                        {/* Drawing area */}
                        <div style={{ height: '90px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: '3rem', opacity: 0.15 }}>{fruit.emoji}</span>
                        </div>
                        <div style={{ padding: '6px', background: '#fef9ee' }}>
                            <p style={{ margin: 0, fontSize: '0.6rem', color: '#78350f', textAlign: 'center', fontStyle: 'italic' }}>{fruit.fact}</p>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}

function AnansiStorySequencing() {
    const panels = [
        { num: '_', title: 'Anansi sees the Sky God with all the world\'s stories locked in a golden box. Anansi wants them!' },
        { num: '_', title: 'Sky God sets three impossible tasks: catch Onini the Python, capture Osebo the Leopard, and bring 47 hornets.' },
        { num: '_', title: 'Clever Anansi tricks Onini by pretending a branch is longer than the snake. Onini gets tied up!' },
        { num: '_', title: 'Anansi digs a pit and covers it with leaves. Osebo falls in and is captured.' },
        { num: '_', title: 'Anansi fills a gourd with water, pretending it is raining. The hornets fly inside to stay dry!' },
        { num: '_', title: 'Anansi returns all three to Sky God, who gives him the golden box. Now Anansi OWNS all the world\'s stories!' },
    ];
    return (
        <>
            <WorksheetHeader
                emoji="🕷️"
                title="Anansi & the Sky God's Stories"
                subtitle="Likkle Legends Learning — Story Sequencing"
                instructions="Read each panel. Number them 1–6 in the correct order to retell the story!"
            />
            <div style={{ background: '#fef3c7', border: '2px solid #fbbf24', borderRadius: '8px', padding: '8px 12px', marginBottom: '14px', fontSize: '0.72rem', color: '#78350f' }}>
                🌍 Anansi the Spider is a legendary trickster from West African (Ashanti) folklore, brought to the Caribbean by enslaved Africans. He is the keeper of all stories!
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {panels.map((panel, i) => (
                    <div key={i} style={{
                        border: '2px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden', background: 'white'
                    }}>
                        <div style={{ background: '#f8fafc', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '2px solid #e2e8f0' }}>
                            <div style={{
                                width: '32px', height: '32px', border: '2px solid #fbbf24', borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 900, fontSize: '1rem', color: '#92400e', background: '#fffbeb'
                            }}>
                                {panel.num}
                            </div>
                            <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600 }}>Write the order number above ↑</span>
                        </div>
                        <div style={{ padding: '10px', minHeight: '70px' }}>
                            <p style={{ margin: 0, fontSize: '0.72rem', color: '#334155', fontWeight: 600, lineHeight: 1.5 }}>{panel.title}</p>
                        </div>
                        <div style={{ padding: '6px 10px', borderTop: '2px solid #e2e8f0', background: '#fafafa' }}>
                            <p style={{ margin: 0, fontSize: '0.65rem', color: '#94a3b8' }}>Draw a picture:</p>
                            <div style={{ border: '1px dashed #cbd5e1', borderRadius: '4px', height: '40px', marginTop: '4px' }} />
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}

function CaribbeanNumberBonds() {
    const bonds = [
        { total: 10, a: 6, b: null },
        { total: 10, a: null, b: 3 },
        { total: 10, a: 7, b: null },
        { total: 10, a: null, b: 8 },
        { total: 10, a: 4, b: null },
        { total: 5, a: 2, b: null },
        { total: 5, a: null, b: 1 },
        { total: 8, a: 5, b: null },
        { total: 8, a: null, b: 6 },
        { total: 10, a: null, b: 10 },
    ];
    const scenarios = [
        '🥭 mangoes in a basket',
        '🥥 coconuts on a tree',
        '🐟 fish in a net',
        '🌺 flowers in a garden',
        '🦜 parrots in a tree',
        '🍌 bananas in a bunch',
        '⭐ stars in the sky',
        '🐠 fish in the sea',
        '🌴 palm trees on the beach',
        '💧 raindrops on a leaf',
    ];
    return (
        <>
            <WorksheetHeader
                emoji="🔢"
                title="Caribbean Number Bonds to 10"
                subtitle="Likkle Legends Learning — Addition"
                instructions="Fill in the missing number to complete each number bond! Use the Caribbean pictures to help you count."
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {bonds.map((bond, i) => (
                    <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        background: i % 2 === 0 ? '#fffbeb' : '#f0fdf4',
                        border: `2px solid ${i % 2 === 0 ? '#fde68a' : '#bbf7d0'}`,
                        borderRadius: '10px', padding: '8px 14px'
                    }}>
                        <span style={{ fontSize: '1.2rem', minWidth: '30px' }}>{scenarios[i].split(' ')[0]}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, fontWeight: 700, fontSize: '1rem' }}>
                            {bond.a !== null ? (
                                <span style={{ color: '#1e293b', minWidth: '24px', textAlign: 'center' }}>{bond.a}</span>
                            ) : (
                                <div style={{ border: '2px solid #fbbf24', borderRadius: '4px', width: '36px', height: '36px', background: 'white' }} />
                            )}
                            <span style={{ color: '#64748b' }}>+</span>
                            {bond.b !== null ? (
                                <span style={{ color: '#1e293b', minWidth: '24px', textAlign: 'center' }}>{bond.b}</span>
                            ) : (
                                <div style={{ border: '2px solid #fbbf24', borderRadius: '4px', width: '36px', height: '36px', background: 'white' }} />
                            )}
                            <span style={{ color: '#64748b' }}>=</span>
                            <span style={{ color: '#f59e0b', fontWeight: 900, fontSize: '1.1rem' }}>{bond.total}</span>
                        </div>
                        <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontStyle: 'italic', textAlign: 'right', maxWidth: '100px' }}>
                            {scenarios[i].split(' ').slice(1).join(' ')}
                        </span>
                    </div>
                ))}
            </div>
        </>
    );
}

function FamilyHeritageTree() {
    return (
        <>
            <WorksheetHeader
                emoji="🌳"
                title="My Family Heritage Tree"
                subtitle="Likkle Legends Learning — Family & Culture"
                instructions="Fill in your family tree! Write names, islands, and draw faces in each leaf!"
            />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                {/* Me */}
                <div style={{ background: '#fef3c7', border: '3px solid #fbbf24', borderRadius: '16px', padding: '10px 20px', textAlign: 'center', width: '180px' }}>
                    <p style={{ margin: '0 0 4px', fontSize: '0.7rem', color: '#92400e', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>That's Me! 🌟</p>
                    <div style={{ border: '2px dashed #fbbf24', borderRadius: '8px', height: '50px', background: 'white', marginBottom: '4px' }} />
                    <div style={{ borderBottom: '2px solid #fbbf24', marginTop: '4px', height: '20px' }} />
                    <p style={{ margin: '2px 0 0', fontSize: '0.6rem', color: '#78350f' }}>My island heritage:</p>
                </div>

                {/* Connector */}
                <div style={{ width: '2px', height: '20px', background: '#fbbf24' }} />

                {/* Parents row */}
                <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
                    {['Mum / Parent 1', 'Dad / Parent 2'].map((label, i) => (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{
                                background: i === 0 ? '#fce7f3' : '#dbeafe',
                                border: `2px solid ${i === 0 ? '#f9a8d4' : '#93c5fd'}`,
                                borderRadius: '12px', padding: '8px 12px', width: '150px', textAlign: 'center'
                            }}>
                                <p style={{ margin: '0 0 4px', fontSize: '0.65rem', fontWeight: 700, color: i === 0 ? '#9d174d' : '#1e40af' }}>{label}</p>
                                <div style={{ border: '2px dashed #cbd5e1', borderRadius: '6px', height: '40px', background: 'white', marginBottom: '4px' }} />
                                <div style={{ borderBottom: '2px solid #e2e8f0', height: '18px' }} />
                                <p style={{ margin: '2px 0 0', fontSize: '0.55rem', color: '#64748b' }}>Island:</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Connector */}
                <div style={{ width: '2px', height: '20px', background: '#fbbf24' }} />

                {/* Grandparents row */}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {['Grandma (Mum side)', 'Grandpa (Mum side)', 'Grandma (Dad side)', 'Grandpa (Dad side)'].map((label, i) => (
                        <div key={i} style={{
                            background: '#f0fdf4', border: '2px solid #86efac',
                            borderRadius: '10px', padding: '6px 10px', width: '110px', textAlign: 'center'
                        }}>
                            <p style={{ margin: '0 0 4px', fontSize: '0.55rem', fontWeight: 700, color: '#166534' }}>{label}</p>
                            <div style={{ border: '2px dashed #86efac', borderRadius: '6px', height: '35px', background: 'white', marginBottom: '4px' }} />
                            <div style={{ borderBottom: '1px solid #86efac', height: '14px' }} />
                            <p style={{ margin: '2px 0 0', fontSize: '0.5rem', color: '#64748b' }}>Island:</p>
                        </div>
                    ))}
                </div>
            </div>
            <div style={{ marginTop: '14px', background: '#fef3c7', border: '2px solid #fbbf24', borderRadius: '8px', padding: '8px 12px' }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#92400e', margin: '0 0 4px' }}>🌴 My Caribbean Heritage Story:</p>
                <div style={{ border: '2px dashed #fbbf24', borderRadius: '6px', height: '50px', background: 'white' }} />
            </div>
        </>
    );
}

function CarnivalCostumeDesign() {
    return (
        <>
            <WorksheetHeader
                emoji="🎭"
                title="Design Your Carnival Costume"
                subtitle="Likkle Legends Learning — Caribbean Culture & Art"
                instructions="Design an amazing Carnival costume for this character! Use bright colours and add feathers, jewels, and beads!"
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {/* Main costume figure */}
                <div>
                    <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>🎨 Design your costume here:</p>
                    <div style={{ border: '3px solid #fde68a', borderRadius: '12px', background: '#fffbeb', padding: '8px', position: 'relative' }}>
                        <svg viewBox="0 0 160 260" style={{ width: '100%', height: 'auto' }}>
                            {/* Simple figure outline */}
                            {/* Head */}
                            <circle cx="80" cy="35" r="28" fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeDasharray="4,2" />
                            {/* Neck */}
                            <rect x="73" y="62" width="14" height="12" fill="none" stroke="#fbbf24" strokeWidth="2" strokeDasharray="4,2" />
                            {/* Body / Torso */}
                            <path d="M50 74 L50 145 L110 145 L110 74 Z" fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeDasharray="4,2" />
                            {/* Arms */}
                            <line x1="50" y1="80" x2="20" y2="130" stroke="#fbbf24" strokeWidth="2.5" strokeDasharray="4,2" />
                            <line x1="110" y1="80" x2="140" y2="130" stroke="#fbbf24" strokeWidth="2.5" strokeDasharray="4,2" />
                            {/* Skirt/pants */}
                            <path d="M50 145 L35 240 L75 240 L80 180 L85 240 L125 240 L110 145 Z" fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeDasharray="4,2" />
                            {/* Decoration prompts */}
                            <text x="80" y="108" textAnchor="middle" fontSize="8" fill="#d97706" opacity="0.5">draw costume here</text>
                            <text x="80" y="198" textAnchor="middle" fontSize="8" fill="#d97706" opacity="0.5">draw legs/skirt</text>
                        </svg>
                    </div>
                </div>

                {/* Design notes panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', margin: 0 }}>📝 Design Notes:</p>
                    {[
                        { label: 'My costume theme:', lines: 1 },
                        { label: 'Main colours:', lines: 1 },
                        { label: 'Special decorations (feathers, beads, gems, etc.):', lines: 2 },
                        { label: 'My character name:', lines: 1 },
                        { label: 'Which island carnival is this for?', lines: 1 },
                    ].map((item, i) => (
                        <div key={i} style={{ background: i % 2 === 0 ? '#fffbeb' : '#f0fdf4', border: `2px solid ${i % 2 === 0 ? '#fde68a' : '#bbf7d0'}`, borderRadius: '8px', padding: '8px' }}>
                            <p style={{ margin: '0 0 4px', fontSize: '0.65rem', fontWeight: 700, color: '#475569' }}>{item.label}</p>
                            {Array.from({ length: item.lines }).map((_, li) => (
                                <div key={li} style={{ borderBottom: '2px solid #cbd5e1', marginTop: li > 0 ? '8px' : '0', height: '22px' }} />
                            ))}
                        </div>
                    ))}
                    <div style={{ background: '#fef3c7', border: '2px solid #fbbf24', borderRadius: '8px', padding: '8px' }}>
                        <p style={{ margin: '0 0 4px', fontSize: '0.65rem', fontWeight: 700, color: '#92400e' }}>🌴 Fun Fact:</p>
                        <p style={{ margin: 0, fontSize: '0.6rem', color: '#78350f' }}>
                            Caribbean Carnival began in Trinidad and Tobago! Costumes can take months to make and cost thousands of dollars. They celebrate African heritage, freedom, and creativity!
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}

function CaribbeanWeatherJournal() {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const weatherOptions = ['☀️ Sunny', '⛅ Partly Cloudy', '🌧️ Rainy', '⛈️ Stormy', '🌈 Rainbow', '🌬️ Windy', '🌦️ Showers'];
    return (
        <>
            <WorksheetHeader
                emoji="🌤️"
                title="My Caribbean Weather Journal"
                subtitle="Likkle Legends Learning — Science & Nature"
                instructions="For one week, record the weather every day! Tick the weather, write the temperature, and draw what you see outside!"
            />
            <div style={{ background: '#eff6ff', border: '2px solid #bfdbfe', borderRadius: '8px', padding: '8px 12px', marginBottom: '12px', fontSize: '0.72rem', color: '#1e40af' }}>
                🌡️ Ask a grown-up to help you find today's temperature! You can check the weather app or look at a thermometer outside.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {days.map((day, i) => (
                    <div key={day} style={{
                        border: `2px solid ${i % 2 === 0 ? '#fde68a' : '#bfdbfe'}`,
                        borderRadius: '10px', background: i % 2 === 0 ? '#fffbeb' : '#eff6ff',
                        padding: '8px 12px'
                    }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr 70px 80px', gap: '8px', alignItems: 'center' }}>
                            <p style={{ margin: 0, fontWeight: 900, fontSize: '0.78rem', color: '#1e293b' }}>{day}</p>
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                {weatherOptions.slice(0, 4).map(w => (
                                    <label key={w} style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.6rem', color: '#475569', cursor: 'pointer' }}>
                                        <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '1.5px solid #94a3b8', borderRadius: '3px', background: 'white', flexShrink: 0 }} />
                                        {w}
                                    </label>
                                ))}
                            </div>
                            <div>
                                <p style={{ margin: '0 0 2px', fontSize: '0.55rem', color: '#94a3b8', fontWeight: 600 }}>Temp °C</p>
                                <div style={{ border: '2px solid #cbd5e1', borderRadius: '4px', height: '22px', background: 'white' }} />
                            </div>
                            <div>
                                <p style={{ margin: '0 0 2px', fontSize: '0.55rem', color: '#94a3b8', fontWeight: 600 }}>Draw it!</p>
                                <div style={{ border: '2px dashed #cbd5e1', borderRadius: '4px', height: '30px', background: 'white' }} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ background: '#fef3c7', border: '2px solid #fbbf24', borderRadius: '8px', padding: '8px' }}>
                    <p style={{ margin: '0 0 4px', fontSize: '0.7rem', fontWeight: 700, color: '#92400e' }}>Which day was hottest?</p>
                    <div style={{ borderBottom: '2px solid #fbbf24', height: '22px' }} />
                </div>
                <div style={{ background: '#f0fdf4', border: '2px solid #86efac', borderRadius: '8px', padding: '8px' }}>
                    <p style={{ margin: '0 0 4px', fontSize: '0.7rem', fontWeight: 700, color: '#166534' }}>How many sunny days?</p>
                    <div style={{ borderBottom: '2px solid #86efac', height: '22px' }} />
                </div>
            </div>
        </>
    );
}

/* ─── Worksheet Registry ─────────────────────────────────────────── */

const WORKSHEETS: Record<string, { title: string; component: React.ReactNode }> = {
    'caribbean-alphabet-a-m': {
        title: 'Caribbean Alphabet A–M',
        component: <CaribbeanAlphabetAM />,
    },
    'caribbean-alphabet-n-z': {
        title: 'Caribbean Alphabet N–Z',
        component: <CaribbeanAlphabetNZ />,
    },
    'count-the-coconuts': {
        title: 'Count the Coconuts',
        component: <CountTheCoconuts />,
    },
    'island-animals-matching': {
        title: 'Island Animals Matching',
        component: <IslandAnimalsMatching />,
    },
    'my-heritage-island-map': {
        title: 'My Heritage Island Map',
        component: <HeritageIslandMap />,
    },
    'patois-word-matching': {
        title: 'Patois Word Matching',
        component: <PatoisWordMatching />,
    },
    'caribbean-fruits-coloring': {
        title: 'Caribbean Fruits Coloring',
        component: <CaribbeanFruitsColoring />,
    },
    'anansi-story-sequencing': {
        title: 'Anansi Story Sequencing',
        component: <AnansiStorySequencing />,
    },
    'caribbean-number-bonds': {
        title: 'Caribbean Number Bonds',
        component: <CaribbeanNumberBonds />,
    },
    'my-family-heritage-tree': {
        title: 'My Family Heritage Tree',
        component: <FamilyHeritageTree />,
    },
    'carnival-costume-design': {
        title: 'Carnival Costume Design',
        component: <CarnivalCostumeDesign />,
    },
    'caribbean-weather-journal': {
        title: 'Caribbean Weather Journal',
        component: <CaribbeanWeatherJournal />,
    },
};

/* ─── Page ───────────────────────────────────────────────────────── */

export default function PrintablePage({ params }: { params: { slug: string } }) {
    const worksheet = WORKSHEETS[params.slug];
    if (!worksheet) notFound();

    return (
        <>
            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { margin: 0; padding: 0; }
                    .print-page { box-shadow: none !important; margin: 0 !important; border-radius: 0 !important; padding: 1.5cm !important; }
                }
                @page { margin: 0; size: A4; }
            `}</style>

            {/* Print button (hidden on print) */}
            <PrintButton />

            {/* Back link */}
            <div className="no-print fixed top-4 left-4 z-50">
                <a
                    href="/portal"
                    className="flex items-center gap-2 bg-white border-2 border-slate-200 text-slate-600 font-bold px-4 py-2 rounded-xl shadow hover:bg-slate-50 text-sm transition-all"
                >
                    ← Back to Portal
                </a>
            </div>

            {/* A4 Page */}
            <div className="min-h-screen bg-slate-100 flex items-start justify-center py-12 px-4">
                <div
                    className="print-page bg-white shadow-2xl rounded-2xl"
                    style={{
                        width: '210mm',
                        minHeight: '297mm',
                        padding: '1.5cm',
                        boxSizing: 'border-box',
                        fontFamily: '"Segoe UI", Arial, sans-serif',
                    }}
                >
                    {/* Likkle Legends branding header */}
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        marginBottom: '16px', paddingBottom: '10px', borderBottom: '2px solid #f1f5f9'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '1.2rem' }}>🌴</span>
                            <div>
                                <p style={{ margin: 0, fontWeight: 900, fontSize: '0.85rem', color: '#1e293b' }}>Likkle Legends</p>
                                <p style={{ margin: 0, fontSize: '0.6rem', color: '#94a3b8', fontWeight: 600 }}>Caribbean Learning for Likkle Ones</p>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ margin: 0, fontSize: '0.6rem', color: '#94a3b8' }}>Free Printable Worksheet</p>
                            <p style={{ margin: 0, fontSize: '0.6rem', color: '#94a3b8' }}>likkle-legends.com</p>
                        </div>
                    </div>

                    {worksheet.component}

                    {/* Footer */}
                    <div style={{
                        marginTop: '20px', paddingTop: '10px', borderTop: '2px solid #f1f5f9',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                        <p style={{ margin: 0, fontSize: '0.6rem', color: '#cbd5e1' }}>
                            © Likkle Legends · {worksheet.title} · likkle-legends.com
                        </p>
                        <p style={{ margin: 0, fontSize: '0.6rem', color: '#cbd5e1' }}>
                            🌴 Celebrating Caribbean Culture & Learning
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}

export function generateStaticParams() {
    return Object.keys(WORKSHEETS).map(slug => ({ slug }));
}
