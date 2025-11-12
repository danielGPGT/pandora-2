# Audit Logs Troubleshooting Guide

## Issue: Empty error object `{}` when logging audit actions

### Possible Causes:

1. **Missing Service Role Key**
   - Check if `SUPABASE_SERVICE_ROLE_KEY` is set in `.env.local`
   - You can find this in Supabase Dashboard → Settings → API → service_role key

2. **Table Doesn't Exist**
   - Run the SQL from `database/audit_logs_setup.sql` in Supabase SQL Editor
   - Verify the table exists: `SELECT * FROM audit_logs LIMIT 1;`

3. **RLS Policy Issues**
   - The API route uses service role to bypass RLS, but if the table doesn't exist, it will fail
   - Check if the table has RLS enabled: `SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'audit_logs';`

4. **Network/Request Issues**
   - Check browser Network tab for the `/api/audit-logs/log` request
   - Look at the response body for detailed error messages

### Debugging Steps:

1. **Check Environment Variables**
   ```bash
   # Make sure these are in .env.local:
   NEXT_PUBLIC_SUPABASE_URL=your-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

2. **Check Server Logs**
   - Look at the terminal where `npm run dev` is running
   - You should see detailed error logs from the API route

3. **Check Browser Console**
   - The improved error handling will now show:
     - Response status code
     - Detailed error message
     - Error code (if available)

4. **Verify Table Structure**
   ```sql
   -- Run in Supabase SQL Editor
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'audit_logs';
   ```

5. **Test Direct Insert**
   ```sql
   -- Test if you can insert directly (replace with your values)
   INSERT INTO audit_logs (
     tenant_id,
     user_id,
     entity_type,
     entity_id,
     action,
     old_values,
     new_values
   ) VALUES (
     'your-tenant-id',
     'your-user-id',
     'sport',
     'test-id',
     'created',
     NULL,
     '{"name": "Test"}'::jsonb
   );
   ```

### Next Steps:

After checking the above, the console should now show more detailed error messages. Look for:
- "Service role key not configured" - Add SUPABASE_SERVICE_ROLE_KEY to .env.local
- "relation 'audit_logs' does not exist" - Run the SQL setup script
- Any PostgreSQL error codes - These will help identify the specific issue

