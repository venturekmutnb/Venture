document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('../../backend/adminsystem/Mpackage/getpackage.php');
    const packages = await res.json();

    const topPackages = packages.slice(0, 4);  

    const container = document.getElementById('topDestinationList');
    container.innerHTML = ''; 
    topPackages.forEach(pkg => {
      container.innerHTML += renderTopPackage(pkg);
    });

  } catch (err) {
    console.error('โหลดข้อมูล package ล้มเหลว:', err);
  }
});

function renderTopPackage(p) {
  const imageFile = p.image_url ? encodeURIComponent(p.image_url.split('/').pop()) : 'default.jpg';
  return `
    <div class="tourcon">
        <img class="tourimg" src="../../backend/adminsystem/Mpackage/getimage.php?file=${imageFile}" alt="${p.destination}">
        <div class="tourdetail">
            <h3 class="tourname">${p.title}</h3>
            <p class="tourdata">${p.destination} ${p.duration_days} วัน</p>
            <p class="tourprice">${Number(p.price).toLocaleString()} ฿</p>
            <a class="tourbtn" href="packageDetail.html?id=${p.package_id}">ดูรายละเอียด</a>
        </div>
    </div>
  `;
}
