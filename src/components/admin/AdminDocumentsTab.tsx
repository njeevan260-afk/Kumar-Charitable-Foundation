import React, { useState, useMemo, useEffect } from 'react';
import { AcademicDocument, StudentProfile } from '../../types/student';
import { resolveDocumentPreview } from '../../utils/documentViewer';
import {
  Search,
  FileText,
  Filter,
  Eye,
  ExternalLink,
  Download,
  X,
  Loader2,
  Calendar,
  User,
  ShieldCheck,
  AlertCircle,
  Maximize2,
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
  const [selectedSemester, setSelectedSemester] = useState('ALL');
  const [selectedDocType, setSelectedDocType] = useState('ALL');

  // Preview state
  const [previewDoc, setPreviewDoc] = useState<AcademicDocument | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isPdf, setIsPdf] = useState(false);
  const [isImage, setIsImage] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Semesters list
  const semesters = useMemo(() => {
    const set = new Set<string>();
    documents.forEach((d) => d.semester && set.add(d.semester));
    return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [documents]);

  // Document types list
  const docTypes = useMemo(() => {
    const set = new Set<string>();
    documents.forEach((d) => d.document_type && set.add(d.document_type));
    return Array.from(set).sort();
  }, [documents]);

  // Filtered documents
  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      const student = students.find((s) => s.id === doc.user_id);
      const studentName = student?.full_name?.toLowerCase() || '';
      const studentEmail = student?.email?.toLowerCase() || '';
      const term = searchTerm.toLowerCase();

      const matchesSearch =
        !term ||
        studentName.includes(term) ||
        studentEmail.includes(term) ||
        doc.file_name.toLowerCase().includes(term) ||
        doc.semester.toLowerCase().includes(term) ||
        doc.document_type.toLowerCase().includes(term);

      if (!matchesSearch) return false;

      if (selectedSemester !== 'ALL' && doc.semester !== selectedSemester) return false;
      if (selectedDocType !== 'ALL' && doc.document_type !== selectedDocType) return false;

      return true;
    });
  }, [documents, students, searchTerm, selectedSemester, selectedDocType]);

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
        console.error('Preview error:', err);
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

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSemester('ALL');
    setSelectedDocType('ALL');
  };

  const hasActiveFilters = searchTerm || selectedSemester !== 'ALL' || selectedDocType !== 'ALL';

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

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
          <h2 className="text-xl md:text-2xl font-serif font-bold text-[#1F2937]">Student Documents Repository</h2>
          <p className="text-xs text-[#737373] mt-0.5">
            Showing {filteredDocs.length} of {documents.length} uploaded files (Private Storage)
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#A09080] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student, file name, semester..."
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
      </div>

      {/* Filter Bars */}
      <div className="bg-white p-4 rounded-2xl border border-[#E8DED0] flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#1F2937]">
            <Filter className="w-3.5 h-3.5 text-[#1E3A8A]" />
            Filters:
          </div>

          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="py-1.5 px-3 bg-[#FFFDF8] border border-[#E8DED0] rounded-xl text-xs text-[#1F2937] outline-none cursor-pointer focus:border-[#1E3A8A]"
          >
            <option value="ALL">All Semesters ({semesters.length})</option>
            {semesters.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={selectedDocType}
            onChange={(e) => setSelectedDocType(e.target.value)}
            className="py-1.5 px-3 bg-[#FFFDF8] border border-[#E8DED0] rounded-xl text-xs text-[#1F2937] outline-none cursor-pointer focus:border-[#1E3A8A]"
          >
            <option value="ALL">All Document Types ({docTypes.length})</option>
            {docTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-[#1E3A8A] hover:underline font-semibold cursor-pointer"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Documents List */}
      {filteredDocs.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-[#E8DED0]">
          <FileText className="w-12 h-12 text-[#A09080] mx-auto mb-3 opacity-40" />
          <p className="text-base font-bold text-[#1F2937]">No Documents Found</p>
          <p className="text-xs text-[#737373] mt-1">Adjust search keywords or clear active filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => {
            const student = students.find((s) => s.id === doc.user_id);

            return (
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
                      <span className="text-[#A09080]">Student:</span>
                      <button
                        onClick={() => student && onSelectStudent(student)}
                        className="font-bold text-[#1F2937] hover:text-[#1E3A8A] hover:underline truncate max-w-[150px] cursor-pointer"
                      >
                        {student?.full_name || 'Student'}
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#A09080]">Uploaded:</span>
                      <span>{new Date(doc.uploaded_at).toLocaleDateString()}</span>
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
            );
          })}
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
                    {students.find((s) => s.id === previewDoc.user_id)?.full_name || 'Student'}
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
              <span>Uploaded: {new Date(previewDoc.uploaded_at).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
