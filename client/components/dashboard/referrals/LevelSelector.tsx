import React from 'react';
import { Users, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Network } from 'lucide-react';

interface LevelSelectorProps {
    levels: Record<string, number>;
    investmentLevels: Record<string, number>;
    maxLevel: number;
    selectedLevel: number;
    onLevelChange: (level: number) => void;
    isInvestmentLoading: boolean;
}

export const LevelSelector: React.FC<LevelSelectorProps> = ({
    levels,
    investmentLevels,
    maxLevel,
    selectedLevel,
    onLevelChange,
    isInvestmentLoading
}) => {
    return (
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
            <div className="p-4 bg-muted/30 border-b border-border flex justify-between items-center">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Network size={16} className="text-primary" />
                    <span>Levels</span>
                </h3>
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">1-{maxLevel}</span>
            </div>

            {/* Mobile: Horizontal Scroll, Desktop: Vertical List */}
            <div className="p-2 flex lg:flex-col overflow-x-auto lg:overflow-visible gap-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent pb-4 lg:pb-2">
                {Array.from({ length: maxLevel }, (_, i) => i + 1).map((level) => {
                    const count = levels[`level_${level}`] || 0;
                    const investAmount = investmentLevels[`level_${level}`] || 0;
                    const isActive = selectedLevel === level;
                    return (
                        <button
                            key={level}
                            onClick={() => onLevelChange(level)}
                            className={cn(
                                "relative flex flex-col p-3 rounded-xl text-sm transition-all duration-300 w-full shrink-0 lg:shrink text-left",
                                "group hover:scale-[1.02] active:scale-[0.98]",
                                "min-w-[140px] sm:min-w-[160px] lg:min-w-0 border",
                                isActive
                                    ? "bg-primary text-primary-foreground font-medium shadow-lg shadow-primary/25 border-primary z-10"
                                    : "bg-card hover:bg-muted text-muted-foreground hover:text-foreground border-transparent hover:border-border"
                            )}
                        >
                            <div className="flex items-center justify-between w-full mb-2">
                                <div className="flex items-center gap-2">
                                    <div className={cn(
                                        "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors",
                                        isActive ? "bg-white/20 text-white" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                                    )}>
                                        {level}
                                    </div>
                                    <span className="font-semibold">Level {level}</span>
                                </div>
                                <span className={cn(
                                    "px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors flex items-center gap-1",
                                    isActive ? "bg-white/20 text-white" : "bg-muted text-muted-foreground group-hover:bg-background"
                                )}>
                                    <Users size={10} />
                                    {count}
                                </span>
                            </div>

                            <div className={cn(
                                "flex items-center justify-between w-full pt-2 border-t text-xs",
                                isActive ? "border-white/20" : "border-border/50"
                            )}>
                                <span className={isActive ? "text-white/80" : "text-muted-foreground"}>Invested:</span>
                                <span className="font-bold flex items-center gap-1">
                                    {isInvestmentLoading ? <Loader2 size={10} className="animate-spin" /> : <span>₹{investAmount.toLocaleString()}</span>}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
