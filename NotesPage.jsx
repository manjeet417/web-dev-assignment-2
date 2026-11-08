import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../api.js";
import { useAuth } from "../auth.jsx";

const COLORS = ["yellow", "mint", "lilac", "peach", "sky"];
const EMPTY = { title: "", content: "", color: "yellow", pinned: false };

// Starter notes shown on the empty board so it never feels blank
const TEMPLATES = [
  { label: "Shopping list", title: "Shopping list", content: "• \n• \n• ", color: "mint" },
  { label: "Meeting notes", title: "Meeting notes", content: "Date:\nAttendees:\n\nDiscussion:\n\nAction items:\n", color: "sky" },
  { label: "Big idea", title: "Big idea", content: "", color: "yellow" },
  { label: "To do today", title: "To do today", content: "1. \n2. \n3. ", color: "peach" },
];

const Svg = ({ children, size = 18 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);
const PlusIcon = ({ size }) => <Svg size={size}><path d="M12 5v14M5 12h14" /></Svg>;
const SearchIcon = () => <Svg><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></Svg>;
const PinIcon = ({ size }) => <Svg size={size}><path d="M12 17v5" /><path d="M9 3h6l-1 6 3 3v2H7v-2l3-3-1-6z" /></Svg>;
const TrashIcon = () => <Svg><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></Svg>;

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
};

const formatDate = (value) => {
  const date = new Date(value);
  const diff = (Date.now() - date) / 1000;
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400 && date.toDateString() === new Date().toDateString()) return `${Math.floor(diff / 3600)}h ago`;
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short" });
};

const wordCount = (text = "") => (text.trim() ? text.trim().split(/\s+/).length : 0);

export default function NotesPage() {
  const { token, name, logout } = useAuth();
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState("");
  const [colorFilter, setColorFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null); // null = closed, {} = new, {_id...} = existing
  const [leaving, setLeaving] = useState(null); // id of the note playing its delete animation

  const handleError = useCallback(
    (err) => {
      if (err.status === 401) logout(); // token expired or invalid
      else setError(err.message);
    },
    [logout]
  );

  // Load notes, debounced while typing in the search box
  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        const data = await api(`/notes?search=${encodeURIComponent(search)}`, { token });
        setNotes(data.notes);
        setError("");
      } catch (err) {
        handleError(err);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [search, token, handleError]);

  const saveNote = async (note) => {
    const body = { title: note.title, content: note.content, color: note.color, pinned: note.pinned };
    if (note._id) {
      const { note: updated } = await api(`/notes/${note._id}`, { method: "PATCH", token, body });
      setNotes((list) => sortNotes(list.map((n) => (n._id === updated._id ? updated : n))));
    } else {
      const { note: created } = await api("/notes", { method: "POST", token, body });
      setNotes((list) => sortNotes([created, ...list]));
    }
  };

  const togglePin = async (note) => {
    try {
      await saveNote({ ...note, pinned: !note.pinned });
    } catch (err) {
      handleError(err);
    }
  };

  const removeNote = async (note) => {
    if (!window.confirm("Delete this note? This can't be undone.")) return;
    try {
      await api(`/notes/${note._id}`, { method: "DELETE", token });
      setLeaving(note._id); // play the exit animation, then remove
      setTimeout(() => {
        setNotes((list) => list.filter((n) => n._id !== note._id));
        setLeaving(null);
      }, 280);
    } catch (err) {
      handleError(err);
    }
  };

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    return {
      total: notes.length,
      pinned: notes.filter((n) => n.pinned).length,
      today: notes.filter((n) => new Date(n.updatedAt).toDateString() === today).length,
    };
  }, [notes]);

  const colorCounts = useMemo(() => {
    const counts = {};
    notes.forEach((n) => (counts[n.color] = (counts[n.color] || 0) + 1));
    return counts;
  }, [notes]);

  const visible = colorFilter === "all" ? notes : notes.filter((n) => n.color === colorFilter);
  const pinned = visible.filter((n) => n.pinned);
  const others = visible.filter((n) => !n.pinned);
  const isFiltering = Boolean(search) || colorFilter !== "all";
  const firstName = (name || "there").split(" ")[0];

  const clearFilters = () => {
    setSearch("");
    setColorFilter("all");
  };

  return (
    <div className="app">
      <header className="topbar">
        <h1 className="brand">
          <span className="logo">✎</span> Notes
        </h1>
        <div className="search-wrap">
          <span className="search-icon"><SearchIcon /></span>
          <input
            className="search"
            type="search"
            placeholder="Search your notes"
            aria-label="Search your notes"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="who">
          <span className="avatar" aria-hidden="true">{firstName.charAt(0).toUpperCase()}</span>
          <span className="muted who-name">{name}</span>
          <button className="btn" onClick={logout}>Log out</button>
        </div>
      </header>

      <main className="content">
        <section className="hero">
          <div>
            <h2 className="hello">
              {greeting()}, {firstName} <span className="wave" aria-hidden="true">👋</span>
            </h2>
            <p className="muted">
              {stats.total ? "Here's everything on your board." : "A fresh, blank board. Let's put something on it."}
            </p>
          </div>
          {stats.total > 0 && (
            <div className="stats">
              <div className="stat"><b>{stats.total}</b><span>Notes</span></div>
              <div className="stat"><b>{stats.pinned}</b><span>Pinned</span></div>
              <div className="stat"><b>{stats.today}</b><span>Edited today</span></div>
            </div>
          )}
        </section>

        <button className="composer" onClick={() => setEditing({ ...EMPTY })}>
          <PlusIcon />
          <span>Take a note...</span>
          <span className="dots" aria-hidden="true">
            {COLORS.map((c) => <i key={c} style={{ "--c": `var(--${c})` }} />)}
          </span>
        </button>

        {notes.length > 0 && (
          <div className="filters" role="group" aria-label="Filter by colour">
            <button className={`chip ${colorFilter === "all" ? "on" : ""}`} onClick={() => setColorFilter("all")}>
              All <small>{notes.length}</small>
            </button>
            {COLORS.filter((c) => colorCounts[c]).map((c) => (
              <button key={c} className={`chip ${colorFilter === c ? "on" : ""}`} onClick={() => setColorFilter(c)}>
                <i className="dot" style={{ "--c": `var(--${c})` }} />
                {c} <small>{colorCounts[c]}</small>
              </button>
            ))}
          </div>
        )}

        {error && <p className="error" role="alert">{error}</p>}

        {loading && (
          <div className="grid" aria-busy="true" aria-label="Loading your notes">
            {[150, 210, 120, 180, 140, 200].map((h, i) => (
              <div key={i} className="skeleton" style={{ height: h, "--i": i }} />
            ))}
          </div>
        )}

        {!loading && visible.length === 0 && (
          <div className="empty">
            <div className="empty-art" aria-hidden="true"><i /><i /><i /></div>
            <h2>{isFiltering ? "No notes match that" : "Your board is empty"}</h2>
            <p className="muted">
              {isFiltering
                ? "Try a different word or colour, or clear the filters."
                : "Pick a starter below, or write your first note from scratch."}
            </p>
            {isFiltering ? (
              <button className="btn" onClick={clearFilters}>Clear filters</button>
            ) : (
              <div className="templates">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.label}
                    className="template"
                    style={{ "--c": `var(--${t.color})` }}
                    onClick={() => setEditing({ ...EMPTY, ...t })}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {pinned.length > 0 && (
          <NoteGroup title="Pinned" notes={pinned} leaving={leaving} onEdit={setEditing} onPin={togglePin} onDelete={removeNote} />
        )}
        {others.length > 0 && (
          <NoteGroup
            title={pinned.length ? "Other notes" : null}
            notes={others}
            offset={pinned.length}
            leaving={leaving}
            onEdit={setEditing}
            onPin={togglePin}
            onDelete={removeNote}
          />
        )}
      </main>

      <button className="fab" onClick={() => setEditing({ ...EMPTY })} aria-label="New note">
        <PlusIcon size={26} />
      </button>

      {editing && <Editor note={editing} onClose={() => setEditing(null)} onSave={saveNote} />}
    </div>
  );
}

const sortNotes = (list) =>
  [...list].sort((a, b) => Number(b.pinned) - Number(a.pinned) || new Date(b.updatedAt) - new Date(a.updatedAt));

function NoteGroup({ title, notes, offset = 0, leaving, onEdit, onPin, onDelete }) {
  return (
    <section>
      {title && <h2 className="group-title">{title}</h2>}
      <div className="grid">
        {notes.map((n, i) => {
          const words = wordCount(n.content);
          return (
            <article
              key={n._id}
              className={`note ${n.color} ${leaving === n._id ? "leaving" : ""}`}
              style={{ "--i": Math.min(i + offset, 14) }}
            >
              {n.pinned && <span className="pin-badge" title="Pinned"><PinIcon size={14} /></span>}
              <button className="note-body" onClick={() => onEdit(n)} aria-label={`Edit note ${n.title || ""}`}>
                {n.title && <h3>{n.title}</h3>}
                <p>{n.content}</p>
              </button>
              <footer>
                <span className="meta">
                  <time>{formatDate(n.updatedAt)}</time>
                  {words > 0 && <span> · {words} {words === 1 ? "word" : "words"}</span>}
                </span>
                <span className="note-actions">
                  <button
                    className={`icon-btn ${n.pinned ? "on" : ""}`}
                    onClick={() => onPin(n)}
                    aria-label={n.pinned ? "Unpin note" : "Pin note"}
                    title={n.pinned ? "Unpin" : "Pin"}
                  >
                    <PinIcon />
                  </button>
                  <button className="icon-btn danger" onClick={() => onDelete(n)} aria-label="Delete note" title="Delete">
                    <TrashIcon />
                  </button>
                </span>
              </footer>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function Editor({ note, onClose, onSave }) {
  const [draft, setDraft] = useState(note);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await onSave(draft);
      onClose();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form
        className={`editor note ${draft.color}`}
        onSubmit={submit}
        onKeyDown={(e) => (e.ctrlKey || e.metaKey) && e.key === "Enter" && submit(e)}
        role="dialog"
        aria-label={note._id ? "Edit note" : "New note"}
      >
        <input
          className="editor-title"
          placeholder="Title"
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          autoFocus
        />
        <textarea
          placeholder="Write your note"
          rows={8}
          value={draft.content}
          onChange={(e) => setDraft({ ...draft, content: e.target.value })}
        />
        <div className="editor-row">
          <div className="swatches" role="radiogroup" aria-label="Note colour">
            {COLORS.map((c) => (
              <button
                type="button"
                key={c}
                role="radio"
                aria-checked={draft.color === c}
                aria-label={c}
                className={`swatch ${c} ${draft.color === c ? "on" : ""}`}
                onClick={() => setDraft({ ...draft, color: c })}
              />
            ))}
          </div>
          <label className="check">
            <input type="checkbox" checked={draft.pinned} onChange={(e) => setDraft({ ...draft, pinned: e.target.checked })} />
            Pin to top
          </label>
        </div>
        {error && <p className="error" role="alert">{error}</p>}
        <div className="editor-row">
          <span className="hint">{wordCount(draft.content)} words · Ctrl + Enter to save</span>
          <div className="editor-actions">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button className="btn primary" disabled={saving}>{saving ? "Saving..." : "Save note"}</button>
          </div>
        </div>
      </form>
    </div>
  );
}
