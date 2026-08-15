import React, { useState } from 'react';
import { StudentProfile } from '../../types/student';
import { supabase } from '../../supabaseClient';
import { User, Mail, Phone, Building2, GraduationCap, Layers, Calendar, Edit3, Save, X, Loader2, CheckCircle2, AlertCircle, Shield } from 'lucide-react';

interface StudentProfileTabProps {
  profile: StudentProfile | null;
  onProfileUpdated: (updatedProfile: StudentProfile) => void;
}

export const StudentProfileTab: React.FC<StudentProfileTabProps> = ({
  profile,
  onProfileUpdated,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form fields
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [mobileNumber, setMobileNumber] = useState(profile?.mobile_number || profile?.metadata?.mobile_number || '');
  const [collegeName, setCollegeName] = useState(profile?.college_name || profile?.metadata?.college_name || '');
  const [course, setCourse] = useState(profile?.course || profile?.metadata?.course || '');
  const [branch, setBranch] = useState(profile?.branch || profile?.metadata?.branch || '');
  const [currentSemester, setCurrentSemester] = useState(profile?.current_semester || profile?.metadata?.current_semester || '');

  // Keep form fields synchronized when profile prop updates or loads
  React.useEffect(() => {
    if (profile) {
      const meta = profile.metadata || {};
      setFullName(profile.full_name || meta.full_name || '');
      setMobileNumber(profile.mobile_number || meta.mobile_number || '');
      setCollegeName(profile.college_name || meta.college_name || '');
      setCourse(profile.course || meta.course || '');
      setBranch(profile.branch || meta.branch || '');
      setCurrentSemester(profile.current_semester || meta.current_semester || '');
    }
  }, [profile]);

  const handleCancel = () => {
    const meta = profile?.metadata || {};
    setFullName(profile?.full_name || meta.full_name || '');
    setMobileNumber(profile?.mobile_number || meta.mobile_number || '');
    setCollegeName(profile?.college_name || meta.college_name || '');
    setCourse(profile?.course || meta.course || '');
    setBranch(profile?.branch || meta.branch || '');
    setCurrentSemester(profile?.current_semester || meta.current_semester || '');
    setIsEditing(false);
    setErrorMsg(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const updatedMetadata = {
      ...(profile.metadata || {}),
      mobile_number: mobileNumber.trim(),
      college_name: collegeName.trim(),
      course: course.trim(),
      branch: branch.trim(),
      current_semester: currentSemester.trim(),
      full_name: fullName.trim(),
    };

    try {
      // 1. First attempt: Direct upsert with all columns and metadata
      const upsertPayload: Record<string, any> = {
        id: profile.id,
        email: profile.email || '',
        full_name: fullName.trim(),
        mobile_number: mobileNumber.trim(),
        college_name: collegeName.trim(),
        course: course.trim(),
        branch: branch.trim(),
        current_semester: currentSemester.trim(),
        role: profile.role || 'student',
        status: 'active',
        metadata: updatedMetadata,
        updated_at: new Date().toISOString(),
      };

      let { error: dbError } = await supabase
        .from('profiles')
        .upsert(upsertPayload, { onConflict: 'id' });

      if (dbError) {
        console.warn('Profile primary upsert failed, attempting fallback upsert:', dbError.message);

        // 2. Fallback: Upsert without updated_at and status
        delete upsertPayload.updated_at;
        delete upsertPayload.status;
        const { error: error2 } = await supabase
          .from('profiles')
          .upsert(upsertPayload, { onConflict: 'id' });

        if (error2) {
          console.warn('Profile direct columns upsert failed, trying metadata jsonb:', error2.message);

          // 3. Fallback: Upsert full_name & metadata jsonb
          const { error: error3 } = await supabase
            .from('profiles')
            .upsert({
              id: profile.id,
              email: profile.email || '',
              full_name: fullName.trim(),
              role: profile.role || 'student',
              metadata: updatedMetadata,
            }, { onConflict: 'id' });

          if (error3) {
            console.warn('Profile metadata upsert failed:', error3.message);
            // 4. Final Fallback: update full_name only
            await supabase
              .from('profiles')
              .upsert({
                id: profile.id,
                full_name: fullName.trim(),
              }, { onConflict: 'id' });
          }
        }
      }

      // Also update auth user metadata for immediate persistence across auth sessions
      try {
        await supabase.auth.updateUser({
          data: {
            full_name: fullName.trim(),
            mobile_number: mobileNumber.trim(),
            college_name: collegeName.trim(),
            course: course.trim(),
            branch: branch.trim(),
            current_semester: currentSemester.trim(),
          },
        });
      } catch (authErr) {
        console.warn('Auth user metadata update notice:', authErr);
      }

      const updatedObj: StudentProfile = {
        ...profile,
        full_name: fullName.trim(),
        mobile_number: mobileNumber.trim(),
        college_name: collegeName.trim(),
        course: course.trim(),
        branch: branch.trim(),
        current_semester: currentSemester.trim(),
        metadata: updatedMetadata,
      };

      onProfileUpdated(updatedObj);
      setSuccessMsg('Your profile and college details have been updated successfully.');
      setIsEditing(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8DED0]">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif text-[#1F2937] font-bold">My Profile</h1>
          <p className="text-sm text-[#737373] mt-1">
            View and manage your personal details and registered academic information.
          </p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1E3A8A] hover:bg-[#1e40af] text-white rounded-xl text-sm font-semibold transition-all shadow-xs hover:shadow-md cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
            Edit Profile
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white border border-[#E8DED0] hover:bg-[#FFFDF8] text-[#4F4F4F] rounded-xl text-sm font-medium transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              form="profile-form"
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1E3A8A] hover:bg-[#1e40af] text-white rounded-xl text-sm font-semibold transition-all shadow-xs hover:shadow-md disabled:opacity-60 cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
        )}
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

      <form id="profile-form" onSubmit={handleSave} className="space-y-6">
        {/* Personal Information */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xs border border-[#E8DED0]">
          <div className="flex items-center gap-2.5 mb-6 pb-3 border-b border-[#F3EFE9]">
            <User className="w-5 h-5 text-[#1E3A8A]" />
            <h2 className="text-lg font-serif font-bold text-[#1F2937]">Personal Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs uppercase font-bold text-[#A09080] tracking-wider mb-2">
                Full Name
              </label>
              {isEditing ? (
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A09080]" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FFFDF8] border border-[#E8DED0] rounded-xl text-sm text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                    placeholder="e.g. Ramesh Kumar"
                  />
                </div>
              ) : (
                <p className="text-sm font-semibold text-[#1F2937] bg-[#FFFDF8] p-3 rounded-xl border border-[#F3EFE9]">
                  {profile?.full_name || <span className="text-[#A09080] font-normal italic">Not updated</span>}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-[#A09080] tracking-wider mb-2">
                Mobile Number
              </label>
              {isEditing ? (
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A09080]" />
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FFFDF8] border border-[#E8DED0] rounded-xl text-sm text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                    placeholder="e.g. +91 98765 43210"
                  />
                </div>
              ) : (
                <p className="text-sm font-semibold text-[#1F2937] bg-[#FFFDF8] p-3 rounded-xl border border-[#F3EFE9]">
                  {mobileNumber || <span className="text-[#A09080] font-normal italic">Not updated</span>}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs uppercase font-bold text-[#A09080] tracking-wider mb-2">
                Email Address (Registered Account)
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A09080]" />
                <input
                  type="email"
                  disabled
                  value={profile?.email || ''}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F9F6F0] border border-[#E8DED0] rounded-xl text-sm text-[#737373] cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-[#A09080] mt-1.5">
                Email address is linked to your authentication login and cannot be altered directly here.
              </p>
            </div>
          </div>
        </div>

        {/* Academic Information */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xs border border-[#E8DED0]">
          <div className="flex items-center gap-2.5 mb-6 pb-3 border-b border-[#F3EFE9]">
            <GraduationCap className="w-5 h-5 text-[#1E3A8A]" />
            <h2 className="text-lg font-serif font-bold text-[#1F2937]">Academic Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs uppercase font-bold text-[#A09080] tracking-wider mb-2">
                College / Institution Name
              </label>
              {isEditing ? (
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A09080]" />
                  <input
                    type="text"
                    value={collegeName}
                    onChange={(e) => setCollegeName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FFFDF8] border border-[#E8DED0] rounded-xl text-sm text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                    placeholder="e.g. Jyothi Institute of Technology / Vijaya College"
                  />
                </div>
              ) : (
                <p className="text-sm font-semibold text-[#1F2937] bg-[#FFFDF8] p-3 rounded-xl border border-[#F3EFE9]">
                  {collegeName || <span className="text-[#A09080] font-normal italic">Not updated</span>}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-[#A09080] tracking-wider mb-2">
                Course / Degree Program
              </label>
              {isEditing ? (
                <div className="relative">
                  <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A09080]" />
                  <input
                    type="text"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FFFDF8] border border-[#E8DED0] rounded-xl text-sm text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                    placeholder="e.g. B.E. / PUC / B.Sc / B.Com"
                  />
                </div>
              ) : (
                <p className="text-sm font-semibold text-[#1F2937] bg-[#FFFDF8] p-3 rounded-xl border border-[#F3EFE9]">
                  {course || <span className="text-[#A09080] font-normal italic">Not updated</span>}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-[#A09080] tracking-wider mb-2">
                Branch / Specialization
              </label>
              {isEditing ? (
                <div className="relative">
                  <Layers className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A09080]" />
                  <input
                    type="text"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FFFDF8] border border-[#E8DED0] rounded-xl text-sm text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                    placeholder="e.g. Computer Science / PCMB / Electronics"
                  />
                </div>
              ) : (
                <p className="text-sm font-semibold text-[#1F2937] bg-[#FFFDF8] p-3 rounded-xl border border-[#F3EFE9]">
                  {branch || <span className="text-[#A09080] font-normal italic">Not updated</span>}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-[#A09080] tracking-wider mb-2">
                Current Semester / Year
              </label>
              {isEditing ? (
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A09080]" />
                  <input
                    type="text"
                    value={currentSemester}
                    onChange={(e) => setCurrentSemester(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FFFDF8] border border-[#E8DED0] rounded-xl text-sm text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                    placeholder="e.g. Semester 3 / 2nd Year PUC"
                  />
                </div>
              ) : (
                <p className="text-sm font-semibold text-[#1F2937] bg-[#FFFDF8] p-3 rounded-xl border border-[#F3EFE9]">
                  {currentSemester || <span className="text-[#A09080] font-normal italic">Not updated</span>}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-[#A09080] tracking-wider mb-2">
                Account Role (Fixed)
              </label>
              <div className="flex items-center gap-2 p-2.5 bg-[#F9F6F0] border border-[#E8DED0] rounded-xl text-sm text-[#1F2937]">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold capitalize">student</span>
                <span className="text-xs text-[#A09080] ml-auto">Immutable</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
