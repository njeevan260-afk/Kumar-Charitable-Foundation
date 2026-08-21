import re

with open('src/components/admin/AdminLogsTab.tsx', 'r') as f:
    text = f.read()

start = text.find("{/* ADMIN DOCUMENT PREVIEW MODAL */}")
if start != -1:
    text = text[:start] + "    </div>\n  );\n};\n"

with open('src/components/admin/AdminLogsTab.tsx', 'w') as f:
    f.write(text)

