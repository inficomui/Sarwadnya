import React from 'react';
import { TrendingUp } from 'lucide-react';

interface NetworkStatsProps {
    totalReferrals: number;
    totalTeamInvestment: number;
    levels: Record<string, any>;
    investmentLevels: Record<string, number>;
    maxLevel: number;
}

export const NetworkStats: React.FC<NetworkStatsProps> = ({
    totalReferrals,
    totalTeamInvestment,
    levels,
    investmentLevels,
    maxLevel
}) => {
    return (
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
            <div className="p-4 bg-muted/30 border-b border-border">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <TrendingUp size={16} className="text-primary" />
                    <span>Network Summary</span>
                </h3>
            </div>
            <div className="p-4 space-y-3">
                {/* Total Stats */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted/30 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">Total Members</p>
                        <p className="text-xl font-bold text-primary">{totalReferrals}</p>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">Total Investment</p>
                        <p className="text-xl font-bold text-green-600">₹{totalTeamInvestment.toLocaleString()}</p>
                    </div>
                </div>

                {/* Level Breakdown */}
                <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Level Breakdown</p>
                    <div className="space-y-1.5 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent pr-1">
                        {Array.from({ length: maxLevel }, (_, i) => i + 1).map((level) => {
                            const levelData = levels[`level_${level}`];
                            const count = levelData?.total || 0;
                            const activeCount = levelData?.active || 0;
                            const inactiveCount = levelData?.inactive || 0;
                            const investAmount = investmentLevels[`level_${level}`] || 0;
                            const percentage = totalReferrals > 0 ? (count / totalReferrals) * 100 : 0;
                            const activePercentage = count > 0 ? (activeCount / count) * 100 : 0;

                            return (
                                <div key={level} className="group p-2 rounded-xl hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center justify-between text-xs mb-1.5">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-foreground">L{level}</span>
                                            <span className="text-muted-foreground">•</span>
                                            <span className="text-foreground/80">{count} Members</span>
                                        </div>
                                        <span className="text-green-600 font-bold">₹{investAmount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center gap-3 mb-1.5">
                                        <div className="flex items-center gap-1.5 flex-1">
                                            <div className="h-1 flex-1 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-green-500 rounded-full transition-all duration-700"
                                                    style={{ width: `${activePercentage}%` }}
                                                />
                                            </div>
                                            <span className="text-[10px] text-green-600 font-medium min-w-[12px]">{activeCount}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 flex-1">
                                            <div className="h-1 flex-1 bg-muted rounded-full overflow-hidden text-right">
                                                <div
                                                    className="h-full bg-red-400 rounded-full transition-all duration-700 ml-auto"
                                                    style={{ width: `${count > 0 ? (inactiveCount / count) * 100 : 0}%` }}
                                                />
                                            </div>
                                            <span className="text-[10px] text-red-500 font-medium min-w-[12px]">{inactiveCount}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
