import re

with open('temp.txt', 'r') as f:
    text = f.read()

# 1. Imports
text = re.sub(r"import \{ resolveDocumentPreview, extractStoragePath \} from '../../utils/documentViewer';\n", "", text)
text = re.sub(r"  StudentProjectDocument,\n", "", text)

# 2. Constants
text = re.sub(r"const ALLOWED_DOC_TYPES.*?MAX_DOC_SIZE = 5 \* 1024 \* 1024; // 5 MB\n\n", "", text, flags=re.DOTALL)

# 3. States
states = [
    r"  const \[projectDocs, setProjectDocs\].*?\n",
    r"  const \[showDocModal, setShowDocModal\].*?\n",
    r"  // Preview modal states\n",
    r"  const \[previewDoc, setPreviewDoc\].*?\n",
    r"  const \[previewUrl, setPreviewUrl\].*?\n",
    r"  const \[isPdf, setIsPdf\].*?\n",
    r"  const \[isImage, setIsImage\].*?\n",
    r"  const \[loadingPreview, setLoadingPreview\].*?\n",
    r"  const \[previewError, setPreviewError\].*?\n",
    r"  const \[docForm, setDocForm\].*?\n",
    r"  const \[selectedDocFile, setSelectedDocFile\].*?\n",
    r"  const fileInputRef = useRef<HTMLInputElement>\(null\);\n"
]
for state in states:
    text = re.sub(state, "", text)

# docsRes query
text = re.sub(r"      const docsRes = await supabase\n        \.from\('student_project_documents'\)\n        \.select\('\*'\)\n        \.eq\('user_id', session\.user\.id\)\n        \.order\('created_at', \{ ascending: false \}\);\n\n      if \(docsRes\.data\) setProjectDocs\(docsRes\.data as StudentProjectDocument\[\]\);\n", "", text)

# loadPreview effect
text = re.sub(r"  useEffect\(\(\) => \{\n    let isMounted = true;\n    async function loadPreview\(\) \{.*?\n  \}, \[previewDoc\]\);\n", "", text, flags=re.DOTALL)

# Functions block (from handleFileSelection to getDocBadge)
text = re.sub(r"  const handleFileSelection = \(e: React\.ChangeEvent<HTMLInputElement>\) => \{.*?\n  const getDocBadge = \(fileType: string\) => \{.*?\};\n", "", text, flags=re.DOTALL)

# pill string
text = re.sub(r"          <button type=\"button\"\n            onClick=\{\(\) => setActiveSectionView\('project-docs'\)\}\n            className=\{`px-4 py-1\.5 rounded-full text-xs font-bold transition-all \$\{\n              activeSectionView === 'project-docs'\n                \? 'bg-\[#1E3A8A\] text-white shadow-md'\n                : 'bg-white text-\[#4B5563\] border border-\[#D1D5DB\] hover:bg-\[#F3EFE9\]'\n            \}`\}\n          >\n            Project Docs\n          </button>\n", "", text)

text = text.replace(" | 'project-docs'", "")

# All sections count
text = text.replace("meetingNotes.length + skillUpdates.length + projectDocs.length + learningNotes.length", "meetingNotes.length + skillUpdates.length + learningNotes.length")

# Section 3
text = re.sub(r"          \{\(activeSectionView === 'all' \|\| activeSectionView === 'project-docs'\) && \([\s\S]*?\{/\* SECTION 4: Learning Process Reflections \*/\}", "          {/* SECTION 4: Learning Process Reflections */}", text)

# Modal 3
text = re.sub(r"      \{/\* MODAL 3: Project Document & Prompt Upload Modal \*/\}[\s\S]*?\{/\* MODAL 4: LEARNING PROCESS REFLECTION \*/\}", "      {/* MODAL 4: LEARNING PROCESS REFLECTION */}", text)

# Document preview modal
text = re.sub(r"      \{/\* DOCUMENT PREVIEW MODAL \*/\}[\s\S]*?(?=    </div>\n  \);\n};\n)", "", text)


with open('src/components/student/StudentLogsTab.tsx', 'w') as f:
    f.write(text)

