import React, { useState, useRef, useEffect } from 'react';
import { AcademicDocument, DocumentType } from '../../types/student';
import { supabase } from '../../supabaseClient';
import { resolveDocumentPreview } from '../../utils/documentViewer';
import { generateUUID } from '../../utils/uuid';
import { UploadCloud, FileText, Trash2, Eye, ExternalLink, AlertCircle, CheckCircle2, Loader2, X, File, Image as ImageIcon, Download } from 'lucide-react';

interface StudentDocumentsTabProps {
  studentId: string;
  documents: AcademicDocument[];
  onDocumentsChange: (docs: AcademicDocument[]) => void;
}

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
const MAX_PDF_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

export const StudentDocumentsTab: React.FC<StudentDocumentsTabProps> = ({
  studentId,
  documents,
  onDocumentsChange,
}) => {
  const [semester, setSemester] = useState('Semester 1');
  const [documentType, setDocumentType] = useState<DocumentType>('Marks Card');
  const [customDocType, setCustomDocType] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<AcademicDocument | null>(null);
  const [resolvedUrl, setResolvedUrl] = useState<string>('');
  const [isPdf, setIsPdf] = useState(false);
  const [isImage, setIsImage] = useState(false);
  const [loadingUrl, setLoadingUrl] = useState<boolean>(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Resolve signed/working URL whenever previewDoc changes
  useEffect(() => {
    if (!previewDoc) {
      setResolvedUrl('');
      setPreviewError(null);
      return;
    }

    let isMounted = true;
    const fetchUrl = async () => {
      setLoadingUrl(true);
      setPreviewError(null);

      try {
        const res = await resolveDocumentPreview(
          previewDoc.file_path,
          previewDoc.file_name,
          previewDoc.file_type
        );

        if (!isMounted) return;

        if (res.url) {
          setResolvedUrl(res.url);
          setIsPdf(res.isPdf);
          setIsImage(res.isImage);
        } else {
          setPreviewError(res.error || 'Preview could not be retrieved.');
        }
      } catch (err: any) {
        if (!isMounted) return;
        setPreviewError(err.message || 'Failed to generate preview.');
      } finally {
        if (isMounted) {
          setLoadingUrl(false);
        }
      }
    };

    fetchUrl();

    return () => {
      isMounted = false;
    };
  }, [previewDoc]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      const isImage =
        file.type.startsWith('image/') ||
        ['.jpg', '.jpeg', '.png'].some((ext) => file.name.toLowerCase().endsWith(ext));

      if (!ALLOWED_TYPES.includes(file.type) && !isPdf && !isImage) {
        setErrorMsg('Invalid file format. Please upload a PDF, JPG, JPEG, or PNG file.');
        setSelectedFile(null);
        return;
      }

      if (isPdf && file.size > MAX_PDF_SIZE) {
        setErrorMsg('PDF file size exceeds the 5MB limit. Please upload a document up to 5MB.');
        setSelectedFile(null);
        return;
      }

      if (isImage && file.size > MAX_IMAGE_SIZE) {
        setErrorMsg(
          `Image size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the 5 MB limit. Please compress or resize the image to under 5 MB.`
        );
        setSelectedFile(null);
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMsg('Please select a document to upload.');
      return;
    }

    if (documentType === 'Other' && !customDocType.trim()) {
      setErrorMsg('Please specify what other document you are uploading.');
      return;
    }

    const effectiveDocType =
      documentType === 'Other'
        ? (customDocType.trim() ? `Other (${customDocType.trim()})` : 'Other Document')
        : documentType;

    setUploading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const now = new Date().toISOString();
    const docId = generateUUID();
    const cleanFileName = selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `${studentId}/${Date.now()}_${cleanFileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('student-documents')
        .upload(storagePath, selectedFile, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        throw new Error(`Storage upload failed: ${uploadError.message}`);
      }

      const newDocPayload: any = {
        id: docId,
        user_id: studentId,
        semester,
        document_type: effectiveDocType,
        file_path: storagePath,
        file_name: selectedFile.name,
        file_type: selectedFile.type || 'application/octet-stream',
        file_size: selectedFile.size,
        uploaded_at: now,
      };

      // Save record in database
      let { error: dbError } = await supabase
        .from('academic_documents')
        .insert(newDocPayload);

      if (dbError && dbError.message?.includes('user_id')) {
        delete newDocPayload.user_id;
        newDocPayload.student_id = studentId;
        const fallback = await supabase
          .from('academic_documents')
          .insert(newDocPayload);
        dbError = fallback.error;
      }

      if (dbError) {
        console.warn('Database insert warning (fallback to local state):', dbError.message);
      }

      const newDoc: AcademicDocument = {
        id: docId,
        user_id: studentId,
        semester,
        document_type: effectiveDocType,
        file_path: storagePath,
        file_name: selectedFile.name,
        file_type: selectedFile.type,
        file_size: selectedFile.size,
        uploaded_at: now,
      };

      onDocumentsChange([newDoc, ...documents]);
      setSuccessMsg(`"${selectedFile.name}" uploaded successfully.`);
      setSelectedFile(null);
      setCustomDocType('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to upload document.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId: string, filePath: string) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      // Delete from storage if applicable
      if (filePath.includes('student-documents')) {
        const pathAfterBucket = filePath.split('student-documents/')[1];
        if (pathAfterBucket) {
          await supabase.storage.from('student-documents').remove([pathAfterBucket]);
        }
      }

      // Delete from database
      let { error: dbError } = await supabase
        .from('academic_documents')
        .delete()
        .eq('id', docId)
        .eq('user_id', studentId);

      if (dbError && dbError.message?.includes('user_id')) {
        const fallback = await supabase
          .from('academic_documents')
          .delete()
          .eq('id', docId)
          .eq('student_id', studentId);
        dbError = fallback.error;
      }

      if (dbError) {
        console.warn('Database delete warning:', dbError.message);
      }

      const updated = documents.filter((d) => d.id !== docId);
      onDocumentsChange(updated);
      setSuccessMsg('Document removed.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete document.');
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl">
      <div className="pb-4 border-b border-[#E8DED0]">
        <h1 className="text-2xl md:text-3xl font-serif text-[#1F2937] font-bold">
          Upload Marks & Documents
        </h1>
        <p className="text-sm text-[#737373] mt-1">
          Upload official marks cards, result sheets, internal assessments, and merit certificates.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 rounded-xl flex items-start gap-3 border border-emerald-200 text-emerald-800 text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 rounded-xl flex items-start gap-3 border border-red-200 text-red-800 text-sm">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Upload Form Box */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xs border border-[#E8DED0]">
        <div className="flex items-center gap-2.5 mb-6 pb-3 border-b border-[#F3EFE9]">
          <UploadCloud className="w-5 h-5 text-[#1E3A8A]" />
          <h2 className="text-lg font-serif font-bold text-[#1F2937]">Upload New Document</h2>
        </div>

        <form onSubmit={handleUpload} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase font-bold text-[#A09080] tracking-wider mb-1.5">
                Semester / Academic Level
              </label>
              <input
                type="text"
                required
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                placeholder="e.g. Semester 1, 2nd Year PUC"
                className="w-full px-4 py-2.5 bg-[#FFFDF8] border border-[#E8DED0] rounded-xl text-sm text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-[#A09080] tracking-wider mb-1.5">
                Document Type
              </label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value as DocumentType)}
                className="w-full px-3 py-2.5 bg-[#FFFDF8] border border-[#E8DED0] rounded-xl text-sm text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
              >
                <option value="Marks Card">Marks Card</option>
                <option value="Result">Result Sheet</option>
                <option value="Internal Assessment">Internal Assessment</option>
                <option value="Academic Certificate">Academic Certificate</option>
                <option value="Other">Other Document</option>
              </select>
            </div>
          </div>

          {documentType === 'Other' && (
            <div className="animate-fadeIn">
              <label className="block text-xs uppercase font-bold text-[#A09080] tracking-wider mb-1.5">
                Specify Document Name / Type <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={customDocType}
                onChange={(e) => setCustomDocType(e.target.value)}
                placeholder="e.g. Transfer Certificate, Fee Receipt, Bonafide Certificate, ID Card"
                className="w-full px-4 py-2.5 bg-[#FFFDF8] border border-[#E8DED0] rounded-xl text-sm text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
              />
            </div>
          )}

          <div>
            <label className="block text-xs uppercase font-bold text-[#A09080] tracking-wider mb-1.5">
              Select Document (PDF up to 2MB, Images up to 50KB)
            </label>
            <div className="border-2 border-dashed border-[#E8DED0] hover:border-[#1E3A8A] rounded-2xl p-6 text-center bg-[#FFFDF8] transition-colors cursor-pointer relative">
              <input
                id="doc-file-upload"
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                onChange={handleFileChange}
                onClick={(e) => { e.currentTarget.value = ''; }}
                className="hidden"
              />
              <label htmlFor="doc-file-upload" className="flex flex-col items-center w-full h-full cursor-pointer">
                <UploadCloud className="w-10 h-10 text-[#1E3A8A] mb-2" />
                <p className="text-sm font-semibold text-[#1F2937]">
                  {selectedFile ? selectedFile.name : 'Click or drag and drop document here'}
                </p>
                <p className="text-xs text-[#737373] mt-1">
                  {selectedFile
                    ? `File size: ${formatFileSize(selectedFile.size)}`
                    : 'Supported formats: PDF, JPG, JPEG, PNG (up to 5MB)'}
                </p>
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#1E3A8A] hover:bg-[#1e40af] text-white rounded-xl text-sm font-semibold transition-all shadow-xs hover:shadow-md disabled:opacity-50 cursor-pointer"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
              {uploading ? 'Uploading Document...' : 'Upload Document'}
            </button>
          </div>
        </form>
      </div>

      {/* Uploaded Documents List */}
      <div>
        <h2 className="text-xl font-serif text-[#1F2937] font-bold mb-4">My Uploaded Documents</h2>

        {documents.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl border border-[#E8DED0] text-center">
            <FileText className="w-12 h-12 text-[#A09080] mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#1F2937] mb-1">No Documents Uploaded</h3>
            <p className="text-xs text-[#737373]">
              Upload your semester marks cards or certificates above to keep them accessible.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map((doc) => {
              const isPdf = doc.file_type.includes('pdf') || doc.file_name.toLowerCase().endsWith('.pdf');
              return (
                <div
                  key={doc.id}
                  className="bg-white p-5 rounded-2xl border border-[#E8DED0] shadow-xs flex flex-col justify-between"
                >
                  <div className="flex items-start gap-3.5 mb-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${isPdf ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-[#1E3A8A]'}`}>
                      {isPdf ? <FileText className="w-6 h-6" /> : <ImageIcon className="w-6 h-6" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-[#FFFDF8] border border-[#E8DED0] text-[11px] font-bold rounded text-[#1F2937]">
                          {doc.semester}
                        </span>
                        <span className="text-[11px] font-semibold text-[#1E3A8A]">
                          {doc.document_type}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-[#1F2937] truncate mt-1" title={doc.file_name}>
                        {doc.file_name}
                      </h4>
                      <p className="text-xs text-[#737373] mt-0.5">
                        Uploaded on: {new Date(doc.uploaded_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#F3EFE9]">
                    <button type="button"
                      onClick={() => setPreviewDoc(doc)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1E3A8A] hover:underline cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </button>

                    <div className="flex items-center gap-2">
                      <button type="button"
                        onClick={() => handleDelete(doc.id, doc.file_path)}
                        className="p-1.5 text-[#737373] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col p-6 shadow-2xl border border-[#E8DED0] animate-fadeIn">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#F3EFE9]">
              <div>
                <h3 className="text-base font-bold text-[#1F2937] truncate">{previewDoc.file_name}</h3>
                <p className="text-xs text-[#737373]">{previewDoc.semester} • {previewDoc.document_type}</p>
              </div>
              <div className="flex items-center gap-2">
                {resolvedUrl && (
                  <>
                    <a
                      href={resolvedUrl}
                      download={previewDoc.file_name}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-[#FFFDF8] hover:bg-[#F3EFE9] border border-[#E8DED0] text-[#1E3A8A] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Download file"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </a>
                    <a
                      href={resolvedUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-[#1E3A8A] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      title="Open in new tab"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open Tab
                    </a>
                  </>
                )}
                <button type="button"
                  onClick={() => {
                    setPreviewDoc(null);
                    setResolvedUrl('');
                    setPreviewError(null);
                  }}
                  className="p-1.5 text-[#737373] hover:text-[#1F2937] hover:bg-[#F3EFE9] rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto bg-[#F9F6F0] rounded-xl flex flex-col items-center justify-center p-2 min-h-[380px]">
              {loadingUrl ? (
                <div className="flex flex-col items-center justify-center gap-2 text-[#737373] py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[#1E3A8A]" />
                  <p className="text-xs">Loading document preview...</p>
                </div>
              ) : previewError ? (
                <div className="text-center p-6 bg-white rounded-xl border border-red-200">
                  <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
                  <p className="text-xs font-bold text-[#1F2937]">Preview Notice</p>
                  <p className="text-[11px] text-[#737373] mt-1 mb-3">{previewError}</p>
                  {resolvedUrl && (
                    <a
                      href={resolvedUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1E3A8A] text-white text-xs font-bold rounded-lg"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open Directly
                    </a>
                  )}
                </div>
              ) : !resolvedUrl ? (
                <div className="text-center p-6">
                  <FileText className="w-12 h-12 text-[#A09080] mx-auto mb-2" />
                  <p className="text-sm font-semibold text-[#1F2937]">Preview Not Available</p>
                  <p className="text-xs text-[#737373] mt-1">
                    The document could not be retrieved from storage.
                  </p>
                </div>
              ) : isPdf ? (
                <iframe
                  src={resolvedUrl}
                  title={previewDoc.file_name}
                  className="w-full h-[520px] rounded-lg border border-[#E8DED0] bg-white shadow-xs"
                />
              ) : (
                <img
                  src={resolvedUrl}
                  alt={previewDoc.file_name}
                  className="max-h-[500px] max-w-full object-contain rounded-lg shadow-xs border border-[#E8DED0]"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
