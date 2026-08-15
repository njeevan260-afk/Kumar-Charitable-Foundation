import React, { useState } from 'react';
import { NotificationItem, StudentProfile } from '../../types/student';
import { supabase } from '../../supabaseClient';
import {
  Bell,
  Send,
  Users,
  User,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Clock,
  Sparkles,
  Search,
} from 'lucide-react';

interface AdminNotificationsTabProps {
  notifications: NotificationItem[];
  students: StudentProfile[];
  onRefreshNotifications: () => Promise<void>;
}

export const AdminNotificationsTab: React.FC<AdminNotificationsTabProps> = ({
  notifications,
  students,
  onRefreshNotifications,
}) => {
  const [recipientType, setRecipientType] = useState<'all' | 'specific'>('all');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [notifType, setNotifType] = useState<'announcement' | 'academic' | 'general'>('announcement');

  const [sending, setSending] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setErrorMsg('Please enter both title and message.');
      return;
    }

    setSending(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const payload: any = {
        title: title.trim(),
        message: message.trim(),
        type: notifType,
        is_read: false,
        created_at: new Date().toISOString(),
      };

      if (recipientType === 'specific') {
        if (!selectedStudentId) {
          throw new Error('Please select a student.');
        }
        payload.user_id = selectedStudentId;
        payload.student_id = selectedStudentId;
      } else {
        // Broadcast notification to all students
        payload.user_id = null;
        payload.student_id = null;
      }

      const { error } = await supabase.from('notifications').insert([payload]);

      if (error) {
        // Fallback for schemas with user_id or student_id column differences
        if (error.message?.includes('student_id')) {
          delete payload.student_id;
          const { error: retryError } = await supabase.from('notifications').insert([payload]);
          if (retryError) throw retryError;
        } else if (error.message?.includes('user_id')) {
          delete payload.user_id;
          const { error: retryError } = await supabase.from('notifications').insert([payload]);
          if (retryError) throw retryError;
        } else {
          throw error;
        }
      }

      setSuccessMsg(
        recipientType === 'all'
          ? 'Broadcast notification published successfully to all students.'
          : 'Direct notification sent to the student successfully.'
      );
      setTitle('');
      setMessage('');
      await onRefreshNotifications();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to dispatch notification.');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    setDeletingId(id);
    try {
      const { error } = await supabase.from('notifications').delete().eq('id', id);
      if (error) throw error;
      await onRefreshNotifications();
    } catch (err: any) {
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="pb-4 border-b border-[#E8DED0]">
        <h2 className="text-xl md:text-2xl font-serif font-bold text-[#1F2937]">Notifications & Broadcasts</h2>
        <p className="text-xs text-[#737373] mt-0.5">
          Send broadcast updates to all students or target individual recipients
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 5 Cols: Compose Notification Form */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-[#E8DED0] shadow-xs h-fit">
          <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-[#F3EFE9]">
            <Send className="w-5 h-5 text-[#1E3A8A]" />
            <h3 className="text-base font-serif font-bold text-[#1F2937]">Compose Notification</h3>
          </div>

          {errorMsg && (
            <div className="p-3.5 mb-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 mb-4 bg-green-50 border border-green-200 text-green-700 text-xs rounded-xl flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSendNotification} className="space-y-4">
            {/* Recipient Scope */}
            <div>
              <label className="block text-xs font-bold text-[#A09080] uppercase tracking-wider mb-1.5">
                Target Audience
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRecipientType('all')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    recipientType === 'all'
                      ? 'bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-xs'
                      : 'bg-[#FFFDF8] text-[#1F2937] border-[#E8DED0] hover:bg-[#F3EFE9]'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  All Students (Broadcast)
                </button>
                <button
                  type="button"
                  onClick={() => setRecipientType('specific')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    recipientType === 'specific'
                      ? 'bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-xs'
                      : 'bg-[#FFFDF8] text-[#1F2937] border-[#E8DED0] hover:bg-[#F3EFE9]'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  Single Student
                </button>
              </div>
            </div>

            {/* Individual Student Picker if Specific */}
            {recipientType === 'specific' && (
              <div>
                <label className="block text-xs font-bold text-[#A09080] uppercase tracking-wider mb-1.5">
                  Select Recipient Student
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full py-2.5 px-3 bg-[#FFFDF8] border border-[#E8DED0] rounded-xl text-xs font-bold text-[#1F2937] outline-none cursor-pointer focus:border-[#1E3A8A]"
                >
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.full_name || st.email} ({st.college_name || 'College'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Category / Type */}
            <div>
              <label className="block text-xs font-bold text-[#A09080] uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={notifType}
                onChange={(e) => setNotifType(e.target.value as any)}
                className="w-full py-2.5 px-3 bg-[#FFFDF8] border border-[#E8DED0] rounded-xl text-xs text-[#1F2937] outline-none cursor-pointer focus:border-[#1E3A8A]"
              >
                <option value="announcement">Announcement (General Foundation Notice)</option>
                <option value="academic">Academic (Results / Documents Update)</option>
                <option value="general">General Notification</option>
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-[#A09080] uppercase tracking-wider mb-1.5">
                Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Semester 4 Document Submission Reminder"
                className="w-full py-2.5 px-3 bg-[#FFFDF8] border border-[#E8DED0] rounded-xl text-xs text-[#1F2937] outline-none focus:border-[#1E3A8A]"
              />
            </div>

            {/* Message Body */}
            <div>
              <label className="block text-xs font-bold text-[#A09080] uppercase tracking-wider mb-1.5">
                Message Content
              </label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write the notification details here..."
                className="w-full py-2.5 px-3 bg-[#FFFDF8] border border-[#E8DED0] rounded-xl text-xs text-[#1F2937] outline-none focus:border-[#1E3A8A] resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full py-3 bg-[#1E3A8A] hover:bg-[#1e40af] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Dispatching Notification...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Notification
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right 7 Cols: Notification History */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-[#E8DED0] shadow-xs">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#F3EFE9]">
            <div className="flex items-center gap-2.5">
              <Bell className="w-5 h-5 text-[#1E3A8A]" />
              <h3 className="text-base font-serif font-bold text-[#1F2937]">Published Notifications</h3>
            </div>
            <span className="text-xs text-[#A09080] font-bold">{notifications.length} total</span>
          </div>

          {notifications.length === 0 ? (
            <div className="py-12 text-center text-[#737373]">
              <Bell className="w-10 h-10 text-[#A09080] mx-auto mb-2 opacity-40" />
              <p className="text-sm font-semibold text-[#1F2937]">No Notifications Sent</p>
              <p className="text-xs text-[#737373] mt-1">
                Notifications dispatched by administrators will be logged here.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5 max-h-[580px] overflow-y-auto pr-1">
              {notifications.map((notif) => {
                const targetStudent = notif.user_id ? students.find((s) => s.id === notif.user_id) : null;
                const isBroadcast = !notif.user_id;

                return (
                  <div
                    key={notif.id}
                    className="p-4 bg-[#FFFDF8] rounded-xl border border-[#E8DED0] hover:border-[#1E3A8A] transition-all flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-[10px] px-2 py-0.5 font-bold rounded-full uppercase ${
                              isBroadcast
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}
                          >
                            {isBroadcast ? '📢 Broadcast: All Students' : `👤 ${targetStudent?.full_name || 'Individual Student'}`}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 bg-[#F3EFE9] text-[#737373] font-bold rounded-full uppercase">
                            {notif.type || 'Announcement'}
                          </span>
                        </div>

                        <button
                          onClick={() => handleDeleteNotification(notif.id)}
                          disabled={deletingId === notif.id}
                          className="p-1 text-[#A09080] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete notification"
                        >
                          {deletingId === notif.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      <h4 className="text-sm font-bold text-[#1F2937] mb-1">{notif.title}</h4>
                      <p className="text-xs text-[#4F4F4F] leading-relaxed whitespace-pre-wrap">
                        {notif.message}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#F3EFE9] flex items-center justify-between text-[11px] text-[#A09080]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(notif.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
