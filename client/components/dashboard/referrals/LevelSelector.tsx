import React from 'react';
import { Users, Loader2, Lock, Unlock, ShieldCheck, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Network } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface LevelSelectorProps {
    levels: Record<string, any>;
    investmentLevels: Record<string, number>;
    maxLevel: number;
    selectedLevel: number;
    onLevelChange: (level: number) => void;
    isInvestmentLoading: boolean;
    levelStatus?: Record<string, any>;
}

export const LevelSelector: React.FC<LevelSelectorProps> = ({
    levels,
    investmentLevels,
    maxLevel,
    selectedLevel,
    onLevelChange,
    isInvestmentLoading,
    levelStatus
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

            <TooltipProvider>
                {/* Mobile: Horizontal Scroll, Desktop: Vertical List */}
                <div className="p-2 flex lg:flex-col overflow-x-auto lg:overflow-visible gap-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent pb-4 lg:pb-2">
                    {Array.from({ length: maxLevel }, (_, i) => i + 1).map((level) => {
                        const levelData = levels[`level_${level}`];
                        const count = levelData?.total || 0;
                        const activeCount = levelData?.active || 0;
                        const inactiveCount = levelData?.inactive || 0;
                        const investAmount = investmentLevels[`level_${level}`] || 0;
                        const isActive = selectedLevel === level;

                        // Priority: levelStatus from level-status API, fallback to levelData from tree-summary
                        const isUnlocked = levelStatus?.[`level_${level}`]
                            ? levelStatus[`level_${level}`].is_unlocked
                            : (levelData?.unlocked !== false);

                        const requiredBusiness = levelStatus?.[`level_${level}`]?.required_business;
                        const currentBusiness = levelStatus?.[`level_${level}`]?.current_team_business;
                        const description = levelStatus?.[`level_${level}`]?.description;

                        return (
                            <Tooltip key={level}>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={() => onLevelChange(level)}
                                        className={cn(
                                            "relative flex flex-col p-3 rounded-xl text-sm transition-all duration-300 w-full shrink-0 lg:shrink text-left",
                                            "group hover:scale-[1.02] active:scale-[0.98]",
                                            "min-w-[140px] sm:min-w-[160px] lg:min-w-0 border",
                                            isActive
                                                ? "bg-primary text-primary-foreground font-medium shadow-lg shadow-primary/25 border-primary z-10"
                                                : isUnlocked
                                                    ? "bg-green-50/40 hover:bg-green-50/60 text-green-700 border-green-200/50 hover:border-green-300"
                                                    : "bg-muted/50 text-muted-foreground grayscale cursor-not-allowed border-transparent opacity-80"
                                        )}
                                    >
                                        <div className="flex items-center justify-between w-full mb-1">
                                            <div className="flex items-center gap-2">
                                                <div className={cn(
                                                    "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors",
                                                    isActive
                                                        ? "bg-white/20 text-white"
                                                        : isUnlocked
                                                            ? "bg-green-100 text-green-600 group-hover:bg-green-200"
                                                            : "bg-neutral-200 text-neutral-500"
                                                )}>
                                                    {isUnlocked ? level : <Lock size={10} />}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-xs leading-none">Level {level}</span>
                                                    {isUnlocked ? (
                                                        <span className={cn(
                                                            "text-[8px] mt-0.5 font-medium flex items-center gap-0.5",
                                                            isActive ? "text-white/80" : "text-green-600"
                                                        )}>
                                                            <ShieldCheck size={8} /> Active
                                                        </span>
                                                    ) : (
                                                        <span className="text-[8px] mt-0.5 font-medium text-red-500 flex items-center gap-0.5">
                                                            <ShieldAlert size={8} /> Locked
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <span className={cn(
                                                "px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors flex items-center gap-1",
                                                isActive ? "bg-white/20 text-white" : "bg-neutral-100 text-neutral-600 group-hover:bg-background"
                                            )}>
                                                {count}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={cn(
                                                "text-[9px] flex items-center gap-0.5",
                                                isActive ? "text-white/80 font-medium" : "text-green-600 font-medium"
                                            )}>
                                                <div className={cn("w-1 h-1 rounded-full", isActive ? "bg-white" : "bg-green-500")} /> {activeCount}
                                            </span>
                                            <span className={cn(
                                                "text-[9px] flex items-center gap-0.5",
                                                isActive ? "text-white/80 font-medium" : "text-red-500 font-medium"
                                            )}>
                                                <div className={cn("w-1 h-1 rounded-full", isActive ? "bg-white" : "bg-red-500")} /> {inactiveCount}
                                            </span>
                                        </div>

                                        <div className={cn(
                                            "flex items-center justify-between w-full pt-2 border-t text-xs",
                                            isActive ? "border-white/20" : "border-border/50"
                                        )}>
                                            <span className={isActive ? "text-white/80" : isUnlocked ? "text-green-600/70" : "text-muted-foreground"}>Invested:</span>
                                            <span className="font-bold flex items-center gap-1">
                                                {isInvestmentLoading ? <Loader2 size={10} className="animate-spin" /> : <span>₹{investAmount.toLocaleString()}</span>}
                                            </span>
                                        </div>

                                        {!isUnlocked && (
                                            <div className="absolute top-1 right-1">
                                                <ShieldAlert size={12} className="text-red-500" />
                                            </div>
                                        )}
                                    </button>
                                </TooltipTrigger>
                                {!isUnlocked && requiredBusiness && (
                                    <TooltipContent side="right">
                                        <p>Requires ₹{requiredBusiness.toLocaleString()} direct investment (Level 1) to unlock</p>
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        );
                    })}
                </div>
            </TooltipProvider>
        </div>
    );
};
