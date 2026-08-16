SELECT pol.policyname, tab.tablename
FROM pg_policies pol
JOIN pg_tables tab ON pol.tablename = tab.tablename
WHERE tab.tablename = 'objects' AND pol.schemaname = 'storage';
