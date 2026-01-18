# 🌐 DNS Setup Guide - Go Live with Likkle Legends

## Overview

You need to point your custom domain `likklelegends.com` to your Vercel deployment to go live.

---

## Step 1: Add Domain in Vercel

### 1.1 Access Vercel Dashboard
1. Go to **https://vercel.com/dashboard**
2. Find your project: **likkle-legends** (or similar)
3. Click on the project

### 1.2 Add Custom Domain
1. Go to **Settings** → **Domains**
2. Click **"Add Domain"**
3. Enter: `likklelegends.com`
4. Click **Add**
5. Repeat for `www.likklelegends.com`

### 1.3 Get DNS Records
Vercel will show you the DNS records you need. They typically look like:

**For Root Domain (`likklelegends.com`)**:
```
Type: A
Name: @
Value: 76.76.21.21
```

**For WWW Subdomain (`www.likklelegends.com`)**:
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

---

## Step 2: Configure DNS at Your Domain Registrar

### Find Your Domain Registrar
Check where `likklelegends.com` is registered:
- GoDaddy
- Namecheap
- Google Domains
- Cloudflare
- NameSilo
- Other

I'll need to know which one to give specific instructions.

---

## GoDaddy DNS Setup (If applicable)

1. Go to **https://dcc.godaddy.com/manage/dns**
2. Find `likklelegends.com` and click **DNS**
3. Add/Edit the following records:

### Add A Record for Root Domain
```
Type: A
Name: @
Value: 76.76.21.21
TTL: 600 seconds (or default)
```

### Add CNAME for WWW
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 600 seconds
```

### Delete Conflicting Records
- Remove any existing A records for `@`
- Remove any existing CNAME for `www`
- Keep NS (nameserver) records - DO NOT delete these!

4. Click **Save**

---

## Namecheap DNS Setup (If applicable)

1. Go to **https://ap.www.namecheap.com/domains/list**
2. Click **Manage** next to `likklelegends.com`
3. Go to **Advanced DNS** tab

### Add A Record
```
Type: A Record
Host: @
Value: 76.76.21.21
TTL: Automatic
```

### Add CNAME
```
Type: CNAME Record
Host: www
Value: cname.vercel-dns.com
TTL: Automatic
```

4. Click **Save All Changes**

---

## Cloudflare DNS Setup (If applicable)

1. Go to **https://dash.cloudflare.com**
2. Select `likklelegends.com`
3. Go to **DNS** → **Records**

### Add A Record
```
Type: A
Name: @
IPv4 address: 76.76.21.21
Proxy status: DNS only (grey cloud)
TTL: Auto
```

### Add CNAME
```
Type: CNAME
Name: www
Target: cname.vercel-dns.com
Proxy status: DNS only (grey cloud)
TTL: Auto
```

**IMPORTANT**: Use **DNS only** (grey cloud), NOT proxied (orange cloud) initially

4. Click **Save**

---

## Step 3: Verify DNS Configuration

### 3.1 Check DNS Propagation
Test your DNS using these tools:
- **https://dnschecker.org** - Enter `likklelegends.com`
- **https://www.whatsmydns.net** - Check A record propagation

### 3.2 Command Line Check (Windows)
```powershell
# Check A record
nslookup likklelegends.com

# Check CNAME
nslookup www.likklelegends.com
```

### 3.3 Expected Results
```
likklelegends.com → 76.76.21.21 (Vercel IP)
www.likklelegends.com → cname.vercel-dns.com
```

---

## Step 4: Verify in Vercel

1. Go back to **Vercel Dashboard** → **Settings** → **Domains**
2. Wait for verification (can take 1-48 hours, usually under 1 hour)
3. Status should change from **"Pending"** to **"Valid"**
4. Vercel will automatically provision SSL certificate

---

## Step 5: Enable HTTPS & Redirects

### 5.1 Force HTTPS
In Vercel:
1. **Settings** → **Domains**
2. Enable **"Force HTTPS"** for both domains
3. This auto-redirects HTTP to HTTPS

### 5.2 Set Primary Domain
1. Choose which is primary:
   - `likklelegends.com` (root)
   - `www.likklelegends.com` (www)
2. Mark one as **"Primary"**
3. Vercel will auto-redirect the other

**Recommendation**: Use `www.likklelegends.com` as primary for better performance

---

## Common Issues & Troubleshooting

### Issue 1: Domain Not Verifying
**Cause**: DNS not propagated yet
**Solution**: Wait 1-24 hours, then refresh

### Issue 2: SSL Certificate Error
**Cause**: Vercel waiting for DNS verification
**Solution**: Once DNS verifies, SSL provisions automatically (5-10 min)

### Issue 3: Wrong IP Address
**Cause**: Cached old DNS
**Solution**: 
```powershell
ipconfig /flushdns
```

### Issue 4: "Domain Already in Use"
**Cause**: Domain linked to another Vercel project
**Solution**: Remove from old project first

### Issue 5: Cloudflare Proxied
**Cause**: Orange cloud enabled
**Solution**: Change to grey cloud (DNS only) initially

---

## Complete DNS Record Template

Copy these to your DNS provider:

```
# A Record (Root Domain)
Type: A
Name: @ (or leave blank)
Value: 76.76.21.21
TTL: 600 or Automatic

# CNAME (WWW Subdomain)
Type: CNAME  
Name: www
Value: cname.vercel-dns.com
TTL: 600 or Automatic

# Keep these (do not delete):
- NS records (nameservers)
- SOA record (start of authority)
```

---

## Timeline

1. **Add domain in Vercel**: 2 minutes
2. **Update DNS records**: 5 minutes  
3. **DNS propagation**: 10 minutes - 48 hours (typically 30 min - 2 hours)
4. **SSL certificate**: Auto (5-10 min after DNS verifies)
5. **Go live**: Immediately after SSL provisions

---

## Quick Checklist

- [ ] Log into Vercel dashboard
- [ ] Add `likklelegends.com` in Domains
- [ ] Add `www.likklelegends.com` in Domains
- [ ] Copy DNS records from Vercel
- [ ] Log into domain registrar
- [ ] Add A record: `@` → `76.76.21.21`
- [ ] Add CNAME: `www` → `cname.vercel-dns.com`
- [ ] Save DNS changes
- [ ] Wait for propagation (test with dnschecker.org)
- [ ] Verify in Vercel (status: Valid)
- [ ] Enable Force HTTPS
- [ ] Set primary domain
- [ ] Test: https://likklelegends.com
- [ ] Test: https://www.likklelegends.com

---

## Need Help?

**Which domain registrar are you using?** Tell me and I can give you exact step-by-step screenshots for your specific provider:

- GoDaddy
- Namecheap
- Google Domains
- Cloudflare
- Other: ___________

Once you tell me, I'll guide you through the exact clicks!

---

## After Going Live

1. **Test all pages**:
   ```
   https://likklelegends.com
   https://www.likklelegends.com/portal
   https://likklelegends.com/admin
   https://likklelegends.com/parent
   ```

2. **Update environment variables** (if needed):
   - Update `NEXT_PUBLIC_SITE_URL` in Vercel env vars
   - Redeploy if necessary

3. **Submit to search engines**:
   - Google Search Console
   - Bing Webmaster Tools

4. **Monitor**:
   - Check Vercel Analytics
   - Monitor errors in Sentry (if configured)

Your platform is ready to go live! 🚀
