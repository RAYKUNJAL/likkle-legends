import { supabaseAdmin } from "@/lib/supabase-client";

export const dynamic = 'force-dynamic';

export default async function DiagnosePage() {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const hasKey = !!serviceKey;
    const keyPreview = serviceKey ? `${serviceKey.substring(0, 5)}...${serviceKey.substring(serviceKey.length - 5)}` : 'MISSING';
    const keyLength = serviceKey?.length || 0;

    let adminCheckResult = "Pending";
    let adminCheckError = null;

    try {
        if (hasKey) {
            const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1 });
            if (error) {
                adminCheckResult = "FAILED";
                adminCheckError = error.message;
            } else {
                adminCheckResult = "SUCCESS";
            }
        }
    } catch (err: any) {
        adminCheckResult = "EXCEPTION";
        adminCheckError = err.message;
    }

    return (
        <div style={{ padding: '40px', fontFamily: 'monospace', maxWidth: '800px', margin: '0 auto' }}>
            <h1>Diagnostics</h1>

            <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
                <h2>Environment Variables</h2>
                <p><strong>SUPABASE_SERVICE_ROLE_KEY:</strong> {hasKey ? '✅ Present' : '❌ MISSING'}</p>
                <p><strong>Key Preview:</strong> {keyPreview}</p>
                <p><strong>Key Length:</strong> {keyLength} chars (Should be approx 200+ for JWT)</p>
            </div>

            <div style={{ background: '#e0f7fa', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
                <h2>Admin Client Test</h2>
                <p><strong>Operation:</strong> listUsers()</p>
                <p><strong>Status:</strong> {adminCheckResult}</p>
                {adminCheckError && (
                    <p style={{ color: 'red', fontWeight: 'bold' }}>Error: {adminCheckError}</p>
                )}
            </div>

            <p style={{ marginTop: '20px', color: '#666' }}>
                If "Key Preview" does not match your Supabase Dashboard "service_role" key,
                you have the wrong key in Vercel Environment Variables.
            </p>
        </div>
    );
}
