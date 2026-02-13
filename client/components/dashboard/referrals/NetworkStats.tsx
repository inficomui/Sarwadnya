import React from 'react';
import { TrendingUp } from 'lucide-react';

interface NetworkStatsProps {
    totalReferrals: number;
    totalTeamInvestment: number;
    levels: Record<string, number>;
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
                            const count = levels[`level_${level}`] || 0;
                            const investAmount = investmentLevels[`level_${level}`] || 0;
                            const percentage = totalReferrals > 0 ? (count / totalReferrals) * 100 : 0;

                            return (
                                <div key={level} className="group">
                                    <div className="flex items-center justify-between text-xs mb-1">
                                        <span className="text-muted-foreground font-medium">L{level}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-foreground font-semibold">{count}</span>
                                            <span className="text-muted-foreground">•</span>
                                            <span className="text-green-600 font-mono text-[10px]">₹{investAmount.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-linear-to-r from-primary to-purple-600 rounded-full transition-all duration-500"
                                            style={{ width: `${percentage}%` }}
                                        />
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
