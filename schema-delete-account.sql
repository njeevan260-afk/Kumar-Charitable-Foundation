-- ==============================================================================
-- ACCOUNT DELETION RPC
-- ==============================================================================

-- Create a secure RPC that allows a user to delete their own account.
-- It executes with elevated privileges (SECURITY DEFINER) but strictly scopes
-- the deletion to the user making the request (auth.uid()).
CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete the user from auth.users. 
  -- Due to foreign key cascading constraints we established, this will automatically 
  -- delete their profile, projects, academic records, and all other associated data.
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;
