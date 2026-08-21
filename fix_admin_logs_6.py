import re

with open('src/components/admin/AdminLogsTab.tsx', 'r') as f:
    text = f.read()

# Fix the broken `if (viewMode === 'all' || viewMode === 'project-docs') {      });    }`
bad_if_regex = re.compile(r'\s*if \(viewMode === \'all\' \|\| viewMode === \'project-docs\'\) \{\s*\}\);\s*\}')
text = bad_if_regex.sub('', text)

with open('src/components/admin/AdminLogsTab.tsx', 'w') as f:
    f.write(text)

