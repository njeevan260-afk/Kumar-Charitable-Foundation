import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { StudentMeetingNote, StudentSkillUpdate } from '../../types/student';
import { Loader2, Plus, Calendar, BookOpen, Sparkles, MessageSquare, Save, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const StudentLogsTab: React.FC = () => {
  const [meetingNotes, setMeetingNotes] = useState<StudentMeetingNote[]>([]);
  const [skillUpdates, setSkillUpdates] = useState<StudentSkillUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [noteForm, setNoteForm] = useState({ meeting_topic: '', notes: '', learnt: '', feedback: '' });
  const [skillForm, setSkillForm] = useState({ skill_name: '', description: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    try {
      const [notesRes, skillsRes] = await Promise.all([
        supabase.from('student_meeting_notes').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }),
        supabase.from('student_skills_updates').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false })
      ]);

      // If the tables don't exist yet, this will error safely
      if (notesRes.data) setMeetingNotes(notesRes.data as StudentMeetingNote[]);
      if (skillsRes.data) setSkillUpdates(skillsRes.data as StudentSkillUpdate[]);
    } catch (e) {
      console.warn('Failed to fetch logs:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNote = async () => {
    setErrorMsg(null);
    if (!noteForm.meeting_topic.trim() || !noteForm.notes.trim() || !noteForm.learnt.trim()) {
      setErrorMsg("Please fill out all required fields.");
      return;
    }

    setSubmitting(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    try {
      const { data, error } = await supabase.from('student_meeting_notes').insert([{
        user_id: session.user.id,
        ...noteForm
      }]).select().single();

      if (error) {
        if (error.code === '42P01') throw new Error("Table 'student_meeting_notes' does not exist yet. Please run the provided SQL setup script in your Supabase dashboard.");
        throw error;
      }

      setMeetingNotes([data, ...meetingNotes]);
      setShowNoteModal(false);
      setNoteForm({ meeting_topic: '', notes: '', learnt: '', feedback: '' });
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save meeting note');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveSkill = async () => {
    setErrorMsg(null);
    if (!skillForm.skill_name.trim() || !skillForm.description.trim()) {
      setErrorMsg("Please fill out all required fields.");
      return;
    }

    setSubmitting(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    try {
      const { data, error } = await supabase.from('student_skills_updates').insert([{
        user_id: session.user.id,
        ...skillForm
      }]).select().single();

      if (error) {
         if (error.code === '42P01') throw new Error("Table 'student_skills_updates' does not exist yet. Please run the provided SQL setup script in your Supabase dashboard.");
         throw error;
      }

      setSkillUpdates([data, ...skillUpdates]);
      setShowSkillModal(false);
      setSkillForm({ skill_name: '', description: '' });
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save skill update');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-gradient-to-r from-[#1E3A8A] to-[#C49A3A] rounded-[24px] p-8 sm:p-10 text-white relative overflow-hidden shadow-lg">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-4">Logs & Reflections</h2>
          <p className="text-white/90 text-sm sm:text-base leading-relaxed">
            Record your meeting notes, capture what you've learned, and track new skills and AI technologies you are exploring.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-[#C49A3A]" /></div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          
          {/* Meeting Notes Section */}
          <div className="bg-white rounded-3xl border border-[#E8DED0] p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[#1F2937] flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#C49A3A]" /> Meeting Notes
              </h3>
              <button 
                onClick={() => setShowNoteModal(true)}
                className="bg-[#1E3A8A] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#152C69] transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Note
              </button>
            </div>
            
            <div className="space-y-4">
              {meetingNotes.length === 0 ? (
                <div className="text-center py-12 bg-[#F8F5F0] rounded-2xl border border-dashed border-[#D1D5DB]">
                  <p className="text-[#6B7280] text-sm">No meeting notes logged yet.</p>
                </div>
              ) : (
                meetingNotes.map((note) => (
                  <div key={note.id} className="bg-[#FFFDF8] border border-[#E8DED0] rounded-2xl p-5 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-bold text-[#1F2937] text-lg">{note.meeting_topic}</h4>
                      <span className="text-xs font-semibold text-[#6B7280] bg-[#F3F4F6] px-2 py-1 rounded-lg flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {new Date(note.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="space-y-3 mt-4 text-sm text-[#4B5563]">
                      <div>
                        <strong className="text-[#374151] block mb-1">Notes:</strong>
                        <p className="whitespace-pre-wrap leading-relaxed">{note.notes}</p>
                      </div>
                      <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                        <strong className="text-[#1E3A8A] block mb-1">What I Learnt:</strong>
                        <p className="whitespace-pre-wrap">{note.learnt}</p>
                      </div>
                      {note.feedback && (
                        <div className="p-3 bg-[#F8F5F0] rounded-xl border border-[#E8DED0]">
                          <strong className="text-[#C49A3A] block mb-1 flex items-center gap-1"><MessageSquare className="w-3 h-3"/> Feedback:</strong>
                          <p className="whitespace-pre-wrap">{note.feedback}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Skills Updates Section */}
          <div className="bg-white rounded-3xl border border-[#E8DED0] p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[#1F2937] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#C49A3A]" /> Skills & Technologies
              </h3>
              <button 
                onClick={() => setShowSkillModal(true)}
                className="bg-[#1E3A8A] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#152C69] transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Skill
              </button>
            </div>
            
            <div className="space-y-4">
              {skillUpdates.length === 0 ? (
                <div className="text-center py-12 bg-[#F8F5F0] rounded-2xl border border-dashed border-[#D1D5DB]">
                  <p className="text-[#6B7280] text-sm">No new skills or technologies logged yet.</p>
                </div>
              ) : (
                skillUpdates.map((skill) => (
                  <div key={skill.id} className="bg-[#FFFDF8] border border-[#E8DED0] rounded-2xl p-5 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-[#1F2937] text-lg text-emerald-700">{skill.skill_name}</h4>
                      <span className="text-xs font-semibold text-[#6B7280] bg-[#F3F4F6] px-2 py-1 rounded-lg flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {new Date(skill.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="mt-3 text-sm text-[#4B5563]">
                      <p className="whitespace-pre-wrap leading-relaxed">{skill.description}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

      {/* Note Modal */}
      <AnimatePresence>
        {showNoteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1F2937]/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-[24px] shadow-2xl w-full max-w-lg overflow-hidden border border-[#E8DED0] flex flex-col max-h-[85vh]">
              <div className="flex-shrink-0 flex items-center justify-between p-5 sm:p-6 border-b border-[#E8DED0] bg-[#F8F5F0]">
                <h3 className="text-lg font-bold text-[#1F2937]">Add Meeting Note</h3>
                <button onClick={() => setShowNoteModal(false)} className="text-[#6B7280] hover:text-[#1F2937] transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
                {errorMsg && (
                  <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100">{errorMsg}</div>
                )}
                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-1">Meeting Topic/Title *</label>
                  <input type="text" value={noteForm.meeting_topic} onChange={e => setNoteForm({...noteForm, meeting_topic: e.target.value})} className="w-full px-4 py-2 bg-white border border-[#D1D5DB] rounded-xl focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent outline-none" placeholder="e.g. Weekly Mentor Sync" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-1">Meeting Notes *</label>
                  <textarea value={noteForm.notes} onChange={e => setNoteForm({...noteForm, notes: e.target.value})} rows={3} className="w-full px-4 py-2 bg-white border border-[#D1D5DB] rounded-xl focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent outline-none resize-none" placeholder="Key discussion points..."></textarea>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-1">What I Learnt *</label>
                  <textarea value={noteForm.learnt} onChange={e => setNoteForm({...noteForm, learnt: e.target.value})} rows={3} className="w-full px-4 py-2 bg-white border border-[#D1D5DB] rounded-xl focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent outline-none resize-none" placeholder="Core takeaways..."></textarea>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-1">Session Feedback (Optional)</label>
                  <textarea value={noteForm.feedback} onChange={e => setNoteForm({...noteForm, feedback: e.target.value})} rows={2} className="w-full px-4 py-2 bg-white border border-[#D1D5DB] rounded-xl focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent outline-none resize-none" placeholder="Any feedback on the meeting..."></textarea>
                </div>
              </div>
              <div className="flex-shrink-0 p-5 sm:p-6 border-t border-[#E8DED0] bg-[#F9FAFB] flex flex-col sm:flex-row justify-end gap-3">
                <button onClick={() => setShowNoteModal(false)} className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-[#4B5563] hover:text-[#111827] hover:bg-[#E5E7EB] rounded-xl transition-colors">Cancel</button>
                <button onClick={handleSaveNote} disabled={submitting} className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-white bg-[#1E3A8A] hover:bg-[#152C69] rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Note
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Skill Modal */}
      <AnimatePresence>
        {showSkillModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1F2937]/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-[24px] shadow-2xl w-full max-w-md overflow-hidden border border-[#E8DED0] flex flex-col max-h-[85vh]">
              <div className="flex-shrink-0 flex items-center justify-between p-5 sm:p-6 border-b border-[#E8DED0] bg-[#F8F5F0]">
                <h3 className="text-lg font-bold text-[#1F2937]">Log New Skill/Tech</h3>
                <button onClick={() => setShowSkillModal(false)} className="text-[#6B7280] hover:text-[#1F2937] transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
                {errorMsg && (
                  <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100">{errorMsg}</div>
                )}
                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-1">Skill / Technology Name *</label>
                  <input type="text" value={skillForm.skill_name} onChange={e => setSkillForm({...skillForm, skill_name: e.target.value})} className="w-full px-4 py-2 bg-white border border-[#D1D5DB] rounded-xl focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent outline-none" placeholder="e.g. React, Next.js, LangChain" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-1">Details / Description *</label>
                  <textarea value={skillForm.description} onChange={e => setSkillForm({...skillForm, description: e.target.value})} rows={4} className="w-full px-4 py-2 bg-white border border-[#D1D5DB] rounded-xl focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent outline-none resize-none" placeholder="What did you build or learn about this?"></textarea>
                </div>
              </div>
              <div className="flex-shrink-0 p-5 sm:p-6 border-t border-[#E8DED0] bg-[#F9FAFB] flex flex-col sm:flex-row justify-end gap-3">
                <button onClick={() => setShowSkillModal(false)} className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-[#4B5563] hover:text-[#111827] hover:bg-[#E5E7EB] rounded-xl transition-colors">Cancel</button>
                <button onClick={handleSaveSkill} disabled={submitting} className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-white bg-[#1E3A8A] hover:bg-[#152C69] rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Skill
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
