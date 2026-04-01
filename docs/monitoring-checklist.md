# Post-Launch Monitoring Checklist

This document provides a structured monitoring plan for Likkle Legends production deployment. Use this checklist to ensure system health and catch issues early.

## Daily Checks (First Week Post-Launch)

### Application Health
- [ ] Vercel deployment status - Check no failed builds
- [ ] Homepage loads without errors - Visit https://likkle-legends.vercel.app
- [ ] Auth flow works - Test Google OAuth sign-in
- [ ] Portal loads for authenticated users

### Error Tracking
- [ ] Check Sentry dashboard for new errors
- [ ] Review error count vs baseline
- [ ] Check for any unhandled exceptions
- [ ] Look for console errors in browser DevTools

### Database Health
- [ ] Supabase connection status - Check admin dashboard
- [ ] Database connection count is normal (< 20 connections)
- [ ] No slow queries in logs (> 1 second)
- [ ] Backup status - Verify last backup completed

### User Experience
- [ ] Spot-check user signup flow
- [ ] Test admin content generation functionality
- [ ] Verify PayPal transaction processing works
- [ ] Test email delivery (send yourself a test email)
- [ ] Check story audio generation works
- [ ] Verify buddy chat responses come back quickly

### Performance
- [ ] Page load time < 3 seconds
- [ ] No layout shift issues observed
- [ ] Image optimization is working
- [ ] API responses complete within timeout

## Weekly Checks (Ongoing)

### Error Analysis
- [ ] Review Sentry error trends
- [ ] Identify patterns in errors
- [ ] Check if any errors need immediate attention
- [ ] Group similar errors and prioritize fixes
- [ ] Review resolved errors for regression risk

### Database Performance
- [ ] Review Supabase performance metrics
- [ ] Check database size growth rate
- [ ] Verify indexes are being used
- [ ] Check for any missing indexes
- [ ] Review connection pool utilization

### Uptime & Availability
- [ ] Check UptimeRobot stats (if configured)
- [ ] Verify SLA compliance
- [ ] Any unexpected downtime? Investigate
- [ ] Verify SSL certificate validity

### Feature Testing
- [ ] Test critical user flows end-to-end
- [ ] Verify premium content gating works
- [ ] Test story reading with audio
- [ ] Test buddy chat functionality
- [ ] Verify game zone works correctly
- [ ] Test printables download

### Security
- [ ] Review audit logs for suspicious activity
- [ ] Check for failed login attempts
- [ ] Verify no unauthorized API access
- [ ] Check PayPal webhook logs for anomalies

## Monthly Checks (Ongoing)

### Comprehensive Testing
- [ ] Full accessibility recheck (keyboard nav, screen reader)
- [ ] Test all payment flows end-to-end
- [ ] Verify email templates rendering correctly
- [ ] Test mobile responsiveness across devices
- [ ] Verify all features for both free and premium tiers

### Performance Analysis
- [ ] Measure Core Web Vitals (LCP, FID, CLS)
- [ ] Identify slow API endpoints
- [ ] Analyze database query performance
- [ ] Check bundle size trends
- [ ] Review memory/CPU usage

### Security Audit
- [ ] Verify all secrets still secured in env vars
- [ ] Check for exposed credentials in logs
- [ ] Review IAM roles and permissions
- [ ] Verify CORS headers are correct
- [ ] Check for SQL injection vulnerabilities

### Data & Backup
- [ ] Verify backup strategy is working
- [ ] Test restore procedure (non-prod)
- [ ] Check data retention policies
- [ ] Verify GDPR compliance measures
- [ ] Review sensitive data encryption

### Infrastructure
- [ ] Verify Vercel build performance
- [ ] Check deployment frequency & success rate
- [ ] Review environment variables for rotation
- [ ] Verify database sizing is appropriate
- [ ] Check rate limiting is working

## Critical Issues Checklist

If you observe any of these, escalate immediately:

- [ ] Sentry reports > 10 errors per hour
- [ ] Database connection pool exhausted
- [ ] PayPal integration failing
- [ ] Auth system returning 500 errors
- [ ] Page load times > 10 seconds consistently
- [ ] User reports cannot access portal
- [ ] Audit logs show suspicious activity
- [ ] Backup has not completed in 24+ hours

## Monitoring Tools Setup

### Sentry (Error Tracking)
- Dashboard: https://sentry.io
- Project: Likkle Legends
- Set error threshold alerts at: 50 errors/day
- Set resolution time alerts at: 7 days

### Vercel (Deployment Monitoring)
- Dashboard: https://vercel.com
- Check: Deployments tab for latest status
- Set build timeout: 15 minutes
- Set runtime alerts: enabled

### Supabase (Database Monitoring)
- Dashboard: https://supabase.com
- Monitoring tab for connection health
- Query performance logs
- Backup verification

### UptimeRobot (Optional Uptime)
- Monitor: https://likkle-legends.vercel.app
- Check frequency: 5 minutes
- Alert: Email on downtime
- Expected uptime: 99.5%+

## Response Procedures

### If Error Count Spikes
1. Check Sentry for error pattern
2. Identify affected feature/endpoint
3. Check Vercel logs for deployment issues
4. Verify database is responding
5. Check external API status (Google, Anthropic, PayPal)
6. If critical: Execute rollback procedure (see rollback-plan.md)

### If Database Issues
1. Check Supabase connection count
2. Check for long-running queries
3. Verify indexes exist on queried columns
4. Check replica lag (if applicable)
5. Restart connection pool if needed
6. Contact Supabase support if unresolved

### If Payment Processing Fails
1. Check PayPal webhook logs
2. Verify PayPal API credentials valid
3. Check for rate limiting
4. Verify encryption/signing certificates
5. Process failed transactions manually if needed
6. Notify affected customers

### If Auth System Down
1. Check Google OAuth status
2. Verify Supabase session tokens valid
3. Check auth middleware logs
4. Verify JWT secret not rotated unexpectedly
5. Hard refresh browser cache
6. Execute rollback to last known good version

## Escalation Path

- **Level 1 (Non-critical)**: Monitor and resolve within 24 hours
- **Level 2 (Moderate)**: Resolve within 4 hours
- **Level 3 (Critical)**: Resolve immediately or execute rollback

Contact escalation for Level 3 issues:
- Tech lead: [Contact info]
- On-call engineer: [Contact info]
- Deployment manager: [Contact info]

## Post-Incident Review

After any issue:
1. Document timeline of events
2. Identify root cause
3. List prevention measures
4. Update runbook/procedure if needed
5. Share learnings with team
6. Update this checklist if new patterns emerge

---

**Last Updated**: April 1, 2026
**Next Review**: April 8, 2026
