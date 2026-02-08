with open('InteractiveNotes.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Replace line 1134 (index 1133) with the new content
lines[1133] = '                        <span>◆</span> View\n'

with open('InteractiveNotes.jsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print('✅ Updated View button with diamond icon!')
