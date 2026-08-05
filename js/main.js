/* 全站公共：导航高亮、滚动显现 */
(function () {
  const cur = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach(a => {
    if (a.getAttribute("href") === cur) a.classList.add("active");
  });
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  window.observeReveals = () => document.querySelectorAll(".reveal:not(.in)").forEach(el => io.observe(el));
  observeReveals();
})();
