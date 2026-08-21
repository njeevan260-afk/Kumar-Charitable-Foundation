import re

with open('indexed_logs.txt', 'r') as f:
    lines = f.readlines()

def find_line(pattern):
    for i, line in enumerate(lines):
        if re.search(pattern, line):
            return i
    return -1

def find_closing_brace(start_idx, open_char='{', close_char='}'):
    depth = 0
    started = False
    for i in range(start_idx, len(lines)):
        line = lines[i]
        for char in line:
            if char == open_char:
                depth += 1
                started = True
            elif char == close_char:
                depth -= 1
        if started and depth == 0:
            return i
    return -1

def find_closing_tag(start_idx, tag):
    for i in range(start_idx, len(lines)):
        if tag in lines[i]:
            return i
    return -1

drop_ranges = []

# 1. Imports
drop_ranges.append((find_line(r"resolveDocumentPreview"), find_line(r"resolveDocumentPreview")))
drop_ranges.append((find_line(r"  StudentProjectDocument,"), find_line(r"  StudentProjectDocument,")))

# 2. Constants
start = find_line(r"const ALLOWED_DOC_TYPES =")
end = find_line(r"const MAX_DOC_SIZE =")
drop_ranges.append((start, end))

# 3. States
states = [
    r"projectDocs, setProjectDocs",
    r"showDocModal, setShowDocModal",
    r"previewDoc, setPreviewDoc",
    r"previewUrl, setPreviewUrl",
    r"isPdf, setIsPdf",
    r"isImage, setIsImage",
    r"loadingPreview, setLoadingPreview",
    r"previewError, setPreviewError",
    r"docForm, setDocForm",
    r"selectedDocFile, setSelectedDocFile",
    r"fileInputRef = useRef",
    r"// Preview modal states"
]
for state in states:
    l = find_line(state)
    if l != -1:
        drop_ranges.append((l, l))

# 4. Filter pill
start = find_line(r"onClick=\{\(\) => setActiveSectionView\('project-docs'\)\}")
# go up one line for button, and down to </button>
drop_ranges.append((start - 1, start + 3))

# 5. docsRes query
start = find_line(r"const docsRes = await supabase")
end = find_line(r"if \(docsRes\.data\) setProjectDocs")
drop_ranges.append((start, end))

# 6. loadPreview effect
start = find_line(r"let isMounted = true;\s*\n\s*async function loadPreview")
# go up one line to get useEffect
# find closing brace of useEffect
end = find_closing_brace(start - 1, '{', '}')
drop_ranges.append((start - 1, end))

# 7. Functions
funcs = [
    r"const handleFileSelection =",
    r"const handleUploadProjectDoc =",
    r"const handleDeleteProjectDoc =",
    r"const formatFileSize =",
    r"const getDocBadge ="
]
for func in funcs:
    start = find_line(func)
    end = find_closing_brace(start, '{', '}')
    drop_ranges.append((start, end))

# 8. SECTION 3 JSX
start = find_line(r"\{\/\* SECTION 3: Project Documents")
end = find_line(r"\{\/\* SECTION 4: Learning Process")
drop_ranges.append((start, end - 1))

# 9. MODAL 3 JSX
start = find_line(r"\{\/\* MODAL 3: UPLOAD PROJECT DOCUMENT")
end = find_line(r"\{\/\* MODAL 4: LEARNING PROCESS")
drop_ranges.append((start, end - 1))

# 10. PREVIEW MODAL JSX
start = find_line(r"\{\/\* DOCUMENT PREVIEW MODAL")
# to end of file, leaving last 3 lines (</div> ); };)
drop_ranges.append((start, len(lines) - 4))


# Execute drop
drop_set = set()
for r in drop_ranges:
    for i in range(r[0], r[1] + 1):
        drop_set.add(i)

out_lines = []
for i, line in enumerate(lines):
    if i not in drop_set:
        out_lines.append(line.split("\t", 1)[1]) # remove line number

# Write out
text = "".join(out_lines)

# Fix "All Sections" count
text = text.replace("meetingNotes.length + skillUpdates.length + projectDocs.length + learningNotes.length", "meetingNotes.length + skillUpdates.length + learningNotes.length")

# Fix activeSectionView union
text = text.replace(" | 'project-docs'", "")

with open('src/components/student/StudentLogsTab.tsx', 'w') as f:
    f.write(text)
print("Done")
