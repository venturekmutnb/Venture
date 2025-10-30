fetch('../../Public/admin_dash/sideadmin.html')
  .then(response => response.text())
  .then(data => {
    document.getElementById('sidebar-container').innerHTML = data;

    const toggleBtn = document.getElementById("toggle-btn");
    const sidebar = document.getElementById("sidebar");
    toggleBtn.addEventListener("click", () => {
      if (window.innerWidth <= 768) {
        // 📱 Mobile: เปิด/ปิดแบบ slide
        sidebar.classList.toggle("active");
      } else {
        // 💻 Desktop: พับ sidebar
        sidebar.classList.toggle("closed");
      }
    });

    document.addEventListener("click", (e) => {
      if (window.innerWidth <= 768) {
        if (!sidebar.contains(e.target) && !toggleBtn.contains(e.target)) {
          sidebar.classList.remove("active");
        }
      }
    });
  });