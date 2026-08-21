import re

with open('src/components/student/StudentLogsTab.tsx', 'r') as f:
    text = f.read()

# I need to carefully remove Section 3 from the render and the related state
# It's better to just write a script that slices the text.
import sys

# Replace SECTION 3 block in UI
section3_regex = re.compile(r'\{\/\* SECTION 3: Project Documents.*?\{\/\* SECTION 4:', re.DOTALL)
text = section3_regex.sub('{/* SECTION 4:', text)

# Remove the Modals related to Document Upload
modal_regex = re.compile(r'\{\/\* MODAL 3: Project Document.*?\{\/\* DOCUMENT PREVIEW MODAL \*\/\}', re.DOTALL)
text = modal_regex.sub('{/* DOCUMENT PREVIEW MODAL */}', text)

with open('src/components/student/StudentLogsTab.tsx', 'w') as f:
    f.write(text)

