// Full names from the class roster; the 16 yellow-highlighted rows are excluded.
const classGirls = [
  "Dương Minh Anh",
  "Phạm Võ Tú Anh",
  "Võ Lê Phương Anh",
  "Trần Thục Linh Chi",
  "Nguyễn Kiều Duyên",
  "Nguyễn Thị Quỳnh Giang",
  "Nguyễn Khánh Hà",
  "Lưu Bảo Hân",
  "Phan Quỳnh Gia Hân",
  "Phạm Ngọc Quỳnh Hương",
  "Za Li Kha",
  "Vương Nguyễn Minh Khuê",
  "Hà Ngọc Mai",
  "Hoàng Mai Trà My",
  "Lê Hoàng Bảo Nghi",
  "Trần Ngọc Phương Nghi",
  "Nguyễn Bảo Ngọc",
  "Đặng Bảo Nhi",
  "Nguyễn Long Gia Nhi",
  "Trần Ngọc Cẩm Nhung",
  "Trần Yến Ninh",
  "Lê Hoàng Mai Phương",
  "Vũ Thị Mai Phương",
  "Lê Trần Ngọc Tâm",
  "Lê Châu Bảo Thi",
  "Nguyễn Thị Cẩm Thu",
  "Huỳnh Minh Thư",
  "Trần Ngọc Minh Thư",
  "Phạm Hoàng Ngọc Thy",
  "Đặng Quỳnh Trâm",
  "Lê Thanh Trang",
  "Hồ Thanh Vân",
  "Đặng Lê Thảo Vy",
  "Phạm Nguyễn Thúy Vy",
  "Trương Đức Minh Vy",
];

(function () {
  const scene = document.getElementById("final-scene");
  const field = document.getElementById("floating-names");
  const motionButton = document.getElementById("toggle-name-motion");
  const finalMusic = document.getElementById("final-music");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let paused = reducedMotion.matches;
  let resizeTimer;

  function renderNames() {
    const compact = window.innerWidth < 600;
    const repeatCount = window.innerWidth < 1000 ? 2 : 3;
    const floatingNames = Array.from({ length: repeatCount }, function () {
      return classGirls;
    }).flat();
    // Shuffle copies so repeated names don't follow the same visible order.
    for (let i = floatingNames.length - 1; i > 0; i--) {
      const other = Math.floor(Math.random() * (i + 1));
      [floatingNames[i], floatingNames[other]] = [floatingNames[other], floatingNames[i]];
    }
    const measurements = document.createElement("canvas").getContext("2d");
    const placements = [];
    const travelHeight = window.innerHeight + 220;
    const fragment = document.createDocumentFragment();

    floatingNames.forEach(function (name, index) {
      const size = compact ? 13 : 14 + index % 4;
      measurements.font = "600 " + size + "px Segoe UI, Arial, sans-serif";
      const width = Math.ceil(measurements.measureText(name).width) + 8;
      const phase = (index + Math.random()) / floatingNames.length;
      const duration = 36 + Math.random() * 18;
      const availableWidth = Math.max(0, field.clientWidth - width - 40);
      let left = 20;
      let bestOverlap = Infinity;
      // Try scattered positions and prefer room between nearby names.
      // No fixed columns; occasional crossings are part of the floating effect.
      for (let attempt = 0; attempt < 24; attempt++) {
        const candidate = 20 + Math.random() * availableWidth;
        const overlap = placements.reduce(function (total, previous) {
          const phaseGap = Math.abs(phase - previous.phase);
          const verticalGap = Math.min(phaseGap, 1 - phaseGap) * travelHeight;
          if (verticalGap > 34) return total;
          const sharedWidth = Math.max(0, Math.min(candidate + width, previous.left + previous.width) - Math.max(candidate, previous.left) + 12);
          return total + sharedWidth * (34 - verticalGap);
        }, 0);
        if (overlap < bestOverlap) {
          left = candidate;
          bestOverlap = overlap;
        }
        if (overlap === 0) break;
      }
      placements.push({ left: left, width: width, phase: phase });
      const drop = document.createElement("span");
      const label = document.createElement("span");
      drop.className = "name-drop";
      label.className = "floating-name";
      label.textContent = name;
      drop.style.setProperty("--scatter-left", left + "px");
      drop.style.setProperty("--name-width", width + "px");
      drop.style.setProperty("--fall-duration", duration + "s");
      drop.style.setProperty("--fall-delay", -(phase * duration) + "s");
      drop.style.setProperty("--sway-duration", (5 + Math.random() * 7) + "s");
      drop.style.setProperty("--sway-delay", -(Math.random() * 12) + "s");
      drop.style.setProperty("--sway-start", -(4 + Math.random() * 10) + "px");
      drop.style.setProperty("--sway-end", (4 + Math.random() * 10) + "px");
      drop.style.setProperty("--tilt-start", (-6 + Math.random() * 6) + "deg");
      drop.style.setProperty("--tilt-end", (Math.random() * 6) + "deg");
      drop.style.setProperty("--name-size", size + "px");
      drop.style.setProperty("--name-color", ["#ffe3ef", "#fff3d6", "#e5d8ff", "#ffd0df"][index % 4]);
      drop.appendChild(label);
      fragment.appendChild(drop);
    });
    field.replaceChildren(fragment);
  }

  function updateMotion() {
    scene.classList.toggle("names-paused", paused);
    scene.classList.toggle("reduced-motion", reducedMotion.matches);
    motionButton.textContent = paused ? "Cho tên bay tiếp" : "Tạm dừng tên bay";
    motionButton.setAttribute("aria-pressed", String(paused));
    motionButton.hidden = reducedMotion.matches;
    if (reducedMotion.matches) document.querySelector(".class-keepsake").open = true;
  }

  motionButton.addEventListener("click", function () {
    paused = !paused;
    updateMotion();
  });
  reducedMotion.addEventListener("change", function () {
    paused = reducedMotion.matches;
    updateMotion();
  });
  window.addEventListener("resize", function () {
    if (scene.hidden) return;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(renderNames, 180);
  });

  window.showFinalScene = function (title, wish) {
    if (!scene.hidden) return;
    document.getElementById("final-title").textContent = title;
    document.getElementById("final-wish").textContent = wish;
    const list = document.getElementById("class-girls-list");
    classGirls.forEach(function (name) {
      const item = document.createElement("li");
      item.textContent = name;
      list.appendChild(item);
    });
    document.querySelector(".wrapper").hidden = true;
    scene.hidden = false;
    document.body.classList.add("final-active");
    renderNames();
    updateMotion();
    document.getElementById("final-title").focus({ preventScroll: true });
    // Switch songs only when the final greeting appears.
    const music = document.querySelector("body > audio");
    if (music) music.pause();
    finalMusic.currentTime = 0;
    finalMusic.play().catch(function () {});
  };
})();
