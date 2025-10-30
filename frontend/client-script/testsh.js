async function loadPackages(sectionId, promoName = null) {
    const container = document.querySelector(`#${sectionId} .packagegrid`);
    container.innerHTML = "";

    const url = promoName ? `../../backend/getPackages.php?promo=${encodeURIComponent(promoName)}` 
                          : '../../backend/getPackages.php';
    const res = await fetch(url);
    const packages = await res.json();

    packages.forEach(pkg => {
        const box = document.createElement('div');
        box.className = 'packagebox';

        const badge = pkg.promo_name ? `<div class="packagebadge">${pkg.promo_name} -${pkg.discount_percent}%</div>` : '';

        box.innerHTML = `
            ${badge}
            <img class="packageimg" src="../Pics/${pkg.image_url}" alt="${pkg.title}">
            <div class="packagebody">
                <h3 class="packagename">${pkg.title}</h3>
                <div class="packageinfo">
                    <p class="packagedata">${pkg.destination} ${pkg.duration_days} วัน</p>
                    <p class="packagedate">เดินทาง: ${pkg.travel_date}</p>
                </div>
                <div class="packageinfo">
                    <p class="packageprice">${pkg.price} บาท</p>
                    <p class="packageseat">คงเหลือ: ${pkg.available_seats}</p>
                </div>
                <div class="packageactions">
                    <a class="packagebtn" href="#">ดูรายละเอียด</a>
                </div>
            </div>
        `;
        container.appendChild(box);
    });
}

// โหลดแต่ละ section ตามโปรโมชั่น
loadPackages('early', 'Early Bird');
loadPackages('last', 'Last Minute');
loadPackages('all'); // ไม่มีโปรโมชั่น
