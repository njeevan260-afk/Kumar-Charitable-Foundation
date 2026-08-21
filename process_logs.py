import re

with open('src/components/student/StudentLogsTab.tsx', 'r') as f:
    text = f.read()

# 1. Imports
text = re.sub(r"import \{ resolveDocumentPreview, extractStoragePath \} from '../../utils/documentViewer';\n", "", text)
text = re.sub(r"  StudentProjectDocument,\n", "", text)

# 2. Constants
text = re.sub(r"const ALLOWED_DOC_TYPES.*?\];\n\nconst MAX_DOC_SIZE = 5 \* 1024 \* 1024; // 5 MB\n", "", text, flags=re.DOTALL)

# 3. States
states_to_remove = [
    r"  const \[projectDocs, setProjectDocs\] = useState<StudentProjectDocument\[\]>\(\[\]\);\n",
    r"  const \[showDocModal, setShowDocModal\] = useState\(false\);\n",
    r"  // Preview modal states\n",
    r"  const \[previewDoc, setPreviewDoc\] = useState<StudentProjectDocument \| null>\(null\);\n",
    r"  const \[previewUrl, setPreviewUrl\] = useState<string>\(''\);\n",
    r"  const \[isPdf, setIsPdf\] = useState\(false\);\n",
    r"  const \[isImage, setIsImage\] = useState\(false\);\n",
    r"  const \[loadingPreview, setLoadingPreview\] = useState\(false\);\n",
    r"  const \[previewError, setPreviewError\] = useState<string \| null>\(null\);\n",
    r"  const \[docForm, setDocForm\] = useState\(\{ title: '', description: '' \}\);\n",
    r"  const \[selectedDocFile, setSelectedDocFile\] = useState<File \| null>\(null\);\n",
    r"  const fileInputRef = useRef<HTMLInputElement>\(null\);\n",
]
for s in states_to_remove:
    text = re.sub(s, "", text)

# 4. fetchData query
fetch_data_removal = r"      const docsRes = await supabase\s*\n\s*\.from\('student_project_documents'\)\s*\n\s*\.select\('\*'\)\s*\n\s*\.eq\('user_id', session\.user\.id\)\s*\n\s*\.order\('created_at', \{ ascending: false \}\);\s*\n\s*if \(docsRes\.data\) setProjectDocs\(docsRes\.data as StudentProjectDocument\[\]\);\n"
text = re.sub(fetch_data_removal, "", text)

# 5. useEffect preview
preview_effect = r"  useEffect\(\(\) => \{\s*\n\s*let isMounted = true;\s*\n\s*async function loadPreview\(\) \{[\s\S]*?\}\s*\n\s*loadPreview\(\);\s*\n\s*return \(\) => \{\s*\n\s*isMounted = false;\s*\n\s*\};\s*\n\s*\}, \[previewDoc\]\);\n"
text = re.sub(preview_effect, "", text)

# 6. Functions (handleFileSelection, handleUploadProjectDoc, handleDeleteProjectDoc, formatFileSize, getDocBadge)
funcs = r"  const handleFileSelection = \([\s\S]*?setSelectedDocFile\(file\);\s*\}\s*\};\n"
text = re.sub(funcs, "", text)

funcs2 = r"  const handleUploadProjectDoc = async \(\) => \{[\s\S]*?setSubmitting\(false\);\s*\}\s*\};\n"
text = re.sub(funcs2, "", text)

funcs3 = r"  const handleDeleteProjectDoc = async \(docId: string, filePath: string\) => \{[\s\S]*?setProjectDocs\(\(prev\) => prev\.filter\(\(d\) => d\.id !== docId\)\);\s*\}\s*\};\n"
text = re.sub(funcs3, "", text)

funcs4 = r"  const formatFileSize = \(bytes: number\) => \{[\s\S]*?return `\$\{parseFloat\(\(bytes \/ Math\.pow\(k, i\)\)\.toFixed\(dm\)\)\} \$\{sizes\[i\]\}`;\s*\};\n"
text = re.sub(funcs4, "", text)

funcs5 = r"  const getDocBadge = \(fileType: string\) => \{[\s\S]*?return \{ bg: 'bg-\[#E5E7EB\]', text: 'text-\[#374151\]', icon: FileText, label: 'Document' \};\s*\};\n"
text = re.sub(funcs5, "", text)

# 7. filter pill
pill = r"          <button type=\"button\"\s*\n\s*onClick=\{.*?setActiveSectionView\('project-docs'\).*?\s*\n\s*className=\{`px-4 py-1\.5 rounded-full text-xs font-bold transition-all \$\{.*?=== 'project-docs'[\s\S]*?\}`\}\s*\n\s*>\s*\n\s*Project Docs\s*\n\s*</button>\n"
text = re.sub(pill, "", text)

# Remove option from type
text = re.sub(r" \| 'project-docs'", "", text)

# 8. SECTION 3 JSX
section3 = r"          \{\(activeSectionView === 'all' \|\| activeSectionView === 'project-docs'\) && \([\s\S]*?\{/\* SECTION 4: Learning Process Reflections \*/\}"
text = re.sub(section3, "          {/* SECTION 4: Learning Process Reflections */}", text)

# 9. MODAL 3 JSX
modal3 = r"      \{/\* MODAL 3: UPLOAD PROJECT DOCUMENT \*/\}[\s\S]*?\{/\* MODAL 4: LEARNING PROCESS REFLECTION \*/\}"
text = re.sub(modal3, "      {/* MODAL 4: LEARNING PROCESS REFLECTION */}", text)

# 10. Preview Modal JSX
preview_modal = r"      \{/\* DOCUMENT PREVIEW MODAL \*/\}[\s\S]*?\{previewDoc && \([\s\S]*?\}\)\}\s*\n\s*</div>\s*\n\s*\);\s*\n\};\s*$"
text = re.sub(preview_modal, "\n    </div>\n  );\n};\n", text)

with open('src/components/student/StudentLogsTab.tsx', 'w') as f:
    f.write(text)

