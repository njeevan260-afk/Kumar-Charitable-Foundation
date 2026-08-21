import re

with open('temp.txt', 'r') as f:
    text = f.read()

# I will use AST parsing or string searching.
# Instead of complex regex, let's just do it manually.
# Since I have the full file, I can remove blocks by matching their start and end strings.

def remove_between(text, start_str, end_str, include_start=True, include_end=True):
    start_idx = text.find(start_str)
    if start_idx == -1: return text
    end_idx = text.find(end_str, start_idx + len(start_str))
    if end_idx == -1: return text
    
    start_cut = start_idx if include_start else start_idx + len(start_str)
    end_cut = end_idx + len(end_str) if include_end else end_idx
    
    return text[:start_cut] + text[end_cut:]

text = text.replace("import { resolveDocumentPreview, extractStoragePath } from '../../utils/documentViewer';\n", "")
text = text.replace("  StudentProjectDocument,\n", "")

text = remove_between(text, "const ALLOWED_DOC_TYPES = [", "const MAX_DOC_SIZE = 5 * 1024 * 1024; // 5 MB\n")

states_to_remove = [
    "  const [projectDocs, setProjectDocs] = useState<StudentProjectDocument[]>([]);\n",
    "  const [showDocModal, setShowDocModal] = useState(false);\n",
    "  const [previewDoc, setPreviewDoc] = useState<StudentProjectDocument | null>(null);\n",
    "  const [previewUrl, setPreviewUrl] = useState<string>('');\n",
    "  const [isPdf, setIsPdf] = useState(false);\n",
    "  const [isImage, setIsImage] = useState(false);\n",
    "  const [loadingPreview, setLoadingPreview] = useState(false);\n",
    "  const [previewError, setPreviewError] = useState<string | null>(null);\n",
    "  const [docForm, setDocForm] = useState({ title: '', description: '' });\n",
    "  const [selectedDocFile, setSelectedDocFile] = useState<File | null>(null);\n",
    "  const fileInputRef = useRef<HTMLInputElement>(null);\n",
]
for s in states_to_remove:
    text = text.replace(s, "")
    
# Clean up extra comments
text = text.replace("  // Preview modal states\n", "")

# Remove activeSectionView option
text = text.replace(" | 'project-docs'", "")

# remove docsRes query
text = remove_between(text, "const docsRes = await supabase", "if (docsRes.data) setProjectDocs(docsRes.data as StudentProjectDocument[]);\n")

# remove loadPreview effect
text = remove_between(text, "  useEffect(() => {\n    let isMounted = true;\n    async function loadPreview() {", "  }, [previewDoc]);\n")

# remove functions
text = remove_between(text, "  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {", "  };\n\n  const handleUploadProjectDoc")
text = remove_between(text, "  const handleUploadProjectDoc = async () => {", "  };\n\n  const handleDeleteProjectDoc")
text = remove_between(text, "  const handleDeleteProjectDoc = async (docId: string, filePath: string) => {", "  };\n\n  const formatFileSize")
text = remove_between(text, "  const formatFileSize = (bytes: number) => {", "  };\n\n  const getDocBadge")
text = remove_between(text, "  const getDocBadge = (fileType: string) => {", "  };\n")

# filter pills
text = remove_between(text, "          <button type=\"button\"\n            onClick={() => setActiveSectionView('project-docs')}", "</button>\n")

# fix "All Sections" count
text = text.replace("meetingNotes.length + skillUpdates.length + projectDocs.length + learningNotes.length", "meetingNotes.length + skillUpdates.length + learningNotes.length")

# Section 3
text = remove_between(text, "          {/* SECTION 3: Project Documents & Prompt Artifacts */}", "          {/* SECTION 4: Learning Process Reflections */}", include_end=False)

# Modal 3
text = remove_between(text, "      {/* MODAL 3: UPLOAD PROJECT DOCUMENT */}", "      {/* MODAL 4: LEARNING PROCESS REFLECTION */}", include_end=False)

# Document Preview Modal
text = remove_between(text, "      {/* DOCUMENT PREVIEW MODAL */}", "    </div>\n  );\n};\n", include_end=False)

with open('src/components/student/StudentLogsTab.tsx', 'w') as f:
    f.write(text)

