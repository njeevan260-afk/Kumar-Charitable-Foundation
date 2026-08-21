import re

with open('src/components/student/StudentWorksTab.tsx', 'r') as f:
    text = f.read()

# Add StudentProjectDocument to imports
if 'StudentProjectDocument' not in text:
    text = text.replace('StudentProject, StudentProfile', 'StudentProject, StudentProfile, StudentProjectDocument')
    
# Add FileText, Eye, Download to lucide-react if not there
if 'FileText' not in text:
    text = text.replace('Award } from', 'Award, FileText, Eye, Download } from')

# Update type state
type_regex = re.compile(r'useState<\(StudentProject & \{ student_profile: StudentProfile \| null \}\)\[\]>')
text = type_regex.sub('useState<(StudentProject & { student_profile: StudentProfile | null; documents?: StudentProjectDocument[] })[]>', text)

# Update the fetch logic
# from('student_profiles') -> from('profiles')
fetch_regex = re.compile(r'\.from\(\'student_profiles\'\)')
text = fetch_regex.sub(".from('profiles')", text)

combined_regex = re.compile(r'const combined = featuredProjects\.map\(p => \(\{\n\s*\.\.\.p,\n\s*student_profile: profiles\?\.find\(prof => prof\.id === p\.user_id\) \|\| null\n\s*\}\)\);\n\s*setProjects\(combined\);')

new_combined = """
          const projectIds = featuredProjects.map(p => p.id);
          const { data: docs } = await supabase
            .from('student_project_documents')
            .select('*')
            .in('project_id', projectIds);

          const combined = featuredProjects.map(p => ({
            ...p,
            student_profile: profiles?.find(prof => prof.id === p.user_id) || null,
            documents: docs?.filter(d => d.project_id === p.id) || []
          }));
          setProjects(combined);
"""
text = combined_regex.sub(new_combined.strip(), text)

# Add the documents section to the project card
ui_regex = re.compile(r'(\{\s*project\.admin_feedback && \()')
new_ui = """
                {project.documents && project.documents.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-[#E8DED0]">
                    <h4 className="font-semibold text-[#3B2A20] flex items-center gap-2 mb-4">
                      <FileText className="w-4 h-4 text-[#1E3A8A]" />
                      Project Documentation
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {project.documents.map((doc) => {
                        const fileExt = doc.file_name.split('.').pop()?.toLowerCase() || '';
                        let badgeBg = 'bg-blue-100 text-blue-700';
                        if (fileExt === 'pdf') badgeBg = 'bg-red-100 text-red-700';
                        else if (['doc', 'docx'].includes(fileExt)) badgeBg = 'bg-blue-100 text-blue-800';
                        else if (['txt', 'md'].includes(fileExt)) badgeBg = 'bg-gray-100 text-gray-700';
                        
                        // Storage path handling
                        const { data: urlData } = supabase.storage.from('student-documents').getPublicUrl(doc.file_path);

                        return (
                          <div key={doc.id} className="group flex items-start gap-3 p-3 bg-[#F8F5F1] border border-[#E8DED0] rounded-xl hover:border-[#1E3A8A] transition-colors">
                            <div className={`p-2 rounded-lg ${badgeBg} shrink-0`}>
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="text-sm font-bold text-[#1F2937] truncate mb-0.5" title={doc.title}>
                                {doc.title}
                              </h5>
                              <p className="text-xs text-[#737373] truncate" title={doc.description || ''}>
                                {doc.description || 'No description provided'}
                              </p>
                              <div className="flex items-center gap-2 mt-3">
                                <a
                                  href={urlData.publicUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-[11px] font-bold text-[#1E3A8A] hover:underline"
                                >
                                  <Eye className="w-3 h-3" />
                                  Preview/Open
                                </a>
                                <span className="text-[#D1D5DB]">•</span>
                                <a
                                  href={urlData.publicUrl}
                                  download={doc.file_name}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center gap-1 text-[11px] font-bold text-[#1E3A8A] hover:underline"
                                >
                                  <Download className="w-3 h-3" />
                                  Download
                                </a>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                \\1"""
text = ui_regex.sub(new_ui, text)

with open('src/components/student/StudentWorksTab.tsx', 'w') as f:
    f.write(text)

