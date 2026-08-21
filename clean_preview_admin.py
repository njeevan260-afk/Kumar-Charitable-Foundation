import re

with open('src/components/admin/AdminLogsTab.tsx', 'r') as f:
    text = f.read()

# Remove previewDoc state
text = re.sub(r'\s*// Document preview modal state.*?const \[previewError, setPreviewError\] = useState<string \| null>\(null\);\n', '', text, flags=re.DOTALL)

# Remove useEffect for preview
text = re.sub(r'\s*// Preview resolution effect.*?\}, \[previewDoc\]\);\n', '', text, flags=re.DOTALL)

# Remove the preview modal from return statement
modal_regex = re.compile(r'\{\/\* DOCUMENT PREVIEW MODAL \*\/.*?\{previewDoc && \(.*?\n\s*\)\}\n', re.DOTALL)
text = modal_regex.sub('', text)

# Remove `EnrichedProjectDocument` interface
interface_regex = re.compile(r'interface EnrichedProjectDocument extends StudentProjectDocument \{\n\s*student\?: StudentProfile;\n\}\n')
text = interface_regex.sub('', text)

# Remove any other unused imports
text = text.replace("StudentProjectDocument,", "")
text = text.replace("import { resolveDocumentPreview } from '../../utils/documentViewer';", "")

with open('src/components/admin/AdminLogsTab.tsx', 'w') as f:
    f.write(text)
