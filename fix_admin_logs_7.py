import re

with open('src/components/admin/AdminLogsTab.tsx', 'r') as f:
    text = f.read()

# Wait, `item.type === 'project-doc'` is STILL there. My previous replacement failed.
# Let's replace the whole block manually
doc_block_regex = re.compile(r'\s*// 3\. PROJECT DOCUMENT & PROMPT ARTIFACT CARD.*?if \(item\.type === \'learning-process\'\)', re.DOTALL)
text = doc_block_regex.sub('\n            // 4. LEARNING PROCESS\n            if (item.type === \'learning-process\')', text)

with open('src/components/admin/AdminLogsTab.tsx', 'w') as f:
    f.write(text)

