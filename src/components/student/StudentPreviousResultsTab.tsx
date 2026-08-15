import React, { useState, useEffect } from 'react';
import { AcademicRecord, AcademicDocument } from '../../types/student';
import { History, FileText, Eye, Award, X, ExternalLink, Loader2, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../supabaseClient';

interface StudentPreviousResultsTabProps {
  records: AcademicRecord[];
  documents: AcademicDocument[];
  onNavigateTab: (tabId: string) => void;
}

export const StudentPreviousResultsTab: React.FC<StudentPreviousResultsTabProps> = ({
  records,
  documents,
  onNavigateTab,
}) => {
  const [selectedRecord, setSelectedRecord] = useState<AcademicRecord | null>(null);
  const [activeSemDocs, setActiveSemDocs] = useState<AcademicDocument[]>([]);
  const [selectedDocIndex, setSelectedDocIndex] = useState<number>(0);
  const [resolvedUrl, setResolvedUrl] = useState<string>('');
  const [loadingUrl, setLoadingUrl] = useState<boolean>(false);

  // Group records and documents by semester
  const allSemesters = Array.from(
    new Set([...records.map((r) => r.semester), ...documents.map((d) => d.semester)])
  ).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

  const activeDoc = activeSemDocs[selectedDocIndex] || null;

  // Resolve signed/working URL whenever activeDoc changes
  useEffect(() => {
    if (!activeDoc) {
      setResolvedUrl('');
      return;
    }

    let isMounted = true;
    const fetchUrl = async () => {
      setLoadingUrl(true);
      const rawPath = activeDoc.file_path || '';

      // If rawPath is already a data: URL or blob: URL, use directly
      if (rawPath.startsWith('data:') || rawPath.startsWith('blob:')) {
        if (isMounted) {
          setResolvedUrl(rawPath);
          setLoadingUrl(false);
        }
        return;
      }

      // If it's a Supabase storage path or URL
      try {
        let storageFilePath = rawPath;
        if (storageFilePath.includes('/student-documents/')) {
          storageFilePath = storageFilePath.split('/student-documents/')[1];
        }

        // Try getting a signed URL from storage bucket
        const { data, error } = await supabase.storage
          .from('student-documents')
          .createSignedUrl(storageFilePath, 3600);

        if (!error && data?.signedUrl && isMounted) {
          setResolvedUrl(data.signedUrl);
          setLoadingUrl(false);
          return;
        }
      } catch (err) {
         // ('Could not create signed URL for document preview:', err);
      }

      // Fallback to the raw URL/path
      if (isMounted) {
        setResolvedUrl(rawPath);
        setLoadingUrl(false);
      }
    };

    fetchUrl();

    return () => {
      isMounted = false;
    };
  }, [activeDoc]);

  const handleOpenDocModal = (semDocs: AcademicDocument[]) => {
    setActiveSemDocs(semDocs);
    setSelectedDocIndex(0);
  };

  const handleCloseDocModal = () => {
    setActiveSemDocs([]);
    setSelectedDocIndex(0);
    setResolvedUrl('');
  };

  const isPdf =
    activeDoc?.file_type?.includes('pdf') ||
    activeDoc?.file_name?.toLowerCase().endsWith('.pdf') ||
    resolvedUrl?.toLowerCase().includes('.pdf');

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl">
      <div className="pb-4 border-b border-[#E8DED0]">
        <h1 className="text-2xl md:text-3xl font-serif text-[#1F2937] font-bold">Previous Results</h1>
        <p className="text-sm text-[#737373] mt-1">
          Review your historical semester performance, verified scores, and uploaded marksheets.
        </p>
      </div>

      {allSemesters.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-[#E8DED0] text-center max-w-xl mx-auto my-8">
          <div className="w-16 h-16 rounded-full bg-blue-50 text-[#1E3A8A] flex items-center justify-center mx-auto mb-4">
            <History className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-serif font-bold text-[#1F2937] mb-2">No Previous Results Found</h3>
          <p className="text-sm text-[#737373] mb-6 leading-relaxed">
            You have not recorded any previous semester results or uploaded marks cards yet.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => onNavigateTab('academic')}
              className="px-4 py-2 bg-[#1E3A8A] hover:bg-[#1e40af] text-white text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer"
            >
              Add Academic Record
            </button>
            <button
              onClick={() => onNavigateTab('documents')}
              className="px-4 py-2 bg-white border border-[#E8DED0] hover:bg-[#FFFDF8] text-[#1F2937] text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer"
            >
              Upload Marks Report
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {allSemesters.map((sem) => {
            const semRecords = records.filter((r) => r.semester === sem);
            const semDocs = documents.filter((d) => d.semester === sem);

            return (
              <div
                key={sem}
                className="bg-white p-6 rounded-2xl border border-[#E8DED0] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <span className="px-3 py-1 bg-blue-50 text-[#1E3A8A] font-bold text-sm rounded-lg">
                      {sem}
                    </span>
                    {semRecords[0]?.academic_year && (
                      <span className="text-xs text-[#A09080] font-medium">
                        Academic Year: {semRecords[0].academic_year}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#4F4F4F]">
                    {semRecords.length > 0 ? (
                      <div className="flex items-center gap-1.5 font-semibold text-[#1F2937]">
                        <Award className="w-4 h-4 text-amber-500" />
                        <span>
                          {semRecords[0].score_type}: {semRecords[0].score}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[#A09080] italic">No score recorded</span>
                    )}

                    <span className="text-[#E8DED0]">•</span>

                    <div className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{semDocs.length} Document(s) Attached</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 pt-4 md:pt-0 border-t md:border-t-0 border-[#F3EFE9]">
                  {semRecords.length > 0 ? (
                    <button
                      onClick={() => setSelectedRecord(semRecords[0])}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FFFDF8] hover:bg-[#F3EFE9] border border-[#E8DED0] text-[#1F2937] text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#1E3A8A]" />
                      View Academic Record
                    </button>
                  ) : (
                    <button
                      onClick={() => onNavigateTab('academic')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-dashed border-[#E8DED0] hover:border-[#1E3A8A] text-xs text-[#1E3A8A] font-medium rounded-xl transition-colors cursor-pointer"
                    >
                      + Add Record
                    </button>
                  )}

                  {semDocs.length > 0 ? (
                    <button
                      onClick={() => handleOpenDocModal(semDocs)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1E3A8A] hover:bg-[#1e40af] text-white text-xs font-semibold rounded-xl transition-colors shadow-xs cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      View Uploaded Report ({semDocs.length})
                    </button>
                  ) : (
                    <button
                      onClick={() => onNavigateTab('documents')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-dashed border-[#E8DED0] hover:border-[#1E3A8A] text-xs text-[#1E3A8A] font-medium rounded-xl transition-colors cursor-pointer"
                    >
                      + Upload Document
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View Academic Record Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 md:p-8 shadow-xl border border-[#E8DED0] animate-fadeIn">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#F3EFE9]">
              <h3 className="text-xl font-serif font-bold text-[#1F2937]">{selectedRecord.semester} Record</h3>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1.5 text-[#737373] hover:text-[#1F2937] rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-[#FFFDF8] p-4 rounded-xl border border-[#F3EFE9] space-y-2.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#A09080] font-bold uppercase">Academic Year:</span>
                  <span className="font-semibold text-[#1F2937]">{selectedRecord.academic_year || 'Not specified'}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#A09080] font-bold uppercase">Score Type:</span>
                  <span className="font-semibold text-[#1F2937]">{selectedRecord.score_type}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#A09080] font-bold uppercase">Score / Result:</span>
                  <span className="font-bold text-base text-[#1E3A8A]">{selectedRecord.score}</span>
                </div>
              </div>

              {selectedRecord.remarks && (
                <div>
                  <span className="text-xs text-[#A09080] font-bold uppercase block mb-1">Remarks</span>
                  <p className="text-sm text-[#4F4F4F] bg-[#F9F6F0] p-3 rounded-xl border border-[#E8DED0]">
                    {selectedRecord.remarks}
                  </p>
                </div>
              )}

              <div className="pt-3 border-t border-[#F3EFE9] flex justify-end">
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="px-5 py-2 bg-[#1E3A8A] text-white text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {activeDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col p-6 shadow-2xl border border-[#E8DED0] animate-fadeIn">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#F3EFE9]">
              <div>
                <h3 className="text-base font-bold text-[#1F2937] truncate max-w-md">{activeDoc.file_name}</h3>
                <p className="text-xs text-[#737373]">{activeDoc.semester} • {activeDoc.document_type}</p>
              </div>
              <div className="flex items-center gap-2">
                {resolvedUrl && (
                  <a
                    href={resolvedUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-[#FFFDF8] hover:bg-[#F3EFE9] border border-[#E8DED0] text-[#1E3A8A] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Open in new tab"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open Tab
                  </a>
                )}
                <button
                  onClick={handleCloseDocModal}
                  className="p-1.5 text-[#737373] hover:text-[#1F2937] rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Selector if multiple reports exist for the semester */}
            {activeSemDocs.length > 1 && (
              <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1">
                <span className="text-xs text-[#A09080] font-semibold whitespace-nowrap">Files:</span>
                {activeSemDocs.map((doc, idx) => (
                  <button
                    key={doc.id || idx}
                    onClick={() => setSelectedDocIndex(idx)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors truncate max-w-[180px] cursor-pointer ${
                      selectedDocIndex === idx
                        ? 'bg-[#1E3A8A] text-white'
                        : 'bg-[#FFFDF8] border border-[#E8DED0] text-[#737373] hover:text-[#1F2937]'
                    }`}
                  >
                    {doc.file_name}
                  </button>
                ))}
              </div>
            )}

            <div className="flex-1 overflow-auto bg-[#F9F6F0] rounded-xl flex items-center justify-center p-2 min-h-[380px] relative">
              {loadingUrl ? (
                <div className="flex flex-col items-center justify-center gap-2 text-[#737373]">
                  <Loader2 className="w-8 h-8 animate-spin text-[#1E3A8A]" />
                  <p className="text-xs">Loading report preview...</p>
                </div>
              ) : !resolvedUrl ? (
                <div className="text-center p-6">
                  <FileText className="w-12 h-12 text-[#A09080] mx-auto mb-2" />
                  <p className="text-sm font-semibold text-[#1F2937]">Preview Not Available</p>
                  <p className="text-xs text-[#737373] mt-1">
                    The uploaded document could not be retrieved from storage.
                  </p>
                </div>
              ) : isPdf ? (
                <object
                  data={resolvedUrl}
                  type="application/pdf"
                  className="w-full h-[520px] rounded-lg border-0 bg-white"
                >
                  <iframe
                    src={resolvedUrl}
                    title={activeDoc.file_name}
                    className="w-full h-[520px] rounded-lg border-0 bg-white"
                  >
                    <div className="p-6 text-center">
                      <p className="text-sm text-[#1F2937] mb-2 font-semibold">PDF preview cannot be embedded directly.</p>
                      <a
                        href={resolvedUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1E3A8A] text-white text-xs font-semibold rounded-xl"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Click to View PDF in New Tab
                      </a>
                    </div>
                  </iframe>
                </object>
              ) : (
                <img
                  src={resolvedUrl}
                  alt={activeDoc.file_name}
                  className="max-h-[520px] max-w-full object-contain rounded-lg shadow-xs"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

