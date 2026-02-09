function GetQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function SetText(element_id, text_value) {
  const element_el = document.getElementById(element_id);
  if (element_el) {
    element_el.textContent = text_value || "";
  }
}

function RemoveSection(section_id) {
  const section_el = document.getElementById(section_id);
  if (section_el && section_el.parentNode) {
    section_el.parentNode.removeChild(section_el);
  }
}

async function DoesFileExist(file_url) {
  // Try HEAD first
  try {
    const head_res = await fetch(file_url, { method: "HEAD", cache: "no-store" });
    if (head_res.ok) {
      return true;
    }
    if (head_res.status === 404) {
      return false;
    }
  } catch (err) {
    // Ignore and fall back to Range GET
  }

  // Fallback: Range GET (more compatible with static servers)
  try {
    const get_res = await fetch(file_url, {
      method: "GET",
      headers: { Range: "bytes=0-0" },
      cache: "no-store"
    });
    return get_res.status === 206 || get_res.status === 200;
  } catch (err) {
    return false;
  }
}

async function Main() {
  const folder_name = GetQueryParam("p"); // e.g. image_classifier
  if (!folder_name) {
    document.body.innerHTML = `<p>Missing ?p= folder. <a href="../index.html">Back</a></p>`;
    return;
  }

  // Because project.html is in /projects/, this resolves to /projects/<folder_name>/
  const base_path = `./${folder_name}`;

  const details_url = `${base_path}/details.json`;
  const video_url = `${base_path}/video.mp4`;
  const slides_url = `${base_path}/slides.pdf`;
  const report_url = `${base_path}/report.pdf`;

  // Load details.json
  const details_res = await fetch(details_url, { cache: "no-store" });
  if (!details_res.ok) {
    document.body.innerHTML = `<p>Cannot load ${details_url} (HTTP ${details_res.status}). <a href="../index.html">Back</a></p>`;
    return;
  }

  const details_json = await details_res.json();

  SetText("title", details_json.title);
  SetText("overview", details_json.overview);
  document.title = details_json.title || "Project";

  // Tech stack (safe if missing)
  const tech_ul = document.getElementById("tech");
  if (tech_ul) {
    tech_ul.innerHTML = "";
    (details_json.tech || []).forEach(tech_item => {
      const li_el = document.createElement("li");
      li_el.textContent = tech_item;
      tech_ul.appendChild(li_el);
    });
  }

  // Auto-detect artifacts (run in parallel)
  const [has_video, has_slides, has_report] = await Promise.all([
    DoesFileExist(video_url),
    DoesFileExist(slides_url),
    DoesFileExist(report_url)
  ]);

  // Demo (video)
  if (has_video) {
    const video_src_el = document.getElementById("video-src");
    const video_el = document.getElementById("video");
    if (video_src_el && video_el) {
      video_src_el.src = video_url;
      video_el.load();
    }
  } else {
    RemoveSection("demo-section");
  }

  // Slides
  if (has_slides) {
    const slides_el = document.getElementById("slides");
    if (slides_el) {
      slides_el.src = slides_url;
      // slides_el.src = `${slides_url}#toolbar=0&navpanes=0`;
    }
  } else {
    RemoveSection("slides-section");
  }

  // Report
  if (has_report) {
    const report_el = document.getElementById("report");
    if (report_el) {
      report_el.src = report_url;
      // report_el.src = `${report_url}#toolbar=0&navpanes=0`;
    }
  } else {
    RemoveSection("report-section");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  Main().catch(err => {
    console.error("Project page error:", err);
  });
});
