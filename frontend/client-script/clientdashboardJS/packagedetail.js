//../../backend/adminsystem/Mpackage/getpackage_detail.php
document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const packageId = urlParams.get('id');
  if (!packageId) {
    alert("ไม่พบ package ID");
    return;
  }

  try {
    // fetch package + plan
    const res = await fetch(`../../backend/adminsystem/Mpackage/getpackage_detail.php?id=${packageId}`);
    const json = await res.json();

    if (!json.success) {
      throw new Error(json.message || "ไม่พบข้อมูลแพ็กเกจ");
    }

    const data = json.data;
    if (!data.length) {
      throw new Error("ไม่พบข้อมูลแพ็กเกจ");
    }

    const pkg = data[0]; // ข้อมูล package หลัก

    // render image
    const imgContainer = document.querySelector('.imgGal');
    if (pkg.image_url) {
      imgContainer.innerHTML = `<img class="imgItem" src="../../backend/adminsystem/Mpackage/${pkg.image_url}" alt="${pkg.package_title}">`;
    } else {
      imgContainer.innerHTML = `<p>ไม่มีรูปภาพ</p>`;
    }

    // render package summary
    const summaryContainer = document.querySelector('.pkBox');
    summaryContainer.innerHTML = `
      <p><span class="pkLabel">Package:</span> ${pkg.package_title}</p>
      <p><span class="pkLabel">Destination:</span> ${pkg.destination}</p>
      <p><span class="pkLabel">Duration:</span> ${pkg.duration_days} วัน</p>
      <p><span class="pkLabel">Departure:</span> ${pkg.travel_date}</p>
      <p><span class="pkLabel">Seats Left:</span> ${pkg.available_seats}</p>
      <p><span class="pkLabel">Base Price:</span> ${Number(pkg.price).toLocaleString()} Baht</p>
      <p><span class="pkLabel">Description:</span> ${pkg.description}</p>
    `;

    // render plans
    const planContainer = document.querySelector('.pkPlan');
    planContainer.innerHTML = `<h2 class="pkTitle">Plan</h2>`;

    data.forEach(plan => {
      if (!plan.day_number) return;

      // split activities by comma
      const activityList = plan.activities
        ? plan.activities.split(',').map(act => `<li>${act.trim()}</li>`).join('')
        : '';

      planContainer.innerHTML += `
        <div class="planTrip">
          <div class="planHeader">
            <span class="day">Day ${plan.day_number}</span>
            <h3 class="planTitle">${plan.plan_title}</h3>
          </div>
          <ul class="planList">
            ${activityList}
          </ul>
        </div>
      `;
    });

  } catch (err) {
    console.error("Error fetching package:", err);
    alert("โหลดข้อมูลล้มเหลว: " + err.message);
  }
});
