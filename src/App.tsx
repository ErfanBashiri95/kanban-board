import { useEffect, useState } from "react";
import "./index.css";

type Column = "Todo" | "Doing" | "Done";
type Card = { id: string; title: string; column: Column };

const columns: Column[] = ["Todo", "Doing", "Done"];

export default function App() {
  // --- State ---
  const [cards, setCards] = useState<Card[]>(() => {
    const saved = localStorage.getItem("kanban-cards");
    return saved ? JSON.parse(saved) : [];
  });
  const [title, setTitle] = useState("");
  const [dragOverCol, setDragOverCol] = useState<Column | null>(null);

  // --- Persist to localStorage ---
  useEffect(() => {
    localStorage.setItem("kanban-cards", JSON.stringify(cards));
  }, [cards]);

  // --- Actions ---
  function addCard() {
    const t = title.trim();
    if (!t) return;
    setCards((prev) => [
      ...prev,
      { id: crypto.randomUUID(), title: t, column: "Todo" },
    ]);
    setTitle("");
  }

  function removeCard(id: string) {
    setCards((prev) => prev.filter((c) => c.id !== id));
  }

  function move(id: string, dir: "left" | "right") {
    setCards((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const idx = columns.indexOf(c.column);
        const next =
          dir === "left" ? Math.max(0, idx - 1) : Math.min(columns.length - 1, idx + 1);
        return { ...c, column: columns[next] };
      })
    );
  }

  function editTitle(id: string, nextTitle: string) {
    const t = nextTitle.trim();
    if (!t) return;
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, title: t } : c)));
  }

  // --- DnD helpers ---
  function onDropToColumn(col: Column, id: string) {
    if (!id) return;
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, column: col } : c)));
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex justify-center p-6">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <header className="mb-6 flex items-center justify-between gap-3">
          <h1 className="text-3xl font-bold">
            Kanban Board <span className="text-sky-400 text-base">React + TS</span>
          </h1>

          <div className="flex gap-2">
            <input
              className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="New card title…"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCard()}
            />
            <button
              onClick={addCard}
              className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 active:bg-sky-700"
            >
              Add
            </button>
          </div>
        </header>

        {/* Columns */}
        <div className="grid gap-4 md:grid-cols-3">
          {columns.map((col) => {
            const list = cards.filter((c) => c.column === col);
            const isHovered = dragOverCol === col;

            return (
              <section
                key={col}
                className={`rounded-xl p-3 border ${
                  isHovered
                    ? "bg-slate-800/90 border-sky-600"
                    : "bg-slate-800/80 border-slate-700/70"
                } transition-colors`}
              >
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400 mb-3">
                  {col} <span className="text-xs text-slate-500">({list.length})</span>
                </h2>

                {/* Drop zone */}
                <div
                  className={`min-h-40 rounded-lg p-2 ${
                    isHovered ? "bg-slate-900/50" : "bg-slate-900/30"
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverCol(col);
                  }}
                  onDragEnter={(e) => {
                    e.preventDefault();
                    setDragOverCol(col);
                  }}
                  onDragLeave={() => setDragOverCol(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    const id = e.dataTransfer.getData("text/plain");
                    setDragOverCol(null);
                    onDropToColumn(col, id);
                  }}
                >
                  <div className="space-y-2">
                    {list.map((c) => (
                      <CardItem
                        key={c.id}
                        card={c}
                        onMoveLeft={() => move(c.id, "left")}
                        onMoveRight={() => move(c.id, "right")}
                        onDelete={() => removeCard(c.id)}
                        onEdit={(t) => editTitle(c.id, t)}
                      />
                    ))}

                    {list.length === 0 && (
                      <p className="text-xs text-slate-500">No cards.</p>
                    )}
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Card Item ---------------- */

function CardItem({
  card,
  onMoveLeft,
  onMoveRight,
  onDelete,
  onEdit,
}: {
  card: Card;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onDelete: () => void;
  onEdit: (title: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(card.title);

  function submitEdit() {
    const t = draft.trim();
    if (!t || t === card.title) {
      setEditing(false);
      setDraft(card.title);
      return;
    }
    onEdit(t);
    setEditing(false);
  }

  return (
    <article
      className="bg-slate-700/70 border border-slate-600 rounded-lg p-3 flex items-center justify-between gap-2 cursor-move"
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", card.id);
        e.dataTransfer.effectAllowed = "move";
      }}
    >
      {editing ? (
        <input
          className="flex-1 bg-slate-900/60 border border-slate-600 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          value={draft}
          autoFocus
          onChange={(e) => setDraft(e.target.value)}
          onBlur={submitEdit}
          onKeyDown={(e) => {
            if (e.key === "Enter") submitEdit();
            if (e.key === "Escape") {
              setEditing(false);
              setDraft(card.title);
            }
          }}
        />
      ) : (
        <span
          className="flex-1 text-sm"
          onDoubleClick={() => setEditing(true)}
          title="Double-click to edit"
        >
          {card.title}
        </span>
      )}

      <div className="flex items-center gap-1">
        <button
          title="Move left"
          onClick={onMoveLeft}
          className="px-2 py-1 text-xs rounded bg-slate-600 hover:bg-slate-500 disabled:opacity-30"
          disabled={card.column === "Todo"}
        >
          ◀
        </button>
        <button
          title="Move right"
          onClick={onMoveRight}
          className="px-2 py-1 text-xs rounded bg-slate-600 hover:bg-slate-500 disabled:opacity-30"
          disabled={card.column === "Done"}
        >
          ▶
        </button>
        <button
          title="Edit"
          onClick={() => setEditing(true)}
          className="px-2 py-1 text-xs rounded bg-sky-600 hover:bg-sky-500"
        >
          Edit
        </button>
        <button
          title="Delete"
          onClick={onDelete}
          className="px-2 py-1 text-xs rounded bg-rose-600 hover:bg-rose-500"
        >
          Delete
        </button>
      </div>
    </article>
  );
}
