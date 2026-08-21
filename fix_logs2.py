import os

with open('src/components/student/StudentLogsTab.tsx', 'r') as f:
    text = f.read()

# I will define exactly the strings to remove

s1 = "import { resolveDocumentPreview, extractStoragePath } from '../../utils/documentViewer';\n"
text = text.replace(s1, "")

s2 = "  StudentProjectDocument,\n"
text = text.replace(s2, "")

s3 = """const ALLOWED_DOC_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/msword', // .doc
  'text/plain',
  'text/markdown',
  'application/rtf',
  'image/jpeg',
  'image/png',
  'image/webp'
];

const MAX_DOC_SIZE = 5 * 1024 * 1024; // 5 MB

"""
text = text.replace(s3, "")

s4 = "  const [projectDocs, setProjectDocs] = useState<StudentProjectDocument[]>([]);\n"
text = text.replace(s4, "")

s5 = "  const [showDocModal, setShowDocModal] = useState(false);\n"
text = text.replace(s5, "")

s6 = """  // Preview modal states
  const [previewDoc, setPreviewDoc] = useState<StudentProjectDocument | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isPdf, setIsPdf] = useState(false);
  const [isImage, setIsImage] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

"""
text = text.replace(s6, "")

s7 = """  const [docForm, setDocForm] = useState({ title: '', description: '' });
  const [selectedDocFile, setSelectedDocFile] = useState<File | null>(null);
"""
text = text.replace(s7, "")

s8 = "  const fileInputRef = useRef<HTMLInputElement>(null);\n"
text = text.replace(s8, "")

s9 = """      const docsRes = await supabase
        .from('student_project_documents')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

"""
text = text.replace(s9, "")

s10 = "      if (docsRes.data) setProjectDocs(docsRes.data as StudentProjectDocument[]);\n"
text = text.replace(s10, "")

# the loadPreview effect
effect_str = """  useEffect(() => {
    let isMounted = true;
    async function loadPreview() {
      if (!previewDoc) {
        setPreviewUrl('');
        setIsPdf(false);
        setIsImage(false);
        return;
      }
      setLoadingPreview(true);
      setPreviewError(null);
      try {
        const res = await resolveDocumentPreview(
          previewDoc.file_path,
          previewDoc.file_name,
          previewDoc.file_type
        );
        if (!isMounted) return;
        if (res.error || !res.url) {
          setPreviewError(res.error || 'Failed to load document preview.');
          setPreviewUrl('');
        } else {
          setPreviewUrl(res.url);
          setIsPdf(res.isPdf);
          setIsImage(res.isImage);
        }
      } catch (err: any) {
        if (!isMounted) return;
        setPreviewError(err.message || 'An unexpected error occurred while loading the preview.');
      } finally {
        if (isMounted) setLoadingPreview(false);
      }
    }
    loadPreview();
    return () => {
      isMounted = false;
    };
  }, [previewDoc]);

"""
text = text.replace(effect_str, "")

# The massive chunk of functions from handleFileSelection to getDocBadge
# I will substring from `  const handleFileSelection` to `};\n\n  const getDocBadge` (inclusive of getDocBadge's end)
start_idx = text.find("  const handleFileSelection = (e:")
end_idx = text.find("  const getDocBadge = (fileType: string) => {")
if start_idx != -1 and end_idx != -1:
    end_brace = text.find("  };\n", end_idx) + 5
    text = text[:start_idx] + text[end_brace:]


pill_str = """          <button type="button"
            onClick={() => setActiveSectionView('project-docs')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeSectionView === 'project-docs'
                ? 'bg-[#1E3A8A] text-white shadow-md'
                : 'bg-white text-[#4B5563] border border-[#D1D5DB] hover:bg-[#F3EFE9]'
            }`}
          >
            Project Docs
          </button>
"""
text = text.replace(pill_str, "")

text = text.replace(" | 'project-docs'", "")

# projectDocs.length +
text = text.replace("meetingNotes.length + skillUpdates.length + projectDocs.length + learningNotes.length", "meetingNotes.length + skillUpdates.length + learningNotes.length")


# Section 3
s3_start = text.find("          {/* SECTION 3: Project Documents & Prompt Artifacts */}")
s4_start = text.find("          {/* SECTION 4: Learning Process Reflections */}")
if s3_start != -1 and s4_start != -1:
    text = text[:s3_start] + text[s4_start:]


# Modal 3
m3_start = text.find("      {/* MODAL 3: UPLOAD PROJECT DOCUMENT */}")
m4_start = text.find("      {/* MODAL 4: LEARNING PROCESS REFLECTION */}")
if m3_start != -1 and m4_start != -1:
    text = text[:m3_start] + text[m4_start:]


# Document Preview Modal
pm_start = text.find("      {/* DOCUMENT PREVIEW MODAL */}")
if pm_start != -1:
    # go to last "    </div>\n  );\n};\n"
    pm_end = text.rfind("    </div>\n  );\n};\n")
    if pm_end != -1:
        text = text[:pm_start] + text[pm_end:]


with open('src/components/student/StudentLogsTab.tsx', 'w') as f:
    f.write(text)

