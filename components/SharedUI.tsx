import React, { useState, useEffect, useRef } from 'react';

interface SafeZoneProps {
    children?: React.ReactNode;
    name?: string;
}

interface SafeZoneState {
    hasError: boolean;
}

/**
 * SafeZone Component
 * Handles error boundaries for village sections.
 */
export class SafeZone extends React.Component<SafeZoneProps, SafeZoneState> {
    public state: SafeZoneState = { hasError: false };
    public readonly props: SafeZoneProps;

    constructor(props: SafeZoneProps) {
        super(props);
        this.props = props;
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error: any, errorInfo: any) {
        console.error(`[SAFEZONE] Crash in ${this.props.name || 'Component'}:`, error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-20 text-center bg-blue-50 rounded-[3rem] border-4 border-dashed border-blue-200">
                    <div className="text-6xl mb-6">🥥</div>
                    <h3 className="text-2xl font-heading font-black text-blue-950 mb-2">Island Storm!</h3>
                    <p className="text-blue-900/50 font-bold mb-8">This part of the village is currently being swept. Please refresh or try again later.</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-blue-600 text-white px-8 py-3 rounded-full font-black text-sm shadow-lg hover:bg-blue-700 transition-all"
                    >
                        Refresh Village
                    </button>
                </div>
            );
        }
        return this.props.children || null;
    }
}

interface ParentGateProps {
    isOpen: boolean;
    onSuccess: () => void;
    onClose: () => void;
}

export const ParentGate: React.FC<ParentGateProps> = ({ isOpen, onSuccess, onClose }) => {
    const [question, setQuestion] = useState<{ q: string; a: number }>({ q: '2 + 2', a: 4 });
    const [answer, setAnswer] = useState('');
    const [error, setError] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const n1 = Math.floor(Math.random() * 8) + 2;
            const n2 = Math.floor(Math.random() * 8) + 2;
            setQuestion({ q: `What is ${n1} + ${n2}?`, a: n1 + n2 });
            setAnswer('');
            setError(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const checkAnswer = () => {
        if (parseInt(answer) === question.a) {
            onSuccess();
        } else {
            setError(true);
            setTimeout(() => setError(false), 1000);
            setAnswer('');
        }
    };

    return (
        <div className="fixed inset-0 z-[999] bg-blue-950/90 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="bg-white w-full max-sm rounded-[2.5rem] p-8 shadow-2xl relative text-center">
                <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-full text-gray-400 font-bold hover:bg-gray-200">✕</button>

                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
                    🔒
                </div>

                <h3 className="text-2xl font-heading font-black text-blue-950 mb-2">Parents Only</h3>
                <p className="text-sm font-bold text-blue-900/50 mb-6">Please solve this to continue to the Parent Zone.</p>

                <div className="bg-blue-50 p-6 rounded-2xl mb-6">
                    <p className="text-3xl font-heading font-black text-blue-950 mb-4">{question.q}</p>
                    <div className="flex gap-2">
                        <input
                            type="tel"
                            autoFocus
                            className={`w-full p-4 rounded-xl text-center font-black text-xl outline-none border-2 transition-all ${error ? 'border-red-500 bg-red-50' : 'border-blue-200 focus:border-blue-500'}`}
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            placeholder="?"
                            onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
                        />
                    </div>
                </div>

                <button
                    onClick={checkAnswer}
                    className="w-full bg-blue-950 text-white py-4 rounded-2xl font-black shadow-lg hover:scale-105 active:scale-95 transition-all"
                >
                    Enter Zone
                </button>
            </div>
        </div>
    );
};

export const ConfettiCanvas: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles: any[] = [];
        const colors = ['#FB8500', '#FFB703', '#219EBC', '#8ECAE6', '#FF006E'];

        for (let i = 0; i < 150; i++) {
            particles.push({
                x: canvas.width / 2,
                y: canvas.height / 2,
                vx: (Math.random() - 0.5) * 20,
                vy: (Math.random() - 0.5) * 20,
                size: Math.random() * 10 + 5,
                color: colors[Math.floor(Math.random() * colors.length)],
                gravity: 0.5,
                drag: 0.95
            });
        }

        const animate = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let active = false;

            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += p.gravity;
                p.vx *= p.drag;
                p.vy *= p.drag;

                ctx.fillStyle = p.color;
                ctx.fillRect(p.x, p.y, p.size, p.size);

                if (p.y < canvas.height) active = true;
            });

            if (active) requestAnimationFrame(animate);
        };

        animate();
    }, []);

    return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[1000]" />;
};
