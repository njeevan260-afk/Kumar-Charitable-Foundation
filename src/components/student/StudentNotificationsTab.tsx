import React, { useState } from 'react';
import { NotificationItem } from '../../types/student';
import { supabase } from '../../supabaseClient';
import { Bell, Check, CheckCheck, Clock, AlertCircle } from 'lucide-react';

interface StudentNotificationsTabProps {
  studentId: string;
  notifications: NotificationItem[];
  onNotificationsChange: (notifications: NotificationItem[]) => void;
}

export const StudentNotificationsTab: React.FC<StudentNotificationsTabProps> = ({
  studentId,
  notifications,
  onNotificationsChange,
}) => {
  const [markingAll, setMarkingAll] = useState(false);

  const handleMarkAsRead = async (id: string) => {
    try {
      const { error: dbError } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (dbError) {
        console.warn('Notification update notice:', dbError.message);
      }

      const updated = notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n));
      onNotificationsChange(updated);
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllAsRead = async () => {
    setMarkingAll(true);
    try {
      const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
      if (unreadIds.length > 0) {
        const { error } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .in('id', unreadIds);

        if (error) console.warn('Mark all error:', error);
      }

      const updated = notifications.map((n) => ({ ...n, is_read: true }));
      onNotificationsChange(updated);
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8DED0]">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif text-[#1F2937] font-bold">Notifications</h1>
          <p className="text-sm text-[#737373] mt-1">
            Official announcements, scholarship updates, and administrative communications.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={markingAll}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-[#E8DED0] hover:bg-[#FFFDF8] text-xs font-semibold text-[#1E3A8A] rounded-xl transition-colors cursor-pointer self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-[#E8DED0] text-center max-w-md mx-auto my-8">
          <div className="w-16 h-16 rounded-full bg-blue-50 text-[#1E3A8A] flex items-center justify-center mx-auto mb-4">
            <Bell className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-serif font-bold text-[#1F2937] mb-1">No Notifications</h3>
          <p className="text-sm text-[#737373]">
            There are no announcements or messages from the Foundation administration at this time.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((item) => (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border transition-all ${
                item.is_read
                  ? 'bg-white border-[#E8DED0]'
                  : 'bg-blue-50/40 border-blue-200 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    {!item.is_read && (
                      <span className="w-2 h-2 rounded-full bg-[#1E3A8A] flex-shrink-0"></span>
                    )}
                    <h3 className="text-base font-bold text-[#1F2937]">{item.title}</h3>
                    {!item.is_read && (
                      <span className="px-2 py-0.5 bg-[#1E3A8A] text-white text-[10px] font-bold rounded-full">
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[#4F4F4F] leading-relaxed whitespace-pre-wrap">
                    {item.message}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-[#A09080] pt-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(item.created_at).toLocaleString()}</span>
                  </div>
                </div>

                {!item.is_read && (
                  <button
                    onClick={() => handleMarkAsRead(item.id)}
                    className="p-2 text-[#A09080] hover:text-[#1E3A8A] hover:bg-white rounded-lg transition-colors cursor-pointer flex-shrink-0"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
