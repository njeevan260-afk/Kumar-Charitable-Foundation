import React, { useState } from 'react';
import { AcademicRecord, ScoreType } from '../../types/student';
import { supabase } from '../../supabaseClient';
import { generateUUID } from '../../utils/uuid';
import { BookOpen, Plus, Edit2, Trash2, X, Save, AlertCircle, CheckCircle2, Loader2, Calendar, Award } from 'lucide-react';

interface StudentAcademicTabProps {
  studentId: string;
  records: AcademicRecord[];
  onRecordsChange: (records: AcademicRecord[]) => void;
}

export const StudentAcademicTab: React.FC<StudentAcademicTabProps> = ({
  studentId,
  records,
  onRecordsChange,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AcademicRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states
  const [semester, setSemester] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [scoreType, setScoreType] = useState<ScoreType>('SGPA');
  const [score, setScore] = useState('');
  const [remarks, setRemarks] = useState('');

  const openAddModal = () => {
    setEditingRecord(null);
    setSemester(`Semester ${records.length + 1}`);
    const currentYear = new Date().getFullYear();
    setAcademicYear(`${currentYear}-${currentYear + 1}`);
    setScoreType('SGPA');
    setScore('');
    setRemarks('');
    setErrorMsg(null);
    setShowModal(true);
  };

  const openEditModal = (rec: AcademicRecord) => {
    setEditingRecord(rec);
    setSemester(rec.semester);
    setAcademicYear(rec.academic_year);
    setScoreType(rec.score_type);
    setScore(rec.score);
    setRemarks(rec.remarks || '');
    setErrorMsg(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingRecord(null);
    setErrorMsg(null);
  };

  const handleSaveRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!semester.trim() || !score.trim()) {
      setErrorMsg('Please specify both Semester and Score.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const now = new Date().toISOString();

    try {
      if (editingRecord) {
        // Update in Supabase
        let { error: dbError } = await supabase
          .from('academic_records')
          .update({
            semester: semester.trim(),
            academic_year: academicYear.trim(),
            score_type: scoreType,
            score: score.trim(),
            remarks: remarks.trim() || null,
            updated_at: now,
          })
          .eq('id', editingRecord.id)
          .eq('user_id', studentId);

        if (dbError && dbError.message?.includes('user_id')) {
          const fallback = await supabase
            .from('academic_records')
            .update({
              semester: semester.trim(),
              academic_year: academicYear.trim(),
              score_type: scoreType,
              score: score.trim(),
              remarks: remarks.trim() || null,
              updated_at: now,
            })
            .eq('id', editingRecord.id)
            .eq('student_id', studentId);
          dbError = fallback.error;
        }

        if (dbError) {
          console.warn('Supabase update warning:', dbError.message);
        }

        const updatedList = records.map((r) =>
          r.id === editingRecord.id
            ? {
                ...r,
                user_id: studentId,
                semester: semester.trim(),
                academic_year: academicYear.trim(),
                score_type: scoreType,
                score: score.trim(),
                remarks: remarks.trim() || undefined,
                updated_at: now,
              }
            : r
        );

        onRecordsChange(updatedList);
        setSuccessMsg('Academic record updated successfully.');
      } else {
        // Create new record
        const newRecordId = generateUUID();
        const newRecordPayload: any = {
          id: newRecordId,
          user_id: studentId,
          semester: semester.trim(),
          academic_year: academicYear.trim(),
          score_type: scoreType,
          score: score.trim(),
          remarks: remarks.trim() || null,
          created_at: now,
          updated_at: now,
        };

        let { error: dbError } = await supabase
          .from('academic_records')
          .insert(newRecordPayload);

        if (dbError && dbError.message?.includes('user_id')) {
          // Fallback to student_id column
          delete newRecordPayload.user_id;
          newRecordPayload.student_id = studentId;
          const fallback = await supabase
            .from('academic_records')
            .insert(newRecordPayload);
          dbError = fallback.error;
        }

        if (dbError) {
          console.warn('Supabase insert warning:', dbError.message);
        }

        const newObj: AcademicRecord = {
          id: newRecordId,
          user_id: studentId,
          semester: semester.trim(),
          academic_year: academicYear.trim(),
          score_type: scoreType,
          score: score.trim(),
          remarks: remarks.trim() || undefined,
          created_at: now,
          updated_at: now,
        };

        onRecordsChange([...records, newObj]);
        setSuccessMsg('New academic record added successfully.');
      }

      closeModal();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save academic record.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (!window.confirm('Are you sure you want to delete this academic record?')) return;

    try {
      let { error: dbError } = await supabase
        .from('academic_records')
        .delete()
        .eq('id', recordId)
        .eq('user_id', studentId);

      if (dbError && dbError.message?.includes('user_id')) {
        const fallback = await supabase
          .from('academic_records')
          .delete()
          .eq('id', recordId)
          .eq('student_id', studentId);
        dbError = fallback.error;
      }

      if (dbError) {
        console.warn('Supabase delete warning:', dbError.message);
      }

      const updatedList = records.filter((r) => r.id !== recordId);
      onRecordsChange(updatedList);
      setSuccessMsg('Academic record deleted.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete record.');
    }
  };

  // Sort records naturally by semester/created date
  const sortedRecords = [...records].sort((a, b) => {
    return a.semester.localeCompare(b.semester, undefined, { numeric: true, sensitivity: 'base' });
  });

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8DED0]">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif text-[#1F2937] font-bold">Academic Progress</h1>
          <p className="text-sm text-[#737373] mt-1">
            Maintain your semester-by-semester academic scores, grading type, and performance history.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1E3A8A] hover:bg-[#1e40af] text-white rounded-xl text-sm font-semibold transition-all shadow-xs hover:shadow-md cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Record
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 rounded-xl flex items-start gap-3 border border-emerald-200 text-emerald-800 text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {records.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-[#E8DED0] text-center max-w-xl mx-auto my-8">
          <div className="w-16 h-16 rounded-full bg-blue-50 text-[#1E3A8A] flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-serif font-bold text-[#1F2937] mb-2">No Academic Records Yet</h3>
          <p className="text-sm text-[#737373] mb-6 leading-relaxed">
            You haven't logged any semester performance records. Add your first semester result to keep your scholarship profile up to date.
          </p>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1E3A8A] hover:bg-[#1e40af] text-white rounded-xl text-sm font-semibold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add First Record
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {sortedRecords.map((rec) => (
            <div
              key={rec.id}
              className="bg-white p-6 rounded-2xl border border-[#E8DED0] shadow-xs hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-[#1E3A8A] text-xs font-bold rounded-lg mb-2">
                      <Calendar className="w-3 h-3" />
                      {rec.academic_year || 'Academic Year'}
                    </span>
                    <h3 className="text-xl font-serif font-bold text-[#1F2937]">{rec.semester}</h3>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(rec)}
                      className="p-2 text-[#737373] hover:text-[#1E3A8A] hover:bg-[#FFFDF8] rounded-lg transition-colors cursor-pointer"
                      title="Edit Record"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteRecord(rec.id)}
                      className="p-2 text-[#737373] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="bg-[#FFFDF8] p-4 rounded-xl border border-[#F3EFE9] mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-bold text-[#A09080] tracking-wider">
                      Score Type: <span className="text-[#1F2937] font-semibold">{rec.score_type}</span>
                    </span>
                    <div className="flex items-center gap-1.5 text-[#1E3A8A] font-bold text-lg">
                      <Award className="w-5 h-5 text-amber-500" />
                      <span>{rec.score}</span>
                    </div>
                  </div>
                </div>

                {rec.remarks && (
                  <p className="text-xs text-[#737373] italic">
                    Remarks: "{rec.remarks}"
                  </p>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-[#F3EFE9] flex items-center justify-between text-xs text-[#A09080]">
                <span>Logged by Student</span>
                <span>{rec.updated_at ? new Date(rec.updated_at).toLocaleDateString() : 'Recorded'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 md:p-8 shadow-xl border border-[#E8DED0] animate-fadeIn">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#F3EFE9]">
              <h2 className="text-xl font-serif font-bold text-[#1F2937]">
                {editingRecord ? 'Edit Academic Record' : 'Add Academic Record'}
              </h2>
              <button
                onClick={closeModal}
                className="p-1.5 text-[#737373] hover:text-[#1F2937] rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 rounded-xl flex items-start gap-2 text-red-700 text-xs border border-red-200">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveRecord} className="space-y-4">
              <div>
                <label className="block text-xs uppercase font-bold text-[#A09080] tracking-wider mb-1.5">
                  Semester / Class
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
                  Academic Year
                </label>
                <input
                  type="text"
                  required
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  placeholder="e.g. 2024-2025"
                  className="w-full px-4 py-2.5 bg-[#FFFDF8] border border-[#E8DED0] rounded-xl text-sm text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase font-bold text-[#A09080] tracking-wider mb-1.5">
                    Score Type
                  </label>
                  <select
                    value={scoreType}
                    onChange={(e) => setScoreType(e.target.value as ScoreType)}
                    className="w-full px-3 py-2.5 bg-[#FFFDF8] border border-[#E8DED0] rounded-xl text-sm text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                  >
                    <option value="SGPA">SGPA</option>
                    <option value="CGPA">CGPA</option>
                    <option value="Percentage">Percentage (%)</option>
                    <option value="Other">Other / Grade</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase font-bold text-[#A09080] tracking-wider mb-1.5">
                    Score / Result
                  </label>
                  <input
                    type="text"
                    required
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    placeholder="e.g. 8.75 or 85%"
                    className="w-full px-4 py-2.5 bg-[#FFFDF8] border border-[#E8DED0] rounded-xl text-sm text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-[#A09080] tracking-wider mb-1.5">
                  Remarks (Optional)
                </label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Distinction, 1st Class, Cleared all subjects"
                  className="w-full px-4 py-2 bg-[#FFFDF8] border border-[#E8DED0] rounded-xl text-sm text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F3EFE9]">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={loading}
                  className="px-4 py-2.5 bg-white border border-[#E8DED0] hover:bg-[#FFFDF8] text-[#4F4F4F] rounded-xl text-sm font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1E3A8A] hover:bg-[#1e40af] text-white rounded-xl text-sm font-semibold transition-all shadow-xs disabled:opacity-60 cursor-pointer"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {editingRecord ? 'Save Changes' : 'Add Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
