document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("albumModal")) {
    return;
  }

  fetch("/pages/albums/album-modal.html?v=" + Date.now())
    .then((response) => response.text())
    .then((html) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const modal = doc.getElementById('albumModal');
      
      if (modal) {
        document.body.appendChild(modal);
        console.log("✅ Album modal loaded");
      }
    })
    .catch((error) => {
      console.error("❌ Failed to load album modal:", error);
    });
});
