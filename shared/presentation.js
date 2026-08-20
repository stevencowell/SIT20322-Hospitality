(function () {
  "use strict";
  const decks = Array.from(document.querySelectorAll(".deck"));
  let activeDeck = null;
  let index = 0;
  function showDeck(id) {
    activeDeck = decks.find(function (deck) { return deck.id === id; }) || decks[0];
    decks.forEach(function (deck) { deck.hidden = deck !== activeDeck; });
    index = 0;
    showSlide();
  }
  function showSlide() {
    if (!activeDeck) return;
    const slides = Array.from(activeDeck.querySelectorAll(".slide"));
    index = Math.max(0, Math.min(index, slides.length - 1));
    slides.forEach(function (slide, slideIndex) { slide.hidden = slideIndex !== index; });
    activeDeck.querySelector("[data-slide-status]").textContent = (index + 1) + " / " + slides.length;
    activeDeck.querySelector("[data-prev]").disabled = index === 0;
    activeDeck.querySelector("[data-next]").disabled = index === slides.length - 1;
    activeDeck.querySelector(".slide:not([hidden])")?.focus();
  }
  decks.forEach(function (deck) {
    deck.querySelector("[data-prev]").addEventListener("click", function () { index -= 1; showSlide(); });
    deck.querySelector("[data-next]").addEventListener("click", function () { index += 1; showSlide(); });
    deck.querySelector("[data-fullscreen]").addEventListener("click", function () { deck.requestFullscreen?.(); });
  });
  document.querySelectorAll("[data-open-deck]").forEach(function (button) {
    button.addEventListener("click", function () {
      window.location.hash = button.dataset.openDeck;
      showDeck(button.dataset.openDeck);
      document.querySelector(".presentation-stage").scrollIntoView({ behavior: "smooth" });
    });
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "ArrowRight" || event.key === "PageDown") { index += 1; showSlide(); }
    if (event.key === "ArrowLeft" || event.key === "PageUp") { index -= 1; showSlide(); }
    if (event.key === "Home") { index = 0; showSlide(); }
    if (event.key === "End" && activeDeck) { index = activeDeck.querySelectorAll(".slide").length - 1; showSlide(); }
  });
  showDeck(window.location.hash.slice(1) || "task-1-deck");
}());
