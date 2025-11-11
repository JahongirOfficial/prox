const fs = require('fs');
const path = 'client/pages/Admin.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Fix the broken drag state line
content = content.replace(
  /\/\/ Drag & drop state for course reordering \(admin only\).*?const \[savingOrder, setSavingOrder\] = useState.*?;/s,
  `  // Drag & drop state for course reordering (admin only)
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);`
);

// 2. Fix the broken handlers block
const brokenPattern = /\/\/ Reorder persistence and drag handlers.*?persistCourseOrder\(ids\);\s*\};/s;
const fixedHandlers = `  // Reorder persistence and drag handlers
  const persistCourseOrder = async (orderedIds: string[]) => {
    try {
      setSavingOrder(true);
      const token = document.cookie.split(';').find(row => row.trim().startsWith('jwt='))?.split('=')[1];
      const res = await fetch('/api/admin/courses/reorder', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': \`Bearer \${token}\` } : {})
        },
        body: JSON.stringify({ orderedIds })
      });
      if (!res.ok) loadCourses();
    } catch {
      loadCourses();
    } finally {
      setSavingOrder(false);
    }
  };

  const handleDragStart = (id: string) => setDraggingId(id);
  const handleDragOver = (overId: string) => {
    if (!draggingId || draggingId === overId) return;
    setCourses(prev => {
      const from = prev.findIndex(c => c.id === draggingId);
      const to = prev.findIndex(c => c.id === overId);
      if (from === -1 || to === -1) return prev;
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };
  const handleDrop = () => {
    if (!draggingId) return;
    const ids = courses.map(c => c.id);
    setDraggingId(null);
    persistCourseOrder(ids);
  };`;

content = content.replace(brokenPattern, fixedHandlers);

// 3. Remove duplicate drag handlers from DashboardContent
const dashboardPattern = /\/\/ Helper: persist order to server[\s\S]*?persistCourseOrder\(courses\.map\(c => c\.id\)\);\s*\};/;
content = content.replace(dashboardPattern, '');

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed Admin.tsx drag & drop errors');
