import React from 'react';
import { GraduationCap, PawPrint } from 'lucide-react';

export default function PetClassLogo({ className = '', size = 'normal', type = 'light', iconOnly = false }) {
    // Definimos os tamanhos reais para não quebrar o layout com transform: scale
    const sizes = {
        small: {
            capBox: 'w-6 h-6 rounded-lg -mr-2 ring-1',
            capIcon: 12,
            pawBox: 'w-8 h-8 ring-2',
            pawIcon: 16,
            text: 'text-[1.1rem]',
            gap: 'gap-2'
        },
        normal: {
            capBox: 'w-8 h-8 rounded-xl -mr-3 ring-1',
            capIcon: 16,
            pawBox: 'w-11 h-11 ring-4',
            pawIcon: 22,
            text: 'text-[1.5rem]',
            gap: 'gap-3'
        },
        large: {
            capBox: 'w-10 h-10 rounded-xl -mr-3 ring-1',
            capIcon: 20,
            pawBox: 'w-14 h-14 ring-4',
            pawIcon: 28,
            text: 'text-[1.8rem]',
            gap: 'gap-4'
        },
        xl: {
            capBox: 'w-12 h-12 rounded-2xl -mr-4 ring-2',
            capIcon: 24,
            pawBox: 'w-16 h-16 ring-[5px]',
            pawIcon: 32,
            text: 'text-[2.4rem]',
            gap: 'gap-4'
        }
    };

    const s = sizes[size] || sizes.normal;
    const textColor = type === 'dark' ? 'text-gray-800' : 'text-white';

    return (
        <div className={`flex items-center ${s.gap} ${className}`}>
            {/* Grupo de Ícones */}
            <div className={`relative flex items-center justify-center shrink-0`}>
                {/* Quadrado branco com capelo ao fundo */}
                <div className={`${s.capBox} bg-white shadow-md flex items-center justify-center z-0 ring-gray-100/50`}>
                    <GraduationCap size={s.capIcon} strokeWidth={2.5} className="text-[#0B1120]" />
                </div>

                {/* Círculo verde em degradê com patinha na frente */}
                <div className={`${s.pawBox} bg-gradient-to-br from-[#34D399] via-[#129151] to-[#064E29] rounded-full flex items-center justify-center z-10 shadow-lg ring-white/10`}>
                    <PawPrint size={s.pawIcon} strokeWidth={2.5} className="text-white transform -rotate-12" />
                </div>
            </div>

            {/* Texto Empilhado */}
            {!iconOnly && (
                <div className={`flex flex-col items-start justify-center ${textColor} ${s.text} pt-0.5`}>
                    <span className="font-extrabold tracking-wide leading-none uppercase" style={{ fontFamily: '"Nunito", "Segoe UI", Roboto, sans-serif' }}>
                        PET
                    </span>
                    <span className="font-medium tracking-[0.18em] leading-tight text-[0.45em] uppercase opacity-90 -mt-0.5">
                        CLASS
                    </span>
                </div>
            )}
        </div>
    );
}
