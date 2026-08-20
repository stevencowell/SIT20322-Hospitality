(function () {
  "use strict";
  const prefix = window.HOSPITALITY_STORAGE_PREFIX || "tas:hospitality:sit20322:2026:v1:";
  const fields = Array.from(document.querySelectorAll("[data-save]"));
  const timers = new WeakMap();
  function fieldValue(field) { return field.type === "checkbox" ? String(field.checked) : field.value; }
  function restoreField(field, saved) { if (field.type === "checkbox") field.checked = saved === "true"; else field.value = saved; }
  function updateWordCount(field) {
    const target = document.querySelector(`[data-word-count-for="${field.id}"]`);
    if (!target) return;
    const words = field.value.trim() ? field.value.trim().split(/\s+/).length : 0;
    target.textContent = words + (words === 1 ? " word" : " words");
  }
  fields.forEach(function (field) {
    const key = prefix + field.dataset.save;
    const saved = localStorage.getItem(key);
    if (saved !== null) restoreField(field, saved);
    updateWordCount(field);
    const eventName = field.type === "checkbox" || field.tagName === "SELECT" ? "change" : "input";
    field.addEventListener(eventName, function () {
      localStorage.setItem(key, fieldValue(field));
      updateWordCount(field);
      const state = field.closest(".learning-card, .response-card, .panel")?.querySelector(".save-state");
      if (state) {
        state.textContent = "Saving…";
        clearTimeout(timers.get(field));
        timers.set(field, setTimeout(function () { state.textContent = "Saved on this device"; }, 350));
      }
    });
  });
  document.querySelectorAll(".knowledge-check").forEach(function (box) {
    const inputs = Array.from(box.querySelectorAll("input[type=radio]"));
    const answer = box.dataset.answer || inputs.find(function (input) { return input.dataset.checkAnswer; })?.dataset.checkAnswer;
    const feedback = box.querySelector(".feedback");
    const help = box.dataset.help || "Review the section, look for the workplace consequence, then try again.";
    inputs.forEach(function (input) {
      input.addEventListener("change", function () {
        const chosen = inputs.find(function (item) { return item.checked; });
        const correct = chosen && chosen.value === answer;
        feedback.textContent = correct ? (box.dataset.correct || "Correct — that action follows the safe workplace process.") : "Not yet. " + help;
        feedback.dataset.state = correct ? "correct" : "retry";
      });
    });
  });
  document.querySelectorAll("[data-reveal]").forEach(function (button) {
    const target = document.getElementById(button.dataset.reveal);
    if (!target) return;
    button.addEventListener("click", function () {
      const open = target.hidden;
      target.hidden = !open;
      button.setAttribute("aria-expanded", String(open));
      button.textContent = open ? "Hide scaffold" : "Show response scaffold";
    });
  });
  document.querySelectorAll("[data-copy-from]").forEach(function (button) {
    button.addEventListener("click", function () {
      const source = document.getElementById(button.dataset.copyFrom);
      if (!source) return;
      navigator.clipboard.writeText(source.value).then(function () {
        button.textContent = "Copied";
        setTimeout(function () { button.textContent = "Copy response"; }, 1200);
      }).catch(function () { window.alert("Select the response and copy it manually."); });
    });
  });
  const backup = document.querySelector("[data-backup]");
  if (backup) backup.addEventListener("click", function () {
    const data = { schema: 2, course: "SIT20322", savedAt: new Date().toISOString(), responses: {}, progress: {} };
    Object.keys(localStorage).forEach(function (key) {
      if (key.startsWith(prefix)) data.responses[key.slice(prefix.length)] = localStorage.getItem(key);
      if (window.HOSPITALITY_PROGRESS_PREFIX && key.startsWith(window.HOSPITALITY_PROGRESS_PREFIX)) data.progress[key.slice(window.HOSPITALITY_PROGRESS_PREFIX.length)] = localStorage.getItem(key);
    });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "sit20322-hospitality-learning-backup.json";
    link.click();
    setTimeout(function () { URL.revokeObjectURL(link.href); }, 0);
  });
  const restore = document.querySelector("[data-restore]");
  if (restore) restore.addEventListener("change", function () {
    const file = restore.files && restore.files[0];
    if (!file) return;
    file.text().then(function (text) {
      const data = JSON.parse(text);
      if (![1, 2].includes(data.schema) || data.course !== "SIT20322" || !data.responses) throw new Error("Invalid backup");
      Object.entries(data.responses).forEach(function ([key, value]) { localStorage.setItem(prefix + key, String(value)); });
      if (data.progress && window.HOSPITALITY_PROGRESS_PREFIX) Object.entries(data.progress).forEach(function ([key, value]) { localStorage.setItem(window.HOSPITALITY_PROGRESS_PREFIX + key, String(value)); });
      window.location.reload();
    }).catch(function () { window.alert("That file is not a valid SIT20322 learning backup."); });
  });
  const reset = document.querySelector("[data-reset]");
  if (reset) reset.addEventListener("click", function () {
    if (!window.confirm("Clear all saved Hospitality responses and progress from this device? Download a backup first if you need one.")) return;
    Object.keys(localStorage).forEach(function (key) {
      if (key.startsWith(prefix) || (window.HOSPITALITY_PROGRESS_PREFIX && key.startsWith(window.HOSPITALITY_PROGRESS_PREFIX))) localStorage.removeItem(key);
    });
    window.location.reload();
  });
}());
