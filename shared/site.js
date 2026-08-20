(function () {
  "use strict";

  const RESPONSE_PREFIX = "tas:hospitality:sit20322:2026:v1:";
  const PROGRESS_PREFIX = "tas:hospitality:sit20322:2026:progress:v2:";
  const LAST_VISIT_KEY = PROGRESS_PREFIX + "last-visit";
  window.HOSPITALITY_STORAGE_PREFIX = RESPONSE_PREFIX;
  window.HOSPITALITY_PROGRESS_PREFIX = PROGRESS_PREFIX;

  const modules = {
    "task-1": { title: "Safety in the Kitchen", href: "task-1-safety.html", sections: ["start", "whs", "hygiene", "cleaning", "food-safety", "mise-en-place", "sandwiches", "apply"] },
    "task-2": { title: "Service Please", href: "task-2-service.html", sections: ["start", "standards", "needs", "orders", "inclusive", "problems", "feedback"] },
    "task-3": { title: "The Hospitality Industry", href: "task-3-industry.html", sections: ["start", "sectors", "work", "sources", "change", "brief"] },
    "task-4": { title: "Working in Hospitality", href: "task-4-working.html", sections: ["start", "readiness", "beverages", "coffee", "workflow", "quality", "team"] }
  };
  window.HOSPITALITY_MODULES = modules;

  const icon = document.createElement("link");
  icon.rel = "icon";
  icon.href = "assets/favicon.svg";
  icon.type = "image/svg+xml";
  document.head.append(icon);

  const page = document.body.dataset.page || "home";
  const navItems = [
    ["home", "Home", "index.html"],
    ["tasks", "Learning", "index.html#tasks"],
    ["activities", "Activities", "activities.html"],
    ["evidence", "Evidence", "evidence.html"],
    ["progress", "Progress", "progress.html"],
    ["resources", "Resources", "resources.html"],
    ["teacher", "Teacher", "teacher-resources.html"]
  ];

  const header = document.createElement("header");
  header.className = "site-header";
  header.innerHTML = `
    <a class="skip-link" href="#main-content">Skip to main content</a>
    <div class="nav-wrap">
      <a class="brand" href="index.html" aria-label="Hospitality course home">
        <span class="brand-mark" aria-hidden="true">HOS</span>
        <span class="brand-text">Stage 6 Hospitality</span>
      </a>
      <span class="header-progress" data-header-progress aria-label="Course section progress">0%</span>
      <button class="menu-button" type="button" aria-expanded="false" aria-controls="site-navigation">Menu</button>
      <nav class="site-nav" id="site-navigation" aria-label="Course navigation">
        ${navItems.map(([key, label, href]) => `<a href="${href}"${key === page ? ' aria-current="page"' : ""}>${label}</a>`).join("")}
        <a href="https://stevencowell.github.io/Main-Page/">Main Menu</a>
      </nav>
    </div>`;
  document.body.prepend(header);

  const button = header.querySelector(".menu-button");
  const nav = header.querySelector(".site-nav");
  button.addEventListener("click", function () {
    const open = nav.dataset.open === "true";
    nav.dataset.open = String(!open);
    button.setAttribute("aria-expanded", String(!open));
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && nav.dataset.open === "true") {
      nav.dataset.open = "false";
      button.setAttribute("aria-expanded", "false");
      button.focus();
    }
  });

  function isComplete(task, section) {
    return localStorage.getItem(PROGRESS_PREFIX + task + ":" + section) === "true";
  }
  function moduleProgress(task) {
    const item = modules[task];
    const done = item.sections.filter(function (section) { return isComplete(task, section); }).length;
    return { done: done, total: item.sections.length, percent: Math.round(done / item.sections.length * 100) };
  }
  function overallProgress() {
    let done = 0;
    let total = 0;
    Object.keys(modules).forEach(function (task) {
      const value = moduleProgress(task);
      done += value.done;
      total += value.total;
    });
    return { done: done, total: total, percent: Math.round(done / total * 100) };
  }
  function refreshProgress() {
    const overall = overallProgress();
    document.querySelectorAll("[data-header-progress]").forEach(function (node) { node.textContent = overall.percent + "%"; });
    document.querySelectorAll("[data-overall-progress]").forEach(function (node) { node.textContent = overall.done + " of " + overall.total + " sections"; });
    document.querySelectorAll("[data-overall-percent]").forEach(function (node) { node.textContent = overall.percent + "%"; });
    document.querySelectorAll("[data-overall-bar]").forEach(function (node) { node.style.width = overall.percent + "%"; });
    Object.keys(modules).forEach(function (task) {
      const value = moduleProgress(task);
      document.querySelectorAll(`[data-task-progress="${task}"]`).forEach(function (node) { node.textContent = value.done + "/" + value.total; });
      document.querySelectorAll(`[data-task-percent="${task}"]`).forEach(function (node) { node.textContent = value.percent + "%"; });
      document.querySelectorAll(`[data-task-bar="${task}"]`).forEach(function (node) { node.style.width = value.percent + "%"; });
    });
  }

  document.querySelectorAll("[data-progress]").forEach(function (input) {
    const key = PROGRESS_PREFIX + input.dataset.progress;
    input.checked = localStorage.getItem(key) === "true";
    input.closest(".complete-toggle")?.classList.toggle("is-complete", input.checked);
    input.addEventListener("change", function () {
      localStorage.setItem(key, String(input.checked));
      input.closest(".complete-toggle")?.classList.toggle("is-complete", input.checked);
      refreshProgress();
    });
  });

  function setLastVisit(section) {
    const task = document.body.dataset.task;
    if (!task || !modules[task]) return;
    const heading = section.querySelector("h2")?.textContent || modules[task].title;
    localStorage.setItem(LAST_VISIT_KEY, JSON.stringify({ href: modules[task].href + "#" + section.id, label: modules[task].title + " — " + heading, savedAt: new Date().toISOString() }));
  }
  const observed = document.querySelectorAll(".lesson-section[id]");
  if (observed.length && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(function (entries) {
      entries.filter(function (entry) { return entry.isIntersecting; }).sort(function (a, b) { return b.intersectionRatio - a.intersectionRatio; }).slice(0, 1).forEach(function (entry) { setLastVisit(entry.target); });
    }, { rootMargin: "-18% 0px -60%", threshold: [0.2, 0.5] });
    observed.forEach(function (section) { observer.observe(section); });
  }

  let lastVisit = null;
  try { lastVisit = JSON.parse(localStorage.getItem(LAST_VISIT_KEY)); } catch (_) { lastVisit = null; }
  document.querySelectorAll("[data-resume]").forEach(function (link) {
    if (lastVisit && lastVisit.href) {
      link.href = lastVisit.href;
      link.textContent = "Resume: " + lastVisit.label;
    } else {
      link.href = "task-1-safety.html#start";
      link.textContent = "Start Task 1: Safety in the Kitchen";
    }
  });

  const dashboard = document.querySelector("[data-progress-dashboard]");
  if (dashboard) {
    dashboard.innerHTML = Object.keys(modules).map(function (task) {
      const item = modules[task];
      const progress = moduleProgress(task);
      return `<article class="progress-card">
        <div class="progress-card-head"><div><p class="micro-label">${task.replace("task-", "Task ")}</p><h2>${item.title}</h2></div><strong>${progress.done}/${progress.total}</strong></div>
        <div class="progress-track" aria-label="${progress.percent}% complete"><span style="width:${progress.percent}%"></span></div>
        <ul class="section-status-list">${item.sections.map(function (section, index) { const done = isComplete(task, section); return `<li class="${done ? "done" : ""}"><span aria-hidden="true">${done ? "✓" : index + 1}</span>${section.replaceAll("-", " ")}</li>`; }).join("")}</ul>
        <a class="button-link secondary" href="${item.href}">Open task</a>
      </article>`;
    }).join("");
  }

  document.querySelectorAll(".visual-block img").forEach(function (img) {
    img.tabIndex = 0;
    img.setAttribute("role", "button");
    img.setAttribute("aria-label", (img.alt || "Diagram") + ". Open larger.");
    function openVisual() {
      const dialog = document.createElement("dialog");
      dialog.className = "visual-dialog";
      dialog.innerHTML = `<button type="button" class="dialog-close" aria-label="Close larger diagram">Close</button><img src="${img.src}" alt="${(img.alt || "").replaceAll('"', "&quot;")}">`;
      document.body.append(dialog);
      dialog.querySelector(".dialog-close").addEventListener("click", function () { dialog.close(); });
      dialog.addEventListener("close", function () { dialog.remove(); img.focus(); });
      dialog.addEventListener("click", function (event) { if (event.target === dialog) dialog.close(); });
      dialog.showModal();
    }
    img.addEventListener("click", openVisual);
    img.addEventListener("keydown", function (event) { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openVisual(); } });
  });

  refreshProgress();
  const footer = document.createElement("footer");
  footer.className = "site-footer";
  footer.innerHTML = `<div class="footer-inner"><div><strong>SIT20322 Hospitality</strong><br><span>NSW Department of Education RTO 90333 · supplementary learning hub</span></div><div class="footer-links"><a href="course-information.html">Course information</a><a href="work-placement.html">Work placement</a><a href="revision.html">Revision</a><a href="presentations.html">Presentations</a></div><span>Assessment and competency decisions remain with the authorised trainer/assessor.</span></div>`;
  document.body.append(footer);
}());
