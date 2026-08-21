import re

with open('src/components/admin/AdminProjectsTab.tsx', 'r') as f:
    text = f.read()

# Add Award and FileText to lucide-react imports if not present
if "Award" not in text:
    text = text.replace("import { Briefcase", "import { Briefcase, Award, FileText")

# Update ProjectWithStudent interface
interface_replacement = """interface ProjectWithStudent extends StudentProject {
  student: {
    full_name: string;
    email: string;
  };
  student_project_documents?: any[];
}"""
text = re.sub(r"interface ProjectWithStudent extends StudentProject \{\s*student: \{\s*full_name: string;\s*email: string;\s*\};\s*\}", interface_replacement, text)

# Update fetch logic
fetch_old = """.from('student_projects')
        .select('*')
        .order('created_at', { ascending: false });"""
fetch_new = """.from('student_projects')
        .select('*, student_project_documents(*)')
        .order('created_at', { ascending: false });"""
text = text.replace(fetch_old, fetch_new)

# Add toggle featured logic
toggle_logic = """  const toggleFeatured = async (project: ProjectWithStudent) => {
    try {
      const { error: err } = await supabase
        .from('student_projects')
        .update({ is_featured: !project.is_featured })
        .eq('id', project.id);
      if (err) throw err;
      await fetchProjects();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle featured status');
    }
  };

  const openFeedbackModal ="""
text = text.replace("  const openFeedbackModal =", toggle_logic)

# Add UI for documents and toggle
ui_old = """                  <div className="flex items-center gap-3">
                    <a"""
ui_new = """                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleFeatured(project)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        project.is_featured 
                          ? 'bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-200' 
                          : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                      }`}
                      title={project.is_featured ? 'Remove from Student Works' : 'Add to Student Works'}
                    >
                      <Award className={`w-4 h-4 ${project.is_featured ? 'fill-current' : ''}`} />
                      {project.is_featured ? 'Featured' : 'Feature'}
                    </button>
                    <a"""
text = text.replace(ui_old, ui_new)

# Add documents section
docs_ui = """                <p className="text-[#4F4F4F] whitespace-pre-wrap text-sm leading-relaxed">
                  {project.description}
                </p>

                {project.student_project_documents && project.student_project_documents.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-[#E8DED0]">
                    <h4 className="text-sm font-bold text-[#3B2A20] mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#737373]" />
                      Project Documents
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {project.student_project_documents.map(doc => (
                        <a
                          key={doc.id}
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-xl border border-[#E8DED0] hover:border-[#1E3A8A] hover:bg-blue-50 transition-colors group"
                        >
                          <div className="p-2 bg-white rounded-lg border border-[#E8DED0] group-hover:border-blue-200">
                            <FileText className="w-4 h-4 text-[#1E3A8A]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#3B2A20] truncate group-hover:text-[#1E3A8A]">
                              {doc.file_name}
                            </p>
                            <p className="text-xs text-[#737373] mt-0.5 capitalize">
                              {doc.document_type || 'Document'}
                            </p>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}"""
text = text.replace("""                <p className="text-[#4F4F4F] whitespace-pre-wrap text-sm leading-relaxed">
                  {project.description}
                </p>""", docs_ui)

with open('src/components/admin/AdminProjectsTab.tsx', 'w') as f:
    f.write(text)

