import {
    LayoutDashboard,
    PieChart,
    FileText,
    ArrowLeftRight,
    Wallet,
    Settings,
    Users,
    Shield,
    MessageSquareQuote,
    TrendingUp
} from 'lucide-react';

export const userSidebarItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Financial Summary', href: '/dashboard/wallet', icon: Wallet },
    { label: 'Investments', href: '/dashboard/investments', icon: TrendingUp },
    { label: 'New Investment', href: '/dashboard/transfers', icon: PieChart },
    { label: 'Payout Details', href: '/dashboard/payout-details', icon: FileText },
    // { label: 'Weekly Report', href: '/dashboard/weekly-report', icon: PieChart },
    { label: 'Profile', href: '/dashboard/profile', icon: Settings },
    {
        label: 'My Network',
        href: '#',
        icon: Users,
        subItems: [
            { label: 'Referral Dashboard', href: '/dashboard/referrals/dashboard', icon: LayoutDashboard },
            { label: 'Generation View', href: '/dashboard/referrals/generation-view', icon: Users },
            { label: 'Direct Distributor', href: '/dashboard/referrals/direct-distributor', icon: Users } // Using Users for now, can change if needed
        ]
    },
    { label: 'KYC Verification', href: '/dashboard/kyc', icon: Shield },
    { label: 'Testimonials', href: '/dashboard/testimonials', icon: MessageSquareQuote },
];
