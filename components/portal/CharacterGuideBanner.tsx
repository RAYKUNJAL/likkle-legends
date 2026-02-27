'use client';

import { motion } from 'framer-motion';

export type CharacterId = 'roti' | 'tanty_spice' | 'dilly_doubles' | 'benny';

interface CharacterGuideBannerProps {
    character: CharacterId;
    message?: string;
    className?: string;
}

const CHARACTER_CONFIG: Record<CharacterId, {
    name: string;
    avatarUrl: string;
    bg: string;
    border: string;
    nameColor: string;
    ring: string;
    defaultMessage: string;
}> = {
    roti: {
        name: 'R.O.T.I.',
        avatarUrl: '/images/roti-new.jpg',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        nameColor: 'text-emerald-700',
        ring: 'ring-emerald-400',
        defaultMessage: 'Brains on — sunshine mode! Let\'s learn something amazing today.',
    },
    tanty_spice: {
        name: 'Tanty Spice',
        avatarUrl: '/images/tanty_spice_avatar.jpg',
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        nameColor: 'text-orange-700',
        ring: 'ring-orange-400',
        defaultMessage: 'Come nuh, sit down wid me! Tanty has stories for you today.',
    },
    dilly_doubles: {
        name: 'Dilly Doubles',
        avatarUrl: '/images/dilly-doubles.jpg',
        bg: 'bg-sky-50',
        border: 'border-sky-200',
        nameColor: 'text-sky-700',
        ring: 'ring-sky-400',
        defaultMessage: 'Lesss gooo, Legend! Let\'s make some noise and have fun!',
    },
    benny: {
        name: 'Benny',
        avatarUrl: '/images/logo.png',
        bg: 'bg-violet-50',
        border: 'border-violet-200',
        nameColor: 'text-violet-700',
        ring: 'ring-violet-400',
        defaultMessage: 'Shhh... the island has secrets to share. Come explore with me.',
    },
};

export function CharacterGuideBanner({ character, message, className = '' }: CharacterGuideBannerProps) {
    const config = CHARACTER_CONFIG[character];
    const displayMessage = message || config.defaultMessage;

    return (
        <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${config.bg} ${config.border} ${className}`}
        >
            {/* Avatar */}
            <div className={`w-12 h-12 rounded-full overflow-hidden ring-2 ${config.ring} flex-shrink-0 shadow-sm`}>
                <img
                    src={config.avatarUrl}
                    alt={config.name}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Speech bubble */}
            <div className="flex-1 min-w-0">
                <p className={`text-xs font-black uppercase tracking-wide ${config.nameColor} mb-0.5`}>
                    {config.name} says
                </p>
                <p className="text-sm text-gray-700 font-medium leading-snug">
                    "{displayMessage}"
                </p>
            </div>
        </motion.div>
    );
}
