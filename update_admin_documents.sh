cat << 'INNER_EOF' > src/components/admin/AdminDocumentsTab.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { AcademicDocument, StudentProfile } from '../../types/student';
import { resolveDocumentPreview } from '../../utils/documentViewer';
import {
  Search,
  FileText,
  User,
  GraduationCap,
  Building2,
  X,
  ChevronRight,
  ChevronLeft,
  Eye,
  Download,
  ExternalLink,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface AdminDocumentsTabProps {
  documents: AcademicDocument[];
  students: StudentProfile[];
  onSelectStudent: (student: StudentProfile) => void;
}

export const AdminDocumentsTab: React.FC<AdminDocumentsTabProps> = ({
  documents,
  students,
  onSelectStudent,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentForDocs, setSelectedStudentForDocs] = useState<StudentProfile | null>(null);

  // Preview state
  const [previewDoc, setPreviewDoc] = useState<AcademicDocument | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isPdf, setIsPdf] = useState(false);
  const [isImage, setIsImage] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Group documents by student and sort alphabetically
  const studentDocCounts = useMemo(() => {
    const counts = documents.reduce((acc, doc) => {
      acc[doc.user_id] = (acc[doc.user_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts)
      .map(([userId, count]) => {
        const student = students.find(s => s.id === userId);
        return {
          student,
          count
        };
      })
      .filter(item => item.student !== undefined) // Only include known students
      .sort((a, b) => {
        const nameA = a.student?.full_name || '';
        const nameB = b.student?.full_name || '';
        return nameA.localeCompare(nameB);
      });
  }, [documents, students]);

  // Apply search filter
  const filteredStudentDocs = useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (!term) return studentDocCounts;

    return studentDocCounts.filter(item => {
      const student = item.student!;
      return (
        student.full_name?.toLowerCase().includes(term) ||
        student.email?.toLowerCase().includes(term) ||
        student.college_name?.toLowerCase().includes(term)
      );
    });
  }, [studentDocCounts, searchTerm]);

  // Get documents for selected student
  const selectedStudentDocuments = useMemo(() => {
    if (!selectedStudentForDocs) return [];
    return documents.filter(doc => doc.user_id === selectedStudentForDocs.id);
  }, [documents, selectedStudentForDocs]);

  // Resolve private signed/blob URL whenever a document is selected for preview
  useEffect(() => {
    if (!previewDoc) {
      setPreviewUrl('');
      setPreviewError(null);
      return;
    }

    let isMounted = true;
    const loadPreview = async () => {
      setLoadingPreview(true);
      setPreviewError(null);

      try {
        const res = await resolveDocumentPreview(
          previewDoc.file_path,
          previewDoc.file_name,
          previewDoc.file_type
        );

        if (!isMounted) return;

        if (res.url) {
          setPreviewUrl(res.url);
          setIsPdf(res.isPdf);
          setIsImage(res.isImage);
        } else {
          setPreviewError(res.error || 'Unable to load preview for this file.');
        }
      } catch (err: any) {
        if (!isMounted) return;
        setPreviewError(err.message || 'Failed to render file preview.');
      } finally {
        if (isMounted) {
          setLoadingPreview(false);
        }
      }
    };

    loadPreview();

    return () => {
      isMounted = false;
    };
  }, [previewDoc]);

  const handleDownload = () => {
    if (!previewUrl) return;
    const a = document.createElement('a');
    a.href = previewUrl;
    a.download = previewDoc?.file_name || 'document';
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-[#E8DED0]">
        <div>
          <h2 className="text-xl md:text-2xl font-serif font-bold text-[#1F2937]">Student Documents</h2>
          <p className="text-xs text-[#737373] mt-0.5">
            {selectedStudentForDocs 
              ? \`Viewing \${selectedStudentDocuments.length} documents for \${selectedStudentForDocs.full_name}\`
              : \`\${studentDocCounts.length} students have uploaded a total of \${documents.length} documents.\`
            }
          </p>
        </div>

        {!selectedStudentForDocs ? (
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-[#A09080] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by student name or college..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E8DED0] focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] rounded-xl text-xs text-[#1F2937] transition-all outline-none"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A09080] hover:text-[#1F2937]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={() => setSelectedStudentForDocs(null)}
            className="px-4 py-2 bg-white border border-[#E8DED0] text-[#1F2937] hover:bg-[#F9F6F0] rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to All Students
          </button>
        )}
      </div>

      {!selectedStudentForDocs ? (
        /* Student Cards List */
        filteredStudentDocs.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-[#E8DED0]">
            <FileText className="w-12 h-12 text-[#A09080] mx-auto mb-3 opacity-40" />
            <p className="text-base font-bold text-[#1F2937]">No Students Found</p>
            <p className="text-xs text-[#737373] mt-1">Adjust search keywords or check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredStudentDocs.map(({ student, count }) => (
              <button
                key={student!.id}
                onClick={() => setSelectedStudentForDocs(student!)}
                className="bg-white p-5 rounded-2xl border border-[#E8DED0] hover:border-[#1E3A8A] shadow-sm hover:shadow-md transition-all text-left flex flex-col justify-between group h-full cursor-pointer"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 border border-blue-100 group-hover:bg-[#1E3A8A] transition-colors">
                      <User className="w-5 h-5 text-[#1E3A8A] group-hover:text-white transition-colors" />
                    </div>
                    <div className="px-2.5 py-1 rounded-full bg-blue-50 text-[#1E3A8A] text-xs font-bold border border-blue-100 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      {count} {count === 1 ? 'Doc' : 'Docs'}
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-[#1F2937] line-clamp-1 mb-1 group-hover:text-[#1E3A8A] transition-colors">
                    {student!.full_name || 'Unknown Student'}
                  </h3>
                  <p className="text-xs text-[#737373] line-clamp-1 mb-4">
                    {student!.email}
                  </p>

                  <div className="space-y-2">
                    {student!.college_name && (
                      <div className="flex items-center gap-2 text-[11px] text-[#6B5A4D]">
                        <Building2 className="w-3.5 h-3.5 text-[#A09080]" />
                        <span className="line-clamp-1">{student!.college_name}</span>
                      </div>
                    )}
                    {student!.current_semester && (
                      <div className="flex items-center gap-2 text-[11px] text-[#6B5A4D]">
                        <GraduationCap className="w-3.5 h-3.5 text-[#A09080]" />
                        <span className="line-clamp-1">Sem: {student!.current_semester}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E8DED0]/60 flex items-center justify-between text-xs font-bold text-[#1E3A8A] opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>View Documents</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>
            ))}
          </div>
        )
      ) : (
        /* Single Student's Documents */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-fadeIn">
          {selectedStudentDocuments.map((doc) => (
            <div
              key={doc.id}
              className="bg-white p-5 rounded-2xl border border-[#E8DED0] hover:border-[#1E3A8A] shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] px-2.5 py-1 bg-[#F9F6F0] border border-[#E8DED0] text-[#1F2937] font-bold rounded-lg">
                    {doc.semester}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[#1F2937] truncate mb-1" title={doc.file_name}>
                  {doc.file_name}
                </h3>
                <p className="text-xs text-[#A09080] font-semibold mb-3">{doc.document_type}</p>
                
                <div className="pt-3 border-t border-[#F3EFE9] space-y-1 text-xs text-[#737373]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#A09080]">Uploaded:</span>
                    <span>{new Date(doc.created_at || new Date()).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#F3EFE9]">
                <button
                  onClick={() => setPreviewDoc(doc)}
                  className="w-full py-2 bg-[#FFFDF8] hover:bg-[#1E3A8A] hover:text-white border border-[#E8DED0] text-[#1E3A8A] text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Preview & Review
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Document Review Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col p-5 md:p-6 shadow-2xl border border-[#E8DED0] animate-fadeIn">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#F3EFE9]">
              <div className="min-w-0 pr-4">
                <h3 className="text-base font-bold text-[#1F2937] truncate">{previewDoc.file_name}</h3>
                <p className="text-xs text-[#737373] truncate">
                  {previewDoc.semester} • {previewDoc.document_type} • Student:{' '}
                  <span className="font-bold text-[#1F2937]">
                    {selectedStudentForDocs?.full_name || 'Student'}
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {previewUrl && (
                  <>
                    <button
                      onClick={handleDownload}
                      className="px-3 py-1.5 bg-[#FFFDF8] hover:bg-[#F3EFE9] border border-[#E8DED0] text-[#1E3A8A] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Download file"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Download</span>
                    </button>
                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-[#1E3A8A] hover:bg-[#1e40af] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      title="Open full document in new tab"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Open New Tab</span>
                    </a>
                  </>
                )}
                <button
                  onClick={() => {
                    setPreviewDoc(null);
                    setPreviewUrl('');
                    setPreviewError(null);
                  }}
                  className="p-1.5 text-[#737373] hover:text-[#1F2937] hover:bg-[#F3EFE9] rounded-lg transition-colors cursor-pointer"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body / Viewer */}
            <div className="flex-1 overflow-auto bg-[#F9F6F0] rounded-xl flex flex-col items-center justify-center p-3 min-h-[420px] max-h-[65vh]">
              {loadingPreview ? (
                <div className="flex flex-col items-center justify-center gap-3 text-[#737373] py-16">
                  <Loader2 className="w-9 h-9 animate-spin text-[#1E3A8A]" />
                  <p className="text-xs font-semibold">Loading secure document preview...</p>
                </div>
              ) : previewError ? (
                <div className="text-center p-8 max-w-md bg-white rounded-2xl border border-red-200">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                  <p className="text-sm font-bold text-[#1F2937]">Preview Error</p>
                  <p className="text-xs text-[#737373] mt-1 mb-4">{previewError}</p>
                  {previewUrl && (
                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1E3A8A] text-white text-xs font-bold rounded-xl shadow-xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open Directly
                    </a>
                  )}
                </div>
              ) : !previewUrl ? (
                <div className="text-center p-8 max-w-md bg-white rounded-2xl border border-[#E8DED0]">
                  <FileText className="w-12 h-12 text-[#A09080] mx-auto mb-3 opacity-50" />
                  <p className="text-sm font-bold text-[#1F2937]">Document Unavailable</p>
                  <p className="text-xs text-[#737373] mt-1">Unable to locate file in storage.</p>
                </div>
              ) : isPdf ? (
                <div className="w-full h-full flex flex-col gap-2">
                  <div className="flex items-center justify-between px-3 py-1.5 bg-white rounded-lg border border-[#E8DED0] text-[11px] text-[#4F4F4F]">
                    <span className="font-semibold">PDF Document View</span>
                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#1E3A8A] hover:underline font-bold flex items-center gap-1"
                    >
                      Open in separate window
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <iframe
                    src={previewUrl}
                    title={previewDoc.file_name}
                    className="w-full flex-1 min-h-[440px] rounded-xl border border-[#E8DED0] bg-white shadow-xs"
                  />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center p-2">
                  <img
                    src={previewUrl}
                    alt={previewDoc.file_name}
                    className="max-h-[500px] max-w-full object-contain rounded-xl shadow-md border border-[#E8DED0] bg-white"
                  />
                </div>
              )}
            </div>

            {/* Modal Footer Quick Info */}
            <div className="mt-3 pt-3 border-t border-[#F3EFE9] flex items-center justify-between text-[11px] text-[#737373]">
              <span>Type: {previewDoc.document_type}</span>
              <span>Uploaded: {new Date(previewDoc.created_at || new Date()).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
INNER_EOF
