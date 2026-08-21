import re

with open('src/components/student/StudentLogsTab.tsx', 'r') as f:
    text = f.read()

# find and remove the array elements from ALLOWED_DOC_TYPES
# the leftover strings are between "import { motion, AnimatePresence } from 'framer-motion';" and "const MAX_DOC_SIZE"
cleanup_regex = re.compile(r"import \{ motion, AnimatePresence \} from 'framer-motion';.*?const MAX_DOC_SIZE", re.DOTALL)
text = cleanup_regex.sub("import { motion, AnimatePresence } from 'framer-motion';\n\nconst MAX_DOC_SIZE", text)

with open('src/components/student/StudentLogsTab.tsx', 'w') as f:
    f.write(text)

