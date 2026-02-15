import { redirect } from 'next/navigation';

export default function IntroCheckoutRedirect() {
    // Redirect to the main checkout with the intro plan pre-selected
    redirect('/checkout?plan=starter_mailer&cycle=month&intro=true');
}
