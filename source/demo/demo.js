import { createTaskCard } from "../task-card/task-card.js";
const members = [
  { user_id: 1, full_name: "Alex K." },
  { user_id: 2, full_name: "Jordan M." },
  { user_id: 3, full_name: "Sam R." },
];
const seed = [
  {
    task_id: 1,
    title: "Restore mobile session refresh",
    description: "The release is blocked until the session contract is reviewed.",
    status: "blocked",
    priority: "urgent",
    assigned_to: 1,
    full_name: "Alex K.",
    is_blocked: true,
    blocker_reason: "Waiting for session contract review",
    story_points: 5,
    estimate_hours: 4,
  },
  {
    task_id: 2,
    title: "Review the session contract",
    description: "Unblock the mobile fix by reviewing the proposed refresh behavior.",
    status: "in-progress",
    priority: "high",
    assigned_to: 2,
    full_name: "Jordan M.",
    story_points: 3,
    estimate_hours: 2,
  },
  {
    task_id: 3,
    title: "Publish the release checklist",
    description: "Check the recovery steps before handing the release to support.",
    status: "todo",
    priority: "medium",
    assigned_to: 3,
    full_name: "Sam R.",
    story_points: 2,
    estimate_hours: 1,
  },
];
const key = "sitrep-public-sample-v1";
let tasks = structuredClone(seed);
try {
  const saved = JSON.parse(localStorage.getItem(key));
  if (
    Array.isArray(saved) &&
    saved.length === seed.length &&
    saved.every((t, i) => t.task_id === seed[i].task_id)
  )
    tasks = saved;
} catch { /* Browser storage is optional for this sample. */ }
function render() {
  const board = document.querySelector("#board");
  board.replaceChildren();
  for (const [status, title] of [
    ["todo", "To do"],
    ["in-progress", "In progress"],
    ["blocked", "Blocked"],
    ["done", "Done"],
  ]) {
    const column = document.createElement("section");
    column.className = "column";
    const h = document.createElement("h2");
    h.textContent = title;
    column.append(h);
    function update(id, fields) {
      const t = tasks.find((t) => t.task_id === id);
      Object.assign(t, fields);
      if ("assigned_to" in fields)
        t.full_name = members.find((m) => m.user_id === Number(t.assigned_to))?.full_name || "";
      if ("status" in fields) t.is_blocked = t.status === "blocked";
      try {
        localStorage.setItem(key, JSON.stringify(tasks));
      } catch { /* Browser storage is optional for this sample. */ }
      render();
    }
    for (const task of tasks.filter((t) => t.status === status)) {
      const card = createTaskCard(task, document.querySelector("#method").value, {
        members,
        onChange: update,
      });
      for (const [field, choices] of [
        ["status", ["todo", "in-progress", "blocked", "done"]],
        ["priority", ["low", "medium", "high", "urgent"]],
      ]) {
        const label = document.createElement("label");
        label.textContent = field === "status" ? "Move task " : "Priority ";
        const select = document.createElement("select");
        select.setAttribute("aria-label", `${task.title} ${field}`);
        for (const value of choices) {
          const option = document.createElement("option");
          option.value = value;
          option.textContent = value;
          option.selected = task[field] === value;
          select.append(option);
        }
        select.onchange = () => update(task.task_id, { [field]: select.value });
        label.append(select);
        card.append(label);
      }
      column.append(card);
    }
    board.append(column);
  }
  document.querySelector("#summary").textContent =
    `${tasks.filter((t) => t.status === "done").length} of ${tasks.length} completed. ${tasks.filter((t) => t.status === "blocked").length} blocked. Changes stay in this browser.`;
}
document.querySelector("#method").onchange = render;
document.querySelector("#reset").onclick = () => {
  tasks = structuredClone(seed);
  try {
    localStorage.removeItem(key);
  } catch { /* Browser storage is optional for this sample. */ }
  render();
};
render();
