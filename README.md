# 🗂️ Kanban Board (React + TypeScript + Tailwind)

A small, clean **Kanban board** built with **React + TypeScript + Vite** and styled by **TailwindCSS**.  
It focuses on code clarity, local state management, and a simple UX — suitable for learning and portfolio.

## ✨ Features
- Add / Edit / Delete cards
- Move between **Todo → Doing → Done**
- **Drag & Drop** (HTML5) between columns
- **LocalStorage** persistence (cards remain after refresh)
- Minimal, responsive UI with Tailwind

## 🛠 Tech Stack
- **React** + **TypeScript** + **Vite**
- **TailwindCSS** (no UI kit)
- HTML5 **Drag & Drop** (no extra libs)

## 📂 Project Structure

kanban-board/ src/ App.tsx # main UI, DnD, state, persistence main.tsx index.css # @tailwind base/components/utilities index.html tailwind.config.js postcss.config.js tsconfig.json package.json

## ▶ Run locally
```bash
npm install
npm run dev

Open: http://localhost:5173

🔍 How it works (short)

Cards are stored in a React state and persisted to LocalStorage:

on load: JSON.parse(localStorage.getItem("kanban-cards") ?? "[]")

on change: localStorage.setItem("kanban-cards", JSON.stringify(cards))


DnD: each card is draggable; columns handle onDragOver + onDrop to update the card’s column.


🧑‍💻 Author

Erfan Bashiri - Ali Bashiri — focused on practical, readable, and maintainable front-end code.
GitHub: https://github.com/ErfanBashiri95
