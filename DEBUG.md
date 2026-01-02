# Debug: Search Counter Not Showing

## Steps to Debug:

### 1. Check Browser Console
1. Open your app at `localhost:3000/app`
2. Press **F12** to open DevTools
3. Go to **Console** tab
4. Look for any errors (especially from `useSubscription` or `Sidebar`)

### 2. Check Supabase Tables
Go to Supabase Dashboard → Table Editor:

**Check if `subscriptions` table exists:**
- Should have columns: `id`, `user_id`, `plan_type`, `status`, `created_at`

**Check if you have a subscription record:**
```sql
SELECT * FROM subscriptions WHERE user_id = auth.uid();
```

**If no record exists, manually create one:**
```sql
INSERT INTO subscriptions (user_id, plan_type, status)
VALUES (auth.uid(), 'free', 'active');
```

### 3. Check Network Tab
In DevTools → Network tab:
- Do you see requests to Supabase failing?
- Any 403 or 401 errors?

### 4. Force Refresh
After running the SQL:
1. Hard refresh: **Ctrl + Shift + R**
2. Or clear cache and reload

### 5. Check if useSubscription is working
Add this temporarily to `Sidebar.tsx` line 22:

```tsx
console.log('Subscription data:', { subscription, usage, planName, usagePercentage });
```

Then check console for output.

## Expected Behavior:
Once working, you should see in sidebar footer:
```
Plan Gratuito
Búsquedas
0/5
[progress bar]
```

## If Still Not Working:
Send me a screenshot of:
1. Browser console errors
2. The Supabase `subscriptions` table (show columns and data)
