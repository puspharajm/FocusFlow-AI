import { useState } from "react";
import { BookOpen, Tag, Plus, Search, Trash2, Edit3, Check, Calendar } from "lucide-react";
import { KnowledgeNote } from "../types";

interface KnowledgeVaultProps {
  notes: KnowledgeNote[];
  onNotesChange: (notes: KnowledgeNote[]) => void;
}

export default function KnowledgeVault({ notes, onNotesChange }: KnowledgeVaultProps) {
  const [selectedNoteId, setSelectedNoteId] = useState<string>(notes[0]?.id || "");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Note Form Editor States
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editCategory, setEditCategory] = useState("Productivity Science");
  const [editTags, setEditTags] = useState("");

  const selectedNote = notes.find(n => n.id === selectedNoteId);

  // Filter notes by search query
  const filteredNotes = notes.filter((n) =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Create empty new note
  const handleCreateNote = () => {
    const newNote: KnowledgeNote = {
      id: "note-" + Date.now(),
      title: "Untitled Conceptual Capsule",
      content: "Start typing your technical concepts, guidelines, or cognitive checklists here...",
      category: "Conceptual Notes",
      lastModified: new Date().toISOString(),
      tags: ["FocusFlow", "Standard Draft"]
    };

    onNotesChange([newNote, ...notes]);
    setSelectedNoteId(newNote.id);
    setEditTitle(newNote.title);
    setEditContent(newNote.content);
    setEditCategory(newNote.category);
    setEditTags(newNote.tags.join(", "));
    setIsEditing(true);
  };

  // Open note in editor
  const handleStartEdit = () => {
    if (!selectedNote) return;
    setEditTitle(selectedNote.title);
    setEditContent(selectedNote.content);
    setEditCategory(selectedNote.category);
    setEditTags(selectedNote.tags.join(", "));
    setIsEditing(true);
  };

  // Save edits in notes list
  const handleSaveNote = () => {
    if (!selectedNote) return;

    const parsedTags = editTags
      .split(",")
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const updated = notes.map((n) => {
      if (n.id === selectedNoteId) {
        return {
          ...n,
          title: editTitle.trim() || "Untitled Note",
          content: editContent,
          category: editCategory.trim() || "Conceptual Notes",
          lastModified: new Date().toISOString(),
          tags: parsedTags.length ? parsedTags : ["Standard Draft"]
        };
      }
      return n;
    });

    onNotesChange(updated);
    setIsEditing(false);
  };

  // Delete note
  const handleDeleteNote = (noteId: string) => {
    const remaining = notes.filter(n => n.id !== noteId);
    onNotesChange(remaining);
    if (selectedNoteId === noteId) {
      setSelectedNoteId(remaining[0]?.id || "");
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm min-h-[550px] flex flex-col lg:flex-row gap-6">
      
      {/* Left List of Documents (Col-4) */}
      <div className="w-full lg:w-80 shrink-0 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-200/60 pb-6 lg:pb-0 lg:pr-6 space-y-4">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-brand-primary" />
                Knowledge Directory
              </h3>
              <p className="text-[11px] text-slate-400">Save conceptual files and deep-work checkmarks.</p>
            </div>
            
            <button
              onClick={handleCreateNote}
              className="p-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg cursor-pointer"
              title="Add Concept Note"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conceptual files..."
              className="w-full bg-slate-50 border border-slate-150 rounded-xl pl-8 pr-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-primary text-slate-800"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>

          {/* List of notes */}
          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
            {filteredNotes.map((note) => (
              <button
                key={note.id}
                onClick={() => {
                  setSelectedNoteId(note.id);
                  setIsEditing(false);
                }}
                className={`w-full text-left p-3 rounded-2xl border transition-all flex flex-col justify-between gap-1 cursor-pointer ${
                  selectedNoteId === note.id
                    ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                    : "bg-slate-50 hover:bg-slate-100 border-slate-150 text-slate-700"
                }`}
              >
                <div>
                  <span className={`text-[9px] font-mono font-bold uppercase ${
                    selectedNoteId === note.id ? "text-brand-secondary" : "text-indigo-650"
                  }`}>
                    {note.category}
                  </span>
                  <h4 className="font-semibold text-xs mt-0.5 line-clamp-1">{note.title}</h4>
                </div>

                <div className="flex justify-between items-center text-[9px] tracking-wider font-mono opacity-80 mt-1">
                  <span>📅 {new Date(note.lastModified).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                  <div className="flex gap-1">
                    {note.tags.slice(0, 1).map((t, idx) => (
                      <span key={idx} className="px-1 bg-slate-200/55 dark:bg-slate-800/40 rounded text-slate-500 dark:text-slate-300">#{t}</span>
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Directory size indicator */}
        <div className="bg-slate-50 p-2.5 rounded-2xl text-[10px] text-slate-400 font-mono text-center border border-slate-150">
          🔋 Vault calibrated at {notes.length} conceptual files
        </div>
      </div>

      {/* Right Note Frame View/Editor (Col-8) */}
      <div className="flex-1 flex flex-col justify-between h-[500px]">
        {selectedNote ? (
          <>
            {isEditing ? (
              /* Editing State */
              <div className="space-y-4 flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Concept Category</label>
                    <input
                      type="text"
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Tags (Comma split)</label>
                    <input
                      type="text"
                      value={editTags}
                      placeholder="Productivity, Standards"
                      onChange={(e) => setEditTags(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Concept Title</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none"
                  />
                </div>

                <div className="flex-1 flex flex-col">
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Concept Body Markdown</label>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={12}
                    className="w-full flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-mono focus:outline-none resize-none"
                  />
                </div>
              </div>
            ) : (
              /* Reading State (Premium Document Reader) */
              <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-100 uppercase tracking-wide">
                    {selectedNote.category}
                  </span>
                  
                  <div className="flex gap-1.5">
                    {selectedNote.tags.map((tag, i) => (
                      <span key={i} className="text-[9px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md text-slate-400 flex items-center gap-1 font-mono">
                        <Tag className="w-2.5 h-2.5" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <h2 className="font-display font-bold text-xl sm:text-2xl text-slate-900 border-b border-slate-100 pb-3 mt-2">
                  {selectedNote.title}
                </h2>

                <p className="text-xs sm:text-sm leading-relaxed text-slate-600 whitespace-pre-wrap font-sans">
                  {selectedNote.content}
                </p>
              </div>
            )}

            {/* Note Controls Footer bar */}
            <div className="border-t border-slate-100 pt-3 flex justify-between items-center mt-4">
              <span className="text-[9px] text-slate-400 font-mono">
                📅 Calibrated: {new Date(selectedNote.lastModified).toLocaleString()}
              </span>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleDeleteNote(selectedNote.id)}
                  className="px-3.5 py-1.5 border border-red-100 hover:bg-red-50 text-red-500 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all"
                  title="Purge asset"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Trash
                </button>

                {isEditing ? (
                  <button
                    type="button"
                    onClick={handleSaveNote}
                    className="px-4 py-1.5 bg-brand-primary text-white text-xs font-semibold rounded-xl flex items-center gap-1 cursor-pointer shadow"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Save concept
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleStartEdit}
                    className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1 cursor-pointer shadow"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-brand-secondary" />
                    Modify
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col justify-center items-center text-center text-slate-400 text-xs">
            No Concept Note selected. Press "+" to deploy an empty file asset.
          </div>
        )}
      </div>

    </div>
  );
}
