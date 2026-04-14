/**
 * Mock file content for teacher submission preview.
 * Keyed by submission id, then by filename.
 */

const MOCK_CONTENT = {
  'assignment3_panteater.py': `"""
Assignment 3: Lists and Tuples
Peter Anteater
"""

def sum_list(lst):
    """Return the sum of all elements in the list."""
    return sum(lst)

def reverse_list(lst):
    """Return a new list with elements in reverse order."""
    return lst[::-1]

def get_even_indices(lst):
    """Return elements at even indices."""
    return [lst[i] for i in range(0, len(lst), 2)]

# Test cases
if __name__ == "__main__":
    print(sum_list([1, 2, 3, 4, 5]))  # 15
    print(reverse_list([1, 2, 3]))     # [3, 2, 1]
`,
  'assignment3_alice.py': `# Assignment 3 - Alice Johnson
# Lists and Tuples exercises

def flatten(nested):
    result = []
    for item in nested:
        if isinstance(item, list):
            result.extend(flatten(item))
        else:
            result.append(item)
    return result

def tuple_product(t):
    p = 1
    for x in t:
        p *= x
    return p
`,
  'readme.txt': `Assignment 3 Readme
Alice Johnson

I implemented all required functions. The flatten function
handles nested lists of any depth. All test cases pass.
`,
  'lists_tuples.py': `"""Lists and Tuples - Carol Wang"""
def main():
    data = [1, 2, 3, 4, 5]
    squared = [x**2 for x in data]
    return squared
`,
  'homework7.pdf': null, // PDF - show placeholder
}

export function getFilePreviewContent(filename) {
  const content = MOCK_CONTENT[filename]
  if (content !== undefined) return content
  const ext = (filename || '').split('.').pop()?.toLowerCase()
  if (ext === 'pdf') return null
  return `# File: ${filename}\n\n(Mock preview - no content stored for this file in prototype)`
}

export function isPdf(filename) {
  return (filename || '').toLowerCase().endsWith('.pdf')
}
