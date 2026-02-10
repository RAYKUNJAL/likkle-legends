
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Clients
const publicClient = createClient(supabaseUrl, anonKey);
const adminClient = createClient(supabaseUrl, serviceKey);

async function smokeTest() {
    console.log("🚦 SMOKE TEST: Starting Full User Journey Simulation...\n");
    let passed = true;

    // 1. SIGNUP (Simulated via Admin to skip email verification for test)
    console.log("👤 Step 1: User Signup");
    const email = `smoke_test_${Date.now()}@example.com`;
    const password = 'password123';

    // Create user
    const { data: userData, error: userError } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: 'Test Parent' }
    });

    if (userError) {
        console.error("❌ Failed to create user:", userError.message);
        return;
    }
    const userId = userData.user.id;
    console.log(`✅ User created: ${email} (${userId})`);

    // 2. PROFILE & CHILD SETUP
    console.log("\n👶 Step 2: Child Profile Setup");
    // Check if profile auto-created (Trigger check)
    await new Promise(r => setTimeout(r, 1000)); // Wait for trigger
    const { data: profile } = await adminClient.from('profiles').select('*').eq('id', userId).single();

    if (!profile) {
        console.error("❌ Profile trigger failed - Profile not found.");
        passed = false;
    } else {
        console.log(`✅ Profile found: ${profile.full_name}`);
    }

    // Add Child
    const { data: child, error: childError } = await adminClient.from('children').insert({
        parent_id: userId,
        first_name: 'Simba',
        age: 5,
        age_track: 'mini',
        primary_island: 'Jamaica'
    }).select().single();

    if (childError) {
        console.error("❌ Failed to create child:", childError.message);
        passed = false;
    } else {
        console.log(`✅ Child created: ${child.first_name}`);
    }

    // 3. LOG IN AS USER (Get Session)
    console.log("\n🔐 Step 3: User Login & Public Access");
    const { data: loginData, error: loginError } = await publicClient.auth.signInWithPassword({
        email,
        password
    });

    if (loginError) {
        console.error("❌ Login failed:", loginError.message);
        return;
    }
    console.log("✅ Logged in successfully");

    // 4. ACCESS CONTENT (RLS Check)
    console.log("\n📚 Step 4: Accessing Content (Storybooks)");
    // Acting as the logged in user
    const userClient = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: `Bearer ${loginData.session.access_token}` } }
    });

    const { data: stories, error: contentError } = await userClient
        .from('storybooks')
        .select('title')
        .limit(3);

    if (contentError) {
        console.error("❌ Content Access REJECTED:", contentError.message);
        passed = false;
    } else {
        console.log(`✅ Access Granted! Found ${stories.length} stories.`);
        stories.forEach(s => console.log(`   - ${s.title}`));
    }

    // 5. GROWTH ENGINE (Referral Code)
    console.log("\n🌱 Step 5: Growth Engine (Referral Code)");
    // Try to get referral code (usually stored in metadata or just user ID for parents)
    // We'll simulated generating it via server action logic check

    // For parents, their referral code is often their User ID or a mapped code.
    // Let's check `referral_credits` table access for this user.
    const { data: credits, error: creditError } = await userClient
        .from('referral_credits')
        .select('*');

    if (creditError) {
        console.error("❌ Growth Engine Access REJECTED:", creditError.message);
        passed = false;
    } else {
        console.log("✅ Referral System Accessible.");
    }

    // CLEANUP
    console.log("\n🧹 Cleanup...");
    await adminClient.auth.admin.deleteUser(userId);
    console.log("✅ Test User Deleted");

    console.log("\n" + "=".repeat(30));
    console.log(passed ? "🚀 SMOKE TEST PASSED" : "💥 SMOKE TEST FAILED");
    console.log("=".repeat(30));
}

smokeTest();
