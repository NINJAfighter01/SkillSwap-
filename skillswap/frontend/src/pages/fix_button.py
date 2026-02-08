import re

with open('InteractiveNotes.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find and replace the View button text
pattern = r'(className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-bold flex items-center gap-2">)\s*View\s*'
replacement = r'\1<span>◆</span> View'
content = re.sub(pattern, replacement, content)

with open('InteractiveNotes.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('✅ Updated View button with diamond icon')
