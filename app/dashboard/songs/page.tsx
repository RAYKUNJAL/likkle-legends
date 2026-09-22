import { redirect } from 'next/navigation';

export default function DashboardSongsRedirect() {
    redirect('/listen');
}
