import re

with open('src/components/student/StudentProjectsTab.tsx', 'r') as f:
    text = f.read()

# Add states for Upload Document modal
state_injection = """  const [previewError, setPreviewError] = useState<string | null>(null);

  // Add Project Doc Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadDocForm, setUploadDocForm] = useState({ projectId: '', projectTitle: '', title: '', description: '' });
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const uploadFileInputRef = useRef<HTMLInputElement>(null);

  const [linkProjectId, setLinkProjectId] = useState<Record<string, string>>({});

  const handleUploadDocToProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !uploadFile || !uploadDocForm.projectId) return;

    setUploadingDoc(true);
    try {
      const fileExt = uploadFile.name.split('.').pop();
      const fileName = `${generateUUID()}.${fileExt}`;
      const filePath = `${profile.id}/project-docs/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('student-documents')
        .upload(filePath, uploadFile);

      if (uploadError) throw uploadError;

      const newDoc = {
        user_id: profile.id,
        project_id: uploadDocForm.projectId,
        title: uploadDocForm.title.trim() || `${uploadDocForm.projectTitle} - Document`,
        description: uploadDocForm.description.trim(),
        file_path: filePath,
        file_name: uploadFile.name,
        file_type: uploadFile.type,
        file_size: uploadFile.size
      };

      const { error: dbError } = await supabase
        .from('student_project_documents')
        .insert([newDoc]);

      if (dbError) throw dbError;

      setShowUploadModal(false);
      setUploadDocForm({ projectId: '', projectTitle: '', title: '', description: '' });
      setUploadFile(null);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to upload document');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleLinkDoc = async (docId: string) => {
    const pId = linkProjectId[docId];
    if (!pId) return;
    try {
      const { error } = await supabase
        .from('student_project_documents')
        .update({ project_id: pId })
        .eq('id', docId);
      if (error) throw error;
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to link document');
    }
  };
"""
text = text.replace('  const [previewError, setPreviewError] = useState<string | null>(null);', state_injection)


# In "Project Documentation & Artifacts" add the button
button_header_old = """                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-[#3B2A20] flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#1E3A8A]" />
                        Project Documentation & Artifacts
                      </h4>
                    </div>"""
button_header_new = """                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-[#3B2A20] flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#1E3A8A]" />
                        Project Documentation & Artifacts
                      </h4>
                      <button
                        onClick={() => {
                          setUploadDocForm({ projectId: project.id, projectTitle: project.title, title: `${project.title} - File`, description: '' });
                          setUploadFile(null);
                          setShowUploadModal(true);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#1E3A8A] bg-[#F8F5F1] hover:bg-[#E8DED0] rounded-lg transition-colors"
                      >
                        <UploadCloud className="w-4 h-4" />
                        Upload Document
                      </button>
                    </div>"""
text = text.replace(button_header_old, button_header_new)

# In "Other Uploaded Documents" add the select box and link button
unlinked_item_regex = re.compile(r'(\<div className="flex flex-col gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"\>)')
unlinked_item_new = """                      <div className="flex items-center gap-2 mr-2">
                        <select
                          value={linkProjectId[doc.id] || ''}
                          onChange={(e) => setLinkProjectId(prev => ({ ...prev, [doc.id]: e.target.value }))}
                          className="px-2 py-1 text-xs rounded-lg border border-[#E8DED0] focus:ring-2 focus:ring-[#1E3A8A] outline-none"
                        >
                          <option value="">Select a project...</option>
                          {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.title}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleLinkDoc(doc.id)}
                          disabled={!linkProjectId[doc.id]}
                          className="px-3 py-1 text-xs font-bold bg-[#1E3A8A] text-white rounded-lg hover:bg-[#152B6A] disabled:opacity-50 transition-colors"
                        >
                          Link to Project
                        </button>
                      </div>
                      \\1"""
text = unlinked_item_regex.sub(unlinked_item_new, text)

# Add the modal UI
modal_ui = """
      {/* UPLOAD DOC MODAL */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between p-6 border-b border-[#E8DED0] bg-[#F8F5F1]">
                <div>
                  <h3 className="text-lg font-bold text-[#3B2A20]">Upload Document</h3>
                  <p className="text-sm text-[#737373]">Attach to: {uploadDocForm.projectTitle}</p>
                </div>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="p-2 text-[#737373] hover:text-[#1F2937] hover:bg-white rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleUploadDocToProject} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#4F4F4F] mb-1">Document Title</label>
                  <input
                    type="text"
                    required
                    value={uploadDocForm.title}
                    onChange={(e) => setUploadDocForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-2 rounded-xl border border-[#E8DED0] focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4F4F4F] mb-1">Description (Optional)</label>
                  <textarea
                    rows={2}
                    value={uploadDocForm.description}
                    onChange={(e) => setUploadDocForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-2 rounded-xl border border-[#E8DED0] focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent outline-none resize-none"
                    placeholder="Brief description of this document..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4F4F4F] mb-1">File</label>
                  <div className="mt-1">
                    <input
                      type="file"
                      id="upload_modal_file"
                      className="hidden"
                      accept=".docx,.doc,.pdf,.txt,.md,.rtf,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                           setUploadFile(e.target.files[0]);
                        }
                      }}
                      ref={uploadFileInputRef}
                    />
                    {!uploadFile ? (
                      <label
                        htmlFor="upload_modal_file"
                        className="flex flex-col items-center justify-center w-full px-4 py-6 border-2 border-dashed border-[#D1D5DB] hover:border-[#1E3A8A] hover:bg-[#F3EFE9] rounded-xl cursor-pointer transition-colors"
                      >
                        <UploadCloud className="w-8 h-8 text-[#A09080] mb-2" />
                        <span className="text-sm font-bold text-[#1F2937]">Click to select a document</span>
                      </label>
                    ) : (
                      <div className="flex items-center justify-between p-4 bg-[#F8F5F1] border border-[#E8DED0] rounded-xl">
                        <div className="flex items-center gap-3 min-w-0">
                          <FileText className="w-5 h-5 text-emerald-500 shrink-0" />
                          <p className="text-sm font-bold text-[#1F2937] truncate">{uploadFile.name}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setUploadFile(null);
                            if (uploadFileInputRef.current) uploadFileInputRef.current.value = '';
                          }}
                          className="p-1.5 text-[#9CA3AF] hover:text-red-500 hover:bg-white rounded-lg transition-colors shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={uploadingDoc || !uploadFile}
                    className="flex items-center gap-2 px-6 py-2 bg-[#1E3A8A] text-white rounded-xl hover:bg-[#152B6A] transition-colors disabled:opacity-50"
                  >
                    {uploadingDoc && <Loader2 className="w-4 h-4 animate-spin" />}
                    Upload
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
"""

text = text.replace("{/* DOCUMENT PREVIEW MODAL */}", modal_ui + "\n      {/* DOCUMENT PREVIEW MODAL */}")

with open('src/components/student/StudentProjectsTab.tsx', 'w') as f:
    f.write(text)

