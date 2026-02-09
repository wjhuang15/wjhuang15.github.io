// Folder order only — this controls display order
const PROJECT_FOLDERS = [
  "image_classifier",
  "vehicle_dynamics",
  "game_engine_level_editor",
  "bon_voyage",
  "mobile_game",
  "networking_game",
  "cloud_application"
];

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("project-folders");
  if (!container) return;

  for (const folder of PROJECT_FOLDERS) {
    const basePath = `projects/${folder}`;

    let title = folder.replace(/_/g, " ");

    // Try to load title from details.json
    try {
      const res = await fetch(`${basePath}/details.json`);
      if (res.ok) {
        const details = await res.json();
        if (details.title) {
          title = details.title;
        }
      }
    } catch (err) {
      console.warn(`Failed to load details for ${folder}`, err);
    }

    // Create folder card
    const link = document.createElement("a");
    link.className = "folder-card";
    link.href = `projects/project.html?p=${encodeURIComponent(folder)}`;

    const img = document.createElement("img");
    img.src = "assets/icons/folder.png";
    img.alt = "Project folder";

    const span = document.createElement("span");
    span.textContent = title;

    link.appendChild(img);
    link.appendChild(span);
    container.appendChild(link);
  }
});
