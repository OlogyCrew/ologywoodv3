# Connecting ologywood.com from GoDaddy to Manus - Complete Guide

## Overview

This guide walks you through connecting your **ologywood.com** domain from GoDaddy to your Manus-hosted Ologywood application using the **nameserver method** (Option A).

**Method**: Update GoDaddy nameservers to point to Manus  
**Time Required**: 5-10 minutes  
**Propagation Time**: 24-48 hours (usually faster)  
**Difficulty**: Easy

---

## What You'll Need

✅ GoDaddy account login  
✅ Manus Management UI access  
✅ Your ologywood.com domain already registered with GoDaddy  

---

## Step 1: Get Your Manus Nameservers

### In Manus Management UI:

1. **Log in to Manus**
   - Go to https://manus.im
   - Click "Sign In"
   - Enter your credentials

2. **Navigate to Your Project**
   - Find "Ologywood - Artist Booking Platform" project
   - Click on it to open the project dashboard

3. **Go to Settings → Domains**
   - In the left sidebar, click **Settings**
   - Click **Domains** tab
   - You should see your current auto-generated domain (e.g., `3000-i3ruypj12150lnh2w3nuc-9ae81144.us2.manus.computer`)

4. **Find Your Manus Nameservers**
   - Look for the section titled "Custom Domain" or "Add Custom Domain"
   - You should see **Manus Nameservers** listed. They typically look like:
     - `ns1.manus.im`
     - `ns2.manus.im`
     - `ns3.manus.im`
     - `ns4.manus.im`

   **⚠️ Important**: Copy these nameserver addresses - you'll need them in the next step!

   If you don't see the nameservers displayed, you can also use the standard Manus nameservers:
   ```
   ns1.manus.im
   ns2.manus.im
   ns3.manus.im
   ns4.manus.im
   ```

---

## Step 2: Update GoDaddy Nameservers

### In GoDaddy:

1. **Log in to GoDaddy**
   - Go to https://www.godaddy.com
   - Click "Sign In" (top right)
   - Enter your GoDaddy account credentials

2. **Navigate to Your Domains**
   - Click on your **Account** icon (top right)
   - Select **My Products**
   - Click **Domains**

3. **Find ologywood.com**
   - Look for your domain in the list
   - Click on **ologywood.com** to open domain settings

4. **Access DNS Settings**
   - Click the **DNS** button/link (usually in the domain details)
   - Or look for "Manage DNS" option
   - You should see a section for "Nameservers"

5. **Change Nameservers**
   - Look for the **Nameservers** section
   - Click **Change** or **Edit** (button may vary)
   - Select **I'll use custom nameservers** (don't use GoDaddy's nameservers)

6. **Enter Manus Nameservers**
   - You'll see fields for nameserver entries
   - Delete any existing nameservers
   - Enter the Manus nameservers:
     ```
     ns1.manus.im
     ns2.manus.im
     ns3.manus.im
     ns4.manus.im
     ```

   **Example of what you'll see:**
   ```
   Nameserver 1: ns1.manus.im
   Nameserver 2: ns2.manus.im
   Nameserver 3: ns3.manus.im
   Nameserver 4: ns4.manus.im
   ```

7. **Save Changes**
   - Click **Save** or **Update** button
   - GoDaddy will confirm the changes
   - You should see a success message

---

## Step 3: Add Custom Domain to Manus

### Back in Manus Management UI:

1. **Go to Settings → Domains**
   - Click **Settings** in the left sidebar
   - Click **Domains** tab

2. **Add Custom Domain**
   - Click **Add Custom Domain** button
   - Enter your domain: `ologywood.com`
   - Click **Add** or **Next**

3. **Verify Domain**
   - Manus will ask you to verify the domain
   - Since you've updated the nameservers, verification should be automatic
   - If manual verification is needed, follow the on-screen instructions

4. **Wait for Propagation**
   - DNS changes take 24-48 hours to propagate globally
   - Manus will notify you when the domain is fully connected
   - You can check the status in Settings → Domains

---

## Step 4: Verify the Connection

### Check DNS Propagation:

**Option 1: Using Online Tools**
1. Go to https://www.whatsmydns.net
2. Enter `ologywood.com` in the search box
3. Select **NS** from the dropdown
4. Click **Search**
5. You should see the Manus nameservers listed globally

**Option 2: Using Command Line**
```bash
# Check nameservers
nslookup -type=NS ologywood.com

# Expected output should show:
# ologywood.com nameserver = ns1.manus.im
# ologywood.com nameserver = ns2.manus.im
# ologywood.com nameserver = ns3.manus.im
# ologywood.com nameserver = ns4.manus.im
```

**Option 3: In Manus Management UI**
1. Go to Settings → Domains
2. Check the status of ologywood.com
3. Should show "Connected" or "Active" ✅

---

## Step 5: Test Your Domain

Once DNS propagation is complete (24-48 hours):

1. **Open Your Domain**
   - Go to https://ologywood.com in your browser
   - You should see your Ologywood application load

2. **Verify SSL Certificate**
   - Look for the green lock icon 🔒 in the address bar
   - This means SSL/HTTPS is working correctly

3. **Test All Features**
   - Navigate through your application
   - Test booking system
   - Verify email notifications
   - Check all pages load correctly

---

## Troubleshooting

### Domain Not Connecting After 48 Hours

**Problem**: ologywood.com still shows GoDaddy's default page

**Solution**:
1. Verify nameservers were updated correctly in GoDaddy
   - Go to GoDaddy DNS settings
   - Confirm you see Manus nameservers (ns1.manus.im, etc.)

2. Clear your browser cache
   - Press `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
   - Clear all cached data
   - Try again

3. Wait longer
   - DNS propagation can take up to 48 hours
   - Some ISPs cache DNS longer than others

4. Contact Manus Support
   - If still not working after 48 hours
   - Go to https://help.manus.im
   - Submit a support ticket with your domain name

### SSL Certificate Not Working

**Problem**: Browser shows "Not Secure" warning

**Solution**:
1. Wait 15-30 minutes after domain connects
   - Manus automatically provisions SSL certificates
   - This takes a few minutes after domain connection

2. Hard refresh your browser
   - Press `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)
   - This clears the cache and reloads

3. Try a different browser
   - Test in Chrome, Firefox, Safari, or Edge
   - If it works in one browser, it's a cache issue

### Nameservers Show Old Values

**Problem**: GoDaddy still shows old nameservers

**Solution**:
1. Wait 24 hours
   - GoDaddy's system updates can take time

2. Try clearing GoDaddy's cache
   - Log out of GoDaddy
   - Clear your browser cache
   - Log back in

3. Contact GoDaddy Support
   - If nameservers still show old values after 24 hours
   - GoDaddy support can manually update them

---

## What Happens Next

### Automatic SSL Certificate

Once your domain is connected to Manus:
1. Manus automatically provisions an SSL certificate
2. Your site becomes HTTPS-enabled 🔒
3. All data is encrypted

### Email Configuration

Your email notifications will now come from:
- `noreply@ologywood.com` (instead of generic Manus domain)
- Professional appearance for your users

### Analytics & Monitoring

You can now track:
- Custom domain traffic in Manus Dashboard
- Performance metrics for ologywood.com
- User analytics

---

## FAQ

### Q: How long does it take for the domain to work?

**A**: Usually 5-30 minutes, but can take up to 48 hours. DNS propagation varies by ISP and region.

### Q: Can I use ologywood.com and the Manus domain at the same time?

**A**: Yes! Both will work and point to the same application. You can use either URL.

### Q: What if I want to go back to the Manus domain?

**A**: You can revert the nameservers in GoDaddy back to their original values. Your Manus auto-generated domain will continue to work.

### Q: Do I need to update anything in my application code?

**A**: No! Your application code doesn't need any changes. The domain routing is handled at the DNS level.

### Q: What about email from ologywood.com?

**A**: Once the domain is connected, emails sent from your application will use ologywood.com as the sender domain.

### Q: Can I use subdomains like api.ologywood.com?

**A**: Yes! Manus supports subdomains. You can configure them in Settings → Domains.

### Q: What if I have other services using ologywood.com?

**A**: You can set up multiple subdomains in Manus for different services. For example:
- `ologywood.com` → Main application
- `api.ologywood.com` → API server
- `admin.ologywood.com` → Admin panel

---

## Security & Best Practices

✅ **Keep Your GoDaddy Account Secure**
- Use a strong password
- Enable two-factor authentication
- Don't share login credentials

✅ **Monitor Your Domain**
- Check Manus Dashboard regularly
- Monitor for unauthorized changes
- Set up email alerts in Manus

✅ **Backup Important Data**
- Export your application data regularly
- Keep backups in a secure location
- Test restore procedures

✅ **SSL Certificate**
- Manus auto-renews SSL certificates
- No action needed from you
- Certificates renew automatically before expiration

---

## Next Steps

1. ✅ **Get Manus Nameservers** (Step 1)
2. ✅ **Update GoDaddy Nameservers** (Step 2)
3. ✅ **Add Custom Domain to Manus** (Step 3)
4. ⏳ **Wait for DNS Propagation** (24-48 hours)
5. ✅ **Verify Connection** (Step 4)
6. ✅ **Test Your Domain** (Step 5)

---

## Support

If you encounter any issues:

1. **Check This Guide**
   - Review the Troubleshooting section above

2. **Contact Manus Support**
   - Go to https://help.manus.im
   - Submit a support ticket
   - Include your domain name and issue description

3. **Contact GoDaddy Support**
   - Go to https://www.godaddy.com/help
   - For GoDaddy-specific DNS issues

---

## Checklist

Before you start:
- [ ] GoDaddy account access
- [ ] Manus account access
- [ ] ologywood.com domain registered with GoDaddy
- [ ] Admin access to both accounts

During the process:
- [ ] Get Manus nameservers
- [ ] Update GoDaddy nameservers
- [ ] Add domain to Manus
- [ ] Wait for DNS propagation

After the process:
- [ ] Verify nameservers changed
- [ ] Test ologywood.com in browser
- [ ] Verify SSL certificate works
- [ ] Test all application features

---

## Timeline

| Step | Time | Status |
|------|------|--------|
| Get Manus Nameservers | 2 min | TODO |
| Update GoDaddy Nameservers | 3 min | TODO |
| Add Domain to Manus | 2 min | TODO |
| DNS Propagation | 24-48 hours | TODO |
| Verify Connection | 5 min | TODO |
| Test Domain | 10 min | TODO |
| **Total** | **~1 hour + 24-48 hours wait** | **TODO** |

---

## Summary

You're about to connect your professional domain **ologywood.com** to your Manus-hosted Ologywood application!

**What will happen:**
1. Your application will be accessible at https://ologywood.com
2. SSL certificate will be automatically provisioned
3. Professional emails will come from ologywood.com
4. Analytics will track ologywood.com traffic

**Time required:**
- Setup: ~10 minutes
- Propagation: 24-48 hours
- Total: ~1 day

**Result:**
A professional, secure, custom-domain booking platform! 🎉

---

**Ready to get started? Follow the steps above!**

For questions, refer to the FAQ section or contact Manus support at https://help.manus.im

Good luck! 🚀
