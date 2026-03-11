import { redirect } from 'next/navigation';

export default function ReferralsPage() {
    redirect('/dashboard/referrals/dashboard');
}


export const revalidate = 3600;
