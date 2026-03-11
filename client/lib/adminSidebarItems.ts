
import {
    LayoutDashboard,
    Users,
    DollarSign,
    FileText,
    Settings,
    ArrowLeftRight,
    BookOpen,
    CheckCircle,
    Layers,
    MessageSquareQuote,
    TrendingDown,
    TrendingUp,
    Wallet,
    Bell
} from "lucide-react";

export const adminSidebarItems = [
    { label: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
    {
        label: 'User Management',
        href: '/admin/dashboard/users',
        icon: Users,
        subItems: [
            { label: 'Users', href: '/admin/dashboard/users', icon: Users },
            { label: 'KYC Fields', href: '/admin/dashboard/kyc/fields', icon: FileText },
            { label: 'KYC Submissions', href: '/admin/dashboard/kyc/submissions', icon: CheckCircle },
        ]
    },
    { label: 'Wallet Requests', href: '/admin/dashboard/wallet-requests', icon: Wallet },
    { label: 'Notifications', href: '/admin/dashboard/notifications', icon: Bell },
    { label: 'Investments', href: '/admin/dashboard/transfers', icon: ArrowLeftRight },
    { label: 'Deposits', href: '/admin/dashboard/deposits', icon: ArrowLeftRight },
    { label: 'Withdrawals', href: '/admin/dashboard/withdrawals', icon: TrendingDown },
    { label: 'Payout Reports', href: '/admin/dashboard/payouts', icon: FileText },
    // { label: 'Financials', href: '/admin/dashboard/revenue', icon: DollarSign }, 
    { label: 'Blogs', href: '/admin/dashboard/blogs', icon: BookOpen },
    { label: 'Sliders', href: '/admin/dashboard/sliders', icon: Layers },
    { label: 'Testimonials', href: '/admin/dashboard/testimonials', icon: MessageSquareQuote },
    { label: 'System Settings', href: '/admin/dashboard/settings', icon: Settings },
];
