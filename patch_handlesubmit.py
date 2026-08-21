import re

with open('src/components/student/StudentProjectsTab.tsx', 'r') as f:
    text = f.read()

old_submit = """  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    setSubmitting(true);
    setError(null);

    try {
      const newProject = {
        user_id: profile.id,
        title,
        description,
        project_link: projectLink,
        status: 'pending'
      };
      
      const { error: err } = await supabase
        .from('student_projects')
        .insert([newProject]);
      
      if (err) throw err;
      
      setTitle('');
      setDescription('');
      setProjectLink('');
      setShowForm(false);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to submit project');
    } finally {
      setSubmitting(false);
    }
  };"""

new_submit = """  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    setSubmitting(true);
    setError(null);

    try {
      const newProject = {
        user_id: profile.id,
        title,
        description,
        project_link: projectLink,
        status: 'pending'
      };
      
      const { data: insertedProject, error: err } = await supabase
        .from('student_projects')
        .insert([newProject])
        .select()
        .single();
      
      if (err) throw err;

      // If a document was selected, upload it
      if (selectedDocFile && insertedProject) {
        const fileExt = selectedDocFile.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `${profile.id}/project-docs/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('student-documents')
          .upload(filePath, selectedDocFile);

        if (uploadError) throw uploadError;

        const newDoc = {
          user_id: profile.id,
          project_id: insertedProject.id,
          title: `${title} - Document`,
          description: 'Uploaded with project submission',
          file_path: filePath,
          file_name: selectedDocFile.name,
          file_type: selectedDocFile.type,
          file_size: selectedDocFile.size
        };

        const { error: dbError } = await supabase
          .from('student_project_documents')
          .insert([newDoc]);

        if (dbError) throw dbError;
      }
      
      setTitle('');
      setDescription('');
      setProjectLink('');
      setSelectedDocFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setShowForm(false);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to submit project');
    } finally {
      setSubmitting(false);
    }
  };"""

text = text.replace(old_submit, new_submit)

with open('src/components/student/StudentProjectsTab.tsx', 'w') as f:
    f.write(text)

