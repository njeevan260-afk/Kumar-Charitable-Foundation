import re

with open('src/components/student/StudentProjectsTab.tsx', 'r') as f:
    text = f.read()

# Let's replace the form UI
ui_old = """            <div>
              <label className="block text-sm font-medium text-[#4F4F4F] mb-1">Description</label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-[#E8DED0] focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent outline-none resize-none"
                placeholder="Describe your project, technologies used, and your role..."
              />
            </div>
            <div className="flex justify-end pt-2">"""

ui_new = """            <div>
              <label className="block text-sm font-medium text-[#4F4F4F] mb-1">Description</label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-[#E8DED0] focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent outline-none resize-none"
                placeholder="Describe your project, technologies used, and your role..."
              />
            </div>
            
            {/* Project Document Upload in the same form */}
            <div>
              <label className="block text-sm font-medium text-[#4F4F4F] mb-1">Project Document (Optional)</label>
              <div className="mt-1">
                <input
                  type="file"
                  id="project_doc_upload"
                  className="hidden"
                  accept=".docx,.doc,.pdf,.txt,.md,.rtf,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                  onChange={handleFileSelection}
                  ref={fileInputRef}
                />
                {!selectedDocFile ? (
                  <label
                    htmlFor="project_doc_upload"
                    className="flex flex-col items-center justify-center w-full px-4 py-6 border-2 border-dashed border-[#D1D5DB] hover:border-[#1E3A8A] hover:bg-[#F3EFE9] rounded-xl cursor-pointer transition-colors"
                  >
                    <UploadCloud className="w-8 h-8 text-[#A09080] mb-2" />
                    <span className="text-sm font-bold text-[#1F2937]">Click to select a document</span>
                    <span className="text-xs text-[#737373] mt-1">PDF, DOCX, DOC, TXT (Max 5MB)</span>
                  </label>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-[#F8F5F1] border border-[#E8DED0] rounded-xl">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 bg-white rounded-lg shadow-sm shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#1F2937] truncate">{selectedDocFile.name}</p>
                        <p className="text-xs text-[#737373]">
                          Size: {formatFileSize(selectedDocFile.size)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDocFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="p-1.5 text-[#9CA3AF] hover:text-red-500 hover:bg-white rounded-lg transition-colors shrink-0"
                      title="Remove file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">"""
text = text.replace(ui_old, ui_new)

with open('src/components/student/StudentProjectsTab.tsx', 'w') as f:
    f.write(text)

