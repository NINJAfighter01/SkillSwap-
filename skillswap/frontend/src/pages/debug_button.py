import re

with open('InteractiveNotes.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the line with the View button
for i, line in enumerate(lines):
    if 'bg-indigo-600' in line and 'flex items-center gap-2' in line:
        print(f"Line {i+1}: {repr(line)}")
        # Check the next line
        if i + 1 < len(lines):
            print(f"Line {i+2}: {repr(lines[i+1])}")
