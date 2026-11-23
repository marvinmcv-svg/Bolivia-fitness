/* Nosotros: reels y feed de Instagram (el contenido social vive acá, no en el inicio) */
(function () {
  "use strict";
  const X = window.BFX, B = X.B, $ = X.$, esc = X.esc;
  $("#reelRail").innerHTML = B.reels.map((r) => '<a class="reel" href="' + esc(r.url) + '" target="_blank" rel="noopener"><video muted playsinline loop preload="none" poster="' + esc(r.src) + '.webp" data-autoplay><source src="' + esc(r.src) + '.mp4" type="video/mp4"></video><span>' + esc(r.caption) + "</span></a>").join("");
  $("#feedgrid").innerHTML = B.feed.map((f) => '<a href="' + esc(f.url) + '" target="_blank" rel="noopener"><img src="' + esc(f.img) + '" width="600" height="600" alt="' + esc(f.alt) + '" loading="lazy"></a>').join("");
  X.autoplay(); X.reveal();
})();
