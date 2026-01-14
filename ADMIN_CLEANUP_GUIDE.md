# Admin Cleanup Guide

## How to Delete All Authentication Users

### Method 1: Using the Admin Panel (Recommended)

1. **Access the Admin Panel**
   - Sign in to your account
   - Navigate to `/admin` in your browser (e.g., `https://yourdomain.com/admin`)
   - You must have admin role privileges to access this page

2. **Use the Admin Cleanup Tool**
   - On the Admin page, you'll see the "Admin Cleanup Tool" card
   - Click the red "Delete All Auth Users" button
   - A confirmation dialog will appear
   - Read the warning carefully - this action cannot be undone
   - Click "Yes, Delete All Users" to confirm

3. **What Gets Deleted**
   - All authentication user accounts from the system
   - User data has already been cleared from the database through migrations
   - This allows emails to be re-used for new signups

### Method 2: Using the Edge Function Directly

If you need to call the function programmatically:

```javascript
const { data, error } = await supabase.functions.invoke('delete-all-auth-users');

if (error) {
  console.error('Error:', error);
} else {
  console.log(`Successfully deleted ${data.deleted} auth users`);
}
```

### Method 3: Using cURL

```bash
curl -X POST 'https://kwkfmwgqwpaynawgtghf.supabase.co/functions/v1/delete-all-auth-users' \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

## Important Notes

⚠️ **WARNING**: This action is permanent and cannot be undone!

- All authentication users will be deleted from the system
- Users will need to create new accounts to access the platform
- Database tables have already been cleared through migrations
- This is primarily for testing and development purposes

## Best Practices

1. **Backup First**: Always ensure you have backups before running this operation
2. **Notify Users**: If in production, notify users before performing cleanup
3. **Test Environment**: Test the cleanup process in a development environment first
4. **Verify Success**: Check the response to confirm the number of deleted users

## Troubleshooting

If the cleanup fails:
1. Check the backend logs in Lovable Cloud
2. Verify you have admin privileges
3. Ensure the edge function is deployed
4. Contact support if issues persist

## Post-Cleanup Steps

After successful cleanup:
1. Verify all auth users have been removed
2. Test creating new accounts with previously used emails
3. Confirm no old user data persists in the system
4. Enable leaked password protection in auth settings

## Security Recommendations

After cleanup, ensure to:
- Enable leaked password protection
- Implement rate limiting for signups
- Set up proper RLS policies
- Configure email verification if needed
