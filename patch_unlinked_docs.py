import re

with open('src/components/student/StudentProjectsTab.tsx', 'r') as f:
    text = f.read()

unlinked_docs_code = """
      {/* Unlinked/General Documents */}
      {(() => {
        const unlinkedDocs = projectDocs.filter(doc => !doc.project_id || !projects.find(p => p.id === doc.project_id));
        if (unlinkedDocs.length === 0) return null;
        return (
          <div className="mt-8">
            <h3 className="text-lg font-bold text-[#3B2A20] mb-4">Other Uploaded Documents</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {unlinkedDocs.map((doc) => {
                const badge = getDocBadge(doc.file_name);
                const BadgeIcon = badge.icon;
                return (
                  <div key={doc.id} className="group relative flex items-start gap-3 p-3 bg-white border border-[#E8DED0] rounded-xl hover:border-[#1E3A8A] transition-colors">
                    <div className={`p-2 rounded-lg ${badge.bg} ${badge.text} shrink-0`}>
                      <BadgeIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-sm font-bold text-[#1F2937] truncate mb-0.5" title={doc.title}>
                        {doc.title}
                      </h5>
                      <p className="text-xs text-[#737373] truncate" title={doc.description}>
                        {doc.description || 'No description provided'}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#F3EFE9] text-[#4B5563]">
                          {badge.label}
                        </span>
                        <span className="text-[10px] text-[#A09080]">
                          {formatFileSize(doc.file_size)}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setPreviewDoc(doc)}
                        className="p-1.5 text-[#1E3A8A] hover:bg-[#F3EFE9] rounded-lg transition-colors"
                        title="Preview Document"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProjectDoc(doc.id, doc.file_path)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}
"""

text = text.replace("{/* DOCUMENT PREVIEW MODAL */}", unlinked_docs_code + "\n      {/* DOCUMENT PREVIEW MODAL */}")

with open('src/components/student/StudentProjectsTab.tsx', 'w') as f:
    f.write(text)

