
import '../lib/load-env';

console.log('--- ENV DEBUG ---');
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
console.log('SUPABASE_SERVICE_ROLE_KEY exists:', !!serviceKey);
if (serviceKey) {
    console.log('Length:', serviceKey.length);
    console.log('First 10 chars:', serviceKey.substring(0, 10));
    console.log('Last 5 chars:', serviceKey.substring(serviceKey.length - 5));
    console.log('Is trimmed?', serviceKey === serviceKey.trim());
    console.log('Starts with quote?', serviceKey.startsWith('"'));
    console.log('Ends with quote?', serviceKey.endsWith('"'));
} else {
    console.log('Keys available:', Object.keys(process.env).filter(k => k.includes('SUPABASE')));
}
console.log('--- END DEBUG ---');
