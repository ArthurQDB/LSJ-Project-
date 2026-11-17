/*
 * main.js — Estudos com Jogos (página inicial)
 * Único comportamento da página: manter o ano do rodapé atualizado.
 * (As animações do hero são feitas só com CSS.)
 */
(function () {
  "use strict";

  var year = String(new Date().getFullYear());
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = year;
  });
})();
