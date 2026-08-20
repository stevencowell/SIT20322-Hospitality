(function () {
  "use strict";

  const responsePrefix = window.HOSPITALITY_STORAGE_PREFIX || "tas:hospitality:sit20322:2026:v1:";
  const artefactPrefix = window.HOSPITALITY_ARTEFACT_PREFIX || "tas:hospitality:sit20322:2026:artefact:v3:";

  document.querySelectorAll("[data-import-activity]").forEach(function (button) {
    const panel = button.closest(".evidence-import");
    const select = panel.querySelector("[data-activity-import-select]");
    const state = panel.querySelector(".import-state");
    button.addEventListener("click", function () {
      const option = select.selectedOptions[0];
      if (!option || !option.value) {
        state.textContent = "Choose a completed activity first.";
        return;
      }
      const saved = localStorage.getItem(responsePrefix + option.value);
      if (!saved?.trim()) {
        state.textContent = "That activity has no saved reflection yet. Open it, record the evidence and return here.";
        return;
      }
      const target = document.getElementById(button.dataset.target);
      const heading = option.dataset.title || option.textContent;
      const imported = "Imported learning activity — " + heading + "\n" + saved;
      target.value = target.value.trim() ? target.value.trim() + "\n\n" + imported : imported;
      target.dispatchEvent(new Event("input", { bubbles: true }));
      target.focus();
      state.textContent = "Imported. Check the wording, add the observed result and keep private details out.";
    });
  });

  function previewFor(id, data) {
    const figure = document.querySelector('[data-artefact-preview="' + id + '"]');
    if (!figure) return;
    if (!data?.dataUrl) {
      figure.innerHTML = "<span>No local artefact added</span>";
      return;
    }
    figure.innerHTML = '<img src="' + data.dataUrl + '" alt="Student-selected local learning artefact preview"><figcaption>' + (data.name || "Local learning artefact") + ' · stored only in this browser</figcaption><button type="button" class="secondary" data-remove-artefact="' + id + '">Remove local artefact</button>';
    figure.querySelector("[data-remove-artefact]").addEventListener("click", function () {
      localStorage.removeItem(artefactPrefix + id);
      previewFor(id, null);
      const state = document.querySelector('[data-artefact-file="' + id + '"]')?.closest(".artefact-uploader")?.querySelector(".artefact-state");
      if (state) state.textContent = "Local artefact removed from this browser.";
    });
  }

  document.querySelectorAll("[data-artefact-file]").forEach(function (input) {
    const id = input.dataset.artefactFile;
    const state = input.closest(".artefact-uploader").querySelector(".artefact-state");
    try { previewFor(id, JSON.parse(localStorage.getItem(artefactPrefix + id) || "null")); }
    catch (error) { localStorage.removeItem(artefactPrefix + id); }
    input.addEventListener("change", function () {
      const file = input.files?.[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) {
        state.textContent = "That source image is over 5 MB. Choose a smaller image.";
        input.value = "";
        return;
      }
      if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
        state.textContent = "Choose a JPEG, PNG or WebP image.";
        input.value = "";
        return;
      }
      const reader = new FileReader();
      reader.onload = function () {
        const image = new Image();
        image.onload = function () {
          const scale = Math.min(1, 1200 / Math.max(image.width, image.height));
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.round(image.width * scale));
          canvas.height = Math.max(1, Math.round(image.height * scale));
          canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
          const payload = { name: file.name, type: "image/jpeg", width: canvas.width, height: canvas.height, savedAt: new Date().toISOString(), dataUrl: canvas.toDataURL("image/jpeg", 0.78) };
          try {
            localStorage.setItem(artefactPrefix + id, JSON.stringify(payload));
            previewFor(id, payload);
            state.textContent = "Reduced to " + canvas.width + " × " + canvas.height + " and saved only in this browser.";
          } catch (error) {
            state.textContent = "The browser has no space for this preview. Download a backup, remove another artefact or choose a smaller image.";
          }
        };
        image.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  });
}());
