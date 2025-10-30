document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('../../backend/adminsystem/Mpackage/getpackage.php');
    const packages = await res.json();

    const container = document.querySelector('#promotionsContainer');
    container.innerHTML = ''; // ล้าง container ก่อน

    // สร้าง map ของ promotionName => grid element
    const promoSections = {};

    // สร้าง All Packages ไว้ก่อนเลย เพื่อให้อยู่ด้านล่างสุด
    const allSection = document.createElement('section');
    allSection.classList.add('packagesection');

    const allTitle = document.createElement('h2');
    allTitle.classList.add('sectionname');
    allTitle.textContent = 'All Packages';
    allSection.appendChild(allTitle);

    const allGrid = document.createElement('div');
    allGrid.classList.add('packagegrid');
    allSection.appendChild(allGrid);

    container.appendChild(allSection);
    promoSections['All Packages'] = allGrid;

    // ฟังก์ชันสร้าง element ของ package
    function createPackageElement(p) {
      const div = document.createElement('div');
      div.classList.add('packagebox');

      if (p.promotions.length) {
        const badge = document.createElement('div');
        badge.classList.add('packagebadge');
        badge.textContent = p.promotions.map(x => x.name).join(', ');
        div.appendChild(badge);
      }

      const img = document.createElement('img');
      img.classList.add('packageimg');
      const imageFile = p.image_url ? encodeURIComponent(p.image_url.split('/').pop()) : '';
      img.src = `../../backend/adminsystem/Mpackage/getimage.php?file=${imageFile}`;
      img.alt = p.title;
      div.appendChild(img);

      const body = document.createElement('div');
      body.classList.add('packagebody');

      const h3 = document.createElement('h3');
      h3.classList.add('packagename');
      h3.textContent = p.title;
      body.appendChild(h3);

      const info1 = document.createElement('div');
      info1.classList.add('packageinfo');
      info1.innerHTML = `<p class="packagedata">${p.destination} ${p.duration_days} วัน</p>
                         <p class="packagedate">เดินทาง: ${p.travel_date}</p>`;
      body.appendChild(info1);

      const info2 = document.createElement('div');
      info2.classList.add('packageinfo');
      info2.innerHTML = `<p class="packageprice">${Number(p.price).toLocaleString()} บาท</p>
                         <p class="packageseat">คงเหลือ: ${p.available_seats}</p>`;
      body.appendChild(info2);

      const actions = document.createElement('div');
      actions.classList.add('packageactions');
      actions.innerHTML = `<a class="packagebtn" href="packageDetail.html?id=${p.package_id}">ดูรายละเอียด</a>`;
      body.appendChild(actions);

      div.appendChild(body);
      return div;
    }

    // วนลูป package
    packages.forEach(p => {
      // ✅ ถ้าที่นั่งหมด ไม่ต้องแสดงเลย
      if (p.available_seats <= 0) return;

      // สำหรับแต่ละ promotion ของ package
      p.promotions.forEach(promo => {
        const promoName = promo.name;

        // ถ้ายังไม่มี section สำหรับ promotion นี้ ให้สร้าง
        if (!promoSections[promoName]) {
          const section = document.createElement('section');
          section.classList.add('packagesection');

          const title = document.createElement('h2');
          title.classList.add('sectionname');
          title.textContent = promoName;
          section.appendChild(title);

          const grid = document.createElement('div');
          grid.classList.add('packagegrid');
          section.appendChild(grid);

          // เพิ่ม promotion section **ก่อน All Packages** 
          container.insertBefore(section, allSection);
          promoSections[promoName] = grid;
        }

        // เพิ่ม package ลงใน section ของ promotion
        promoSections[promoName].appendChild(createPackageElement(p));
      });

      // เพิ่ม package ลงใน All Packages เสมอ
      promoSections['All Packages'].appendChild(createPackageElement(p));
    });

  } catch (err) {
    console.error(err);
    alert('ไม่สามารถโหลด package ได้');
  }
});
