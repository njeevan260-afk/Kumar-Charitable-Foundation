const fs = require('fs');
const content = fs.readFileSync('src/components/auth/AdminDashboardPage.tsx', 'utf8');

const regex = /(  const loadedUserIdRef = useRef<string \| null>\(null\);\n\n  useEffect\(\(\) => \{\n    if \(!authLoading && !sessionChecking\) \{\n      if \(!user\) \{\n        loadedUserIdRef\.current = null;\n        setActiveTab\('admin-login'\);\n      \} else if \(!isAdminUser && role === 'student'\) \{\n        setActiveTab\('student-dashboard'\);\n      \} else if \(loadedUserIdRef\.current !== user\.id\) \{\n        loadedUserIdRef\.current = user\.id;\n        loadAdminData\(\);\n      \}\n    \}\n  \}, \[user, role, profile, authLoading, sessionChecking, isAdminUser, setActiveTab, loadAdminData\]\);\n\n)(  \/\/ Load all real Supabase Data for Admin\n  const loadAdminData = useCallback\(async \(\) => \{\n[\s\S]*?  \}, \[user\?\.id, user\?\.email\]\);\n)/;

if (regex.test(content)) {
  const newContent = content.replace(regex, '$2\n$1');
  fs.writeFileSync('src/components/auth/AdminDashboardPage.tsx', newContent);
  console.log("Replaced successfully!");
} else {
  console.log("Could not find the target string.");
}
