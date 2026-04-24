// Virtual Adepts To-Do — Shared Components
// Requires React in global scope

const SPHERES = [
  { name: 'Correspondence', abbr: 'CORR', color: '#00ffcc' },
  { name: 'Entropy',        abbr: 'ENTR', color: '#7b4fff' },
  { name: 'Forces',         abbr: 'FORC', color: '#ff6a00' },
  { name: 'Life',           abbr: 'LIFE', color: '#39ff14' },
  { name: 'Matter',         abbr: 'MATR', color: '#ffcc00' },
  { name: 'Mind',           abbr: 'MIND', color: '#00ccff' },
  { name: 'Prime',          abbr: 'PRIM', color: '#ff00aa' },
  { name: 'Spirit',         abbr: 'SPRT', color: '#bf7fff' },
  { name: 'Time',           abbr: 'TIME', color: '#00ffee' },
];

const STATUS_MAP = {
  init: { label: 'INIT', color: '#4a7a8a' },
  proc: { label: 'PROC', color: '#00ffcc' },
  hold: { label: 'HOLD', color: '#ff6a00' },
  done: { label: 'DONE', color: '#2a4a3a' },
};

const RECUR_MAP = {
  daily:   'DAILY',
  weekly:  'WEEKLY',
  monthly: 'MONTHLY',
};

function getSphere(name) {
  return SPHERES.find(s => s.name === name) || null;
}

// ── Glitch text effect ──────────────────────────────────────────
function GlitchText({ text, style }) {
  return (
    <span className="glitch-text" data-text={text} style={style}>{text}</span>
  );
}

// ── Sphere badge ────────────────────────────────────────────────
function SphereBadge({ sphere }) {
  if (!sphere) return null;
  const s = getSphere(sphere);
  if (!s) return null;
  return (
    <span className="sphere-badge" style={{ color: s.color, borderColor: s.color + '55' }}>
      {s.abbr}
    </span>
  );
}

// ── Status badge ────────────────────────────────────────────────
function StatusBadge({ status, onClick }) {
  const s = STATUS_MAP[status] || STATUS_MAP.init;
  return (
    <button
      className="status-badge"
      style={{ color: s.color, borderColor: s.color + '66' }}
      onClick={onClick}
      title="Cycle status"
    >
      [{s.label}]
    </button>
  );
}

// ── Subtask row ─────────────────────────────────────────────────
function SubtaskRow({ subtask, onToggle, onDelete }) {
  return (
    <div className={`subtask-row ${subtask.done ? 'subtask-done' : ''}`}>
      <span className="subtask-prefix">└─</span>
      <button className="subtask-check" onClick={() => onToggle(subtask.id)}>
        {subtask.done ? '[✓]' : '[ ]'}
      </button>
      <span className="subtask-title">{subtask.title}</span>
      <button className="subtask-del" onClick={() => onDelete(subtask.id)}>×</button>
    </div>
  );
}

// ── Task Item ───────────────────────────────────────────────────
function TaskItem({ task, onStatusCycle, onEdit, onDelete, onSubtaskToggle, onSubtaskDelete, onDragStart, onDragOver, onDrop, isDragOver }) {
  const [expanded, setExpanded] = React.useState(true);
  const sphere = getSphere(task.sphere);
  const status = STATUS_MAP[task.status] || STATUS_MAP.init;
  const isDone = task.status === 'done';

  const formatDate = (d) => {
    if (!d) return null;
    const dt = new Date(d);
    return dt.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })
      + (task.dueTime ? ` ${task.dueTime}` : '');
  };

  return (
    <div
      className={`task-item ${isDone ? 'task-done' : ''} ${isDragOver ? 'drag-over' : ''}`}
      draggable
      onDragStart={onDragStart}
      onDragOver={e => { e.preventDefault(); onDragOver(); }}
      onDrop={onDrop}
    >
      <div className="task-main-row">
        <StatusBadge status={task.status} onClick={() => onStatusCycle(task.id)} />
        {sphere && (
          <span className="sphere-col" style={{ color: sphere.color }}>
            {sphere.abbr.padEnd(4)}
          </span>
        )}
        {!sphere && <span className="sphere-col sphere-none">────</span>}
        <span className="task-arrow">›</span>
        <span
          className="task-title"
          onClick={() => onEdit(task)}
          title="Edit task"
        >
          {task.title}
        </span>
        {task.recurring && (
          <span className="recur-badge">↻{RECUR_MAP[task.recurring]}</span>
        )}
        <span className="task-spacer" />
        {task.dueDate && (
          <span className="task-due">{formatDate(task.dueDate)}</span>
        )}
        {task.subtasks && task.subtasks.length > 0 && (
          <button className="expand-btn" onClick={() => setExpanded(e => !e)}>
            [{expanded ? '−' : '+'}] {task.subtasks.filter(s => s.done).length}/{task.subtasks.length}
          </button>
        )}
        <button className="task-del-btn" onClick={() => onDelete(task.id)}>⌫</button>
      </div>

      {task.categories && task.categories.length > 0 && (
        <div className="task-cats-row">
          <span className="cats-indent">         </span>
          {task.categories.map(c => (
            <span key={c} className="cat-tag">#{c}</span>
          ))}
        </div>
      )}

      {task.description && (
        <div className="task-description">
          {task.description}
        </div>
      )}

      {expanded && task.subtasks && task.subtasks.length > 0 && (
        <div className="subtasks-list">
          {task.subtasks.map(st => (
            <SubtaskRow
              key={st.id}
              subtask={st}
              onToggle={(id) => onSubtaskToggle(task.id, id)}
              onDelete={(id) => onSubtaskDelete(task.id, id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Task Modal (Add / Edit) ──────────────────────────────────────
function TaskModal({ task, onSave, onClose, allCategories }) {
  const isEdit = !!task;
  const [form, setForm] = React.useState(task ? { ...task } : {
    title: '',
    sphere: '',
    categories: [],
    status: 'init',
    dueDate: '',
    dueTime: '',
    recurring: '',
    subtasks: [],
    description: '',
    notes: '',
  });
  const [newCat, setNewCat] = React.useState('');
  const [newSub, setNewSub] = React.useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addCat = () => {
    const c = newCat.trim().toLowerCase().replace(/\s+/g, '-');
    if (c && !form.categories.includes(c)) {
      set('categories', [...form.categories, c]);
    }
    setNewCat('');
  };

  const removeCat = (c) => set('categories', form.categories.filter(x => x !== c));

  const addSub = () => {
    const t = newSub.trim();
    if (t) {
      set('subtasks', [...form.subtasks, { id: crypto.randomUUID(), title: t, done: false }]);
      setNewSub('');
    }
  };

  const removeSub = (id) => set('subtasks', form.subtasks.filter(s => s.id !== id));

  const handleSave = () => {
    if (!form.title.trim()) return;
    onSave({ ...form, id: form.id || crypto.randomUUID() });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <GlitchText text={isEdit ? '// EDIT_WORKING' : '// NEW_WORKING'} />
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="field-row">
            <label>TITLE</label>
            <input
              className="va-input"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="Describe the working..."
              autoFocus
              onKeyDown={e => e.key === 'Enter' && e.ctrlKey && handleSave()}
            />
          </div>

          <div className="field-row">
            <label>DESCRIPTION</label>
            <textarea
              className="va-input va-textarea"
              value={form.description || ''}
              onChange={e => set('description', e.target.value)}
              placeholder="// optional notes, context, or detailed steps..."
              rows={3}
            />
          </div>

          <div className="field-row two-col">
            <div>
              <label>SPHERE</label>
              <select className="va-select" value={form.sphere} onChange={e => set('sphere', e.target.value)}>
                <option value="">── None ──</option>
                {SPHERES.map(s => (
                  <option key={s.name} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label>STATUS</label>
              <select className="va-select" value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="init">INIT — Not started</option>
                <option value="proc">PROC — In progress</option>
                <option value="hold">HOLD — Blocked</option>
                <option value="done">DONE — Complete</option>
              </select>
            </div>
          </div>

          <div className="field-row two-col">
            <div>
              <label>DUE DATE</label>
              <input className="va-input" type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} />
            </div>
            <div>
              <label>DUE TIME</label>
              <input className="va-input" type="time" value={form.dueTime} onChange={e => set('dueTime', e.target.value)} />
            </div>
          </div>

          <div className="field-row">
            <label>RECURRING</label>
            <select className="va-select" value={form.recurring} onChange={e => set('recurring', e.target.value)}>
              <option value="">── None ──</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div className="field-row">
            <label>CATEGORIES</label>
            <div className="tag-input-row">
              <input
                className="va-input"
                value={newCat}
                onChange={e => setNewCat(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCat()}
                placeholder="Add tag + Enter..."
                list="cat-list"
              />
              <datalist id="cat-list">
                {allCategories.map(c => <option key={c} value={c} />)}
              </datalist>
              <button className="va-btn-sm" onClick={addCat}>+</button>
            </div>
            <div className="tags-display">
              {form.categories.map(c => (
                <span key={c} className="cat-tag removable" onClick={() => removeCat(c)}>#{c} ×</span>
              ))}
            </div>
          </div>

          <div className="field-row">
            <label>SUBTASKS</label>
            <div className="tag-input-row">
              <input
                className="va-input"
                value={newSub}
                onChange={e => setNewSub(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addSub()}
                placeholder="Add subtask + Enter..."
              />
              <button className="va-btn-sm" onClick={addSub}>+</button>
            </div>
            <div className="subtasks-edit-list">
              {form.subtasks.map(st => (
                <div key={st.id} className="subtask-edit-row">
                  <span className="subtask-prefix">└─</span>
                  <span className="subtask-title">{st.title}</span>
                  <button className="subtask-del" onClick={() => removeSub(st.id)}>×</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="va-btn cancel" onClick={onClose}>CANCEL</button>
          <button className="va-btn primary" onClick={handleSave}>
            {isEdit ? 'UPDATE_WORKING' : 'COMMIT_WORKING'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Sidebar ──────────────────────────────────────────────────────
function Sidebar({ filters, setFilters, allCategories, taskCounts }) {
  const setF = (k, v) => setFilters(f => ({ ...f, [k]: f[k] === v ? null : v }));

  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <div className="sidebar-label">// FILTER_BY</div>
        <div className="sidebar-label dim">STATUS</div>
        {Object.entries(STATUS_MAP).map(([k, v]) => (
          <button
            key={k}
            className={`filter-btn ${filters.status === k ? 'active' : ''}`}
            style={filters.status === k ? { color: v.color, borderColor: v.color } : {}}
            onClick={() => setF('status', k)}
          >
            [{v.label}] {taskCounts.status[k] || 0}
          </button>
        ))}
      </div>

      <div className="sidebar-section">
        <div className="sidebar-label dim">SPHERE</div>
        {SPHERES.map(s => (
          <button
            key={s.name}
            className={`filter-btn sphere-filter ${filters.sphere === s.name ? 'active' : ''}`}
            style={filters.sphere === s.name ? { color: s.color, borderColor: s.color } : {}}
            onClick={() => setF('sphere', s.name)}
          >
            <span style={{ color: s.color }}>{s.abbr}</span>
            <span className="filter-name">{s.name}</span>
            <span className="filter-count">{taskCounts.sphere[s.name] || 0}</span>
          </button>
        ))}
      </div>

      {allCategories.length > 0 && (
        <div className="sidebar-section">
          <div className="sidebar-label dim">CATEGORY</div>
          {allCategories.map(c => (
            <button
              key={c}
              className={`filter-btn ${filters.category === c ? 'active' : ''}`}
              onClick={() => setF('category', c)}
            >
              #{c} <span className="filter-count">{taskCounts.category[c] || 0}</span>
            </button>
          ))}
        </div>
      )}

      {(filters.status || filters.sphere || filters.category) && (
        <button className="clear-filters-btn" onClick={() => setFilters({ status: null, sphere: null, category: null })}>
          ✕ CLEAR_FILTERS
        </button>
      )}
    </aside>
  );
}

// ── Section Header ───────────────────────────────────────────────
function SectionHeader({ label, count }) {
  return (
    <div className="section-header">
      <span className="section-arrow">▶</span>
      <span className="section-label">{label}</span>
      <span className="section-line" />
      <span className="section-count">[{count}]</span>
    </div>
  );
}

Object.assign(window, {
  SPHERES, STATUS_MAP, RECUR_MAP,
  GlitchText, SphereBadge, StatusBadge,
  SubtaskRow, TaskItem, TaskModal,
  Sidebar, SectionHeader,
});
