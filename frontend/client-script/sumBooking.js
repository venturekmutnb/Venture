// sumBooking.js (แก้ไขสมบูรณ์)
let currentSubtotal = 0;
let currentPackageId = '';
let currentAutoDiscount = 0;
let currentPackagePromoDiscount = 0;
let currentCodePromoDiscount = 0;
let currentLoyaltyDiscount = 0;
let currentPointsBalance = 0;

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const packageId = urlParams.get('package_id');
  const travelers = parseInt(urlParams.get('travelers'), 10) || 1;

  if (!packageId || packageId.trim() === '') {
    const td = document.getElementById('tripDetails');
    if (td) td.innerHTML = '<p style="color: red;">เกิดข้อผิดพลาด: ไม่พบข้อมูลแพ็กเกจ</p>';
    return;
  }
  currentPackageId = packageId.trim();

  try {
    const res = await fetch(`../../backend/getPackageById.php?package_id=${currentPackageId}`);
    if (!res.ok) throw new Error('ไม่สามารถโหลดแพ็กเกจได้');
    const packageData = await res.json();

    const pricePerPerson = parseFloat(packageData.price) || 0;
    currentSubtotal = pricePerPerson * travelers;

    document.getElementById('summary-package').textContent = packageData.title || '-';
    document.getElementById('tripDate').textContent = packageData.travel_date || '-';
    document.getElementById('tripTravelers').textContent = travelers;

    const formattedSubtotal = currentSubtotal.toLocaleString('th-TH') + ' Baht';
    document.getElementById('subtotalValue').textContent = formattedSubtotal;
    document.getElementById('sumSubtotal').textContent = formattedSubtotal;

    applyAutoPromotion(packageData.travel_date);
    await loadPackagePromotions(currentPackageId);
    await loadUserPoints();
    saveBookingToLocalStorage(travelers);

  } catch (err) {
    const td = document.getElementById('tripDetails');
    if (td) td.innerHTML = `<p style="color: red;">เกิดข้อผิดพลาด: ${err.message}</p>`;
  }

  document.getElementById('applyPromoBtn')?.addEventListener('click', handleApplyPromo);
  document.getElementById('applyLoyaltyBtn')?.addEventListener('click', handleApplyLoyalty);
});

// --- Early Bird / Last Minute ---
function applyAutoPromotion(travelDateStr) {
  try {
    const travelDate = new Date(travelDateStr);
    const today = new Date(); 
    today.setHours(0,0,0,0);
    const diffDays = Math.ceil((travelDate - today) / (1000*60*60*24));

    let promoName = '';
    let promoPercent = 0;

    if (diffDays >= 30) { promoName='Early Bird'; promoPercent=15; }
    else if (diffDays <=7 && diffDays >=0) { promoName='Last Minute'; promoPercent=10; }

    const labelEl = document.getElementById('autoDiscountLabel');
    const valueEl = document.getElementById('autoDiscountValue');
    const rowEl = document.getElementById('rowAutoDiscount');

    if (promoPercent > 0) {
      currentAutoDiscount = currentSubtotal * promoPercent / 100;
      if(labelEl) labelEl.textContent = `${promoName} ${promoPercent}%`;
      if(valueEl) valueEl.textContent = `- ${currentAutoDiscount.toLocaleString('th-TH',{minimumFractionDigits:2})} Baht`;
      if(rowEl) rowEl.classList.remove('isHidden');
    } else {
      currentAutoDiscount = 0;
      if(rowEl) rowEl.classList.add('isHidden');
    }

    updateFinalTotal();
  } catch(e) { console.error('Error calculating auto promotion:', e); }
}

// --- Promotion จากฐานข้อมูล ---
async function loadPackagePromotions(packageId) {
  try {
    const res = await fetch(`../../backend/getPackagePromotions.php?package_id=${packageId}`);
    if (!res.ok) throw new Error('ไม่สามารถโหลดโปรโมชั่นได้');
    const data = await res.json();

    if (data.success && Array.isArray(data.promotions)) {
      let maxDiscount = 0;
      let promoLabel = '';
      const today = new Date();

      data.promotions.forEach(p => {
        const start = p.start_date ? new Date(p.start_date) : null;
        const end = p.end_date ? new Date(p.end_date) : null;
        if ((!start || today>=start) && (!end || today<=end)) {
          const pct = parseFloat(p.discount_percent)||0;
          const discountAmount = currentSubtotal * pct/100;
          if(discountAmount>maxDiscount){ maxDiscount=discountAmount; promoLabel=`${p.name} ${pct}%`; }
        }
      });

      if(maxDiscount>0){
        currentPackagePromoDiscount = maxDiscount;
        document.querySelector('#rowPromo .sumLabel').textContent = promoLabel;
        document.getElementById('promoDiscount').textContent = `- ${currentPackagePromoDiscount.toLocaleString('th-TH',{minimumFractionDigits:2})} Baht`;
        document.getElementById('rowPromo').classList.remove('isHidden');
      } else currentPackagePromoDiscount=0;

      updateFinalTotal();
    }
  } catch(err){ console.error(err); }
}

// --- โหลดแต้มผู้ใช้ ---
function loadUserPoints() {
  return fetch('../../backend/getUserpoints.php')
    .then(res => res.ok ? res.json() : Promise.reject('ไม่สามารถโหลดแต้มสะสมได้'))
    .then(data => {
      currentPointsBalance = Number(data.points)||0;
      document.getElementById('pointsBalance').textContent=currentPointsBalance.toLocaleString();
    })
    .catch(err => {
      console.error(err);
      document.getElementById('pointsBalance').textContent='N/A';
    });
}

// --- ใช้โค้ดโปรโมชั่น (NEW10, EARLY15, LAST10, ฐานข้อมูล) ---
async function handleApplyPromo() {
  const promoCode = document.getElementById('promo')?.value.trim().toUpperCase() || '';
  const feedbackEl = document.querySelector('.promoFeedback');

  if (!promoCode) {
    if (feedbackEl) { feedbackEl.textContent = 'กรุณากรอกโค้ด'; feedbackEl.style.color = 'red'; }
    return;
  }

  const travelDateStr = document.getElementById('tripDate')?.textContent;
  const travelDate = new Date(travelDateStr);
  const today = new Date();
  today.setHours(0,0,0,0);
  const diffDays = Math.ceil((travelDate - today) / (1000*60*60*24));

  let discountAmount = 0;

  try {
    if (promoCode === 'EARLY15') {
      if (diffDays >= 30) discountAmount = currentSubtotal * 0.15;
      else throw new Error('โค้ด EARLY15 ต้องใช้ก่อนการเดินทางอย่างน้อย 30 วัน');
    } else if (promoCode === 'LAST10') {
      if (diffDays >= 7) discountAmount = currentSubtotal * 0.10;
      else throw new Error('โค้ด LAST10 ต้องใช้ก่อนการเดินทางอย่างน้อย 7 วัน');
    } else {
      // เช็คโค้ดจาก backend เช่น NEW10 หรืออื่น ๆ
      const res = await fetch('../../backend/getDiscountCode.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode, package_id: currentPackageId, subtotal: currentSubtotal })
      });
      const data = await res.json();
      if (data.success) discountAmount = Number(data.discountAmount || currentSubtotal * Number(data.discountPercent || 0)/100);
      else throw new Error(data.message || 'โค้ดไม่ถูกต้อง');
    }

    currentCodePromoDiscount = discountAmount;
    document.getElementById('packageCodeDiscount').textContent = `- ${discountAmount.toLocaleString('th-TH',{minimumFractionDigits:2})} Baht`;
    document.getElementById('rowPackageCode').classList.remove('isHidden');
    if (feedbackEl) { feedbackEl.textContent = 'ใช้โค้ดสำเร็จ'; feedbackEl.style.color='green'; }
    document.getElementById('promo').disabled = true;
    document.getElementById('applyPromoBtn').disabled = true;

    updateFinalTotal();
    saveBookingToLocalStorage();

  } catch(e) {
    if (feedbackEl) { feedbackEl.textContent = e.message; feedbackEl.style.color='red'; }
    currentCodePromoDiscount = 0;
    document.getElementById('rowPackageCode').classList.add('isHidden');
    updateFinalTotal();
  }
}

// --- ใช้แต้มสะสม ---
function handleApplyLoyalty(){
  let pointsToRedeem = parseInt(document.getElementById('loyaltyPts')?.value)||0;
  if(pointsToRedeem<=0){ currentLoyaltyDiscount=0; document.getElementById('rowLoyalty').classList.add('isHidden'); updateFinalTotal(); return; }
  if(pointsToRedeem>currentPointsBalance) pointsToRedeem=currentPointsBalance;

  let redeemBaht = pointsToRedeem/100;
  const maxAllowed = currentSubtotal*0.5;
  if(redeemBaht>maxAllowed){ redeemBaht=maxAllowed; pointsToRedeem=Math.floor(maxAllowed*100); }

  currentLoyaltyDiscount = redeemBaht;
  currentPointsBalance-=pointsToRedeem;
  document.getElementById('pointsBalance').textContent=currentPointsBalance.toLocaleString();
  document.getElementById('loyaltyDiscount').textContent=`- ${redeemBaht.toLocaleString('th-TH',{minimumFractionDigits:2})} Baht`;
  document.getElementById('rowLoyalty').classList.remove('isHidden');
  document.getElementById('loyaltyPts').value=pointsToRedeem;

  updateFinalTotal();
  saveBookingToLocalStorage();
}

// --- Update Final Total ---
function updateFinalTotal(){
  const totalDiscount = currentAutoDiscount+currentPackagePromoDiscount+currentCodePromoDiscount+currentLoyaltyDiscount;
  const finalTotal = Math.max(0,currentSubtotal-totalDiscount);
  document.getElementById('finalTotal').textContent=finalTotal.toLocaleString('th-TH',{minimumFractionDigits:2})+' Baht';
  sessionStorage.setItem('finalPaymentTotal', finalTotal);
}

// --- Save Booking ---
function saveBookingToLocalStorage(){
  const travelers = parseInt(document.getElementById('tripTravelers')?.textContent)||1;
  const bookingDetails={
    packageId:currentPackageId,
    quantity:travelers,
    totalPrice: currentSubtotal-currentAutoDiscount-currentPackagePromoDiscount-currentCodePromoDiscount-currentLoyaltyDiscount,
    discountCode: document.getElementById('promo')?.value||null
  };
  localStorage.setItem('currentBooking', JSON.stringify(bookingDetails));
}
