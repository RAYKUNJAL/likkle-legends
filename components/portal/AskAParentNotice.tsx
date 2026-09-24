/**
 * Child routes must not offer a purchase. Parents pay from /checkout.
 */
export function AskAParentNotice({ className = '' }: { className?: string }) {
    return (
        <p className={`text-sm font-bold ${className}`}>
            Ask a parent to unlock this. Buying is not available on this page.
        </p>
    );
}
