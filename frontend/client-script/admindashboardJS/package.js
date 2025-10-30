let plansCount = 0;
let promotions = [];
console.log('package.js loaded');

async function init() {
  await loadPromotions();
  bindAddDay('plansContainer', 'addDayBtn');  // bind add day ปกติ
  document.getElementById('addPackageForm').addEventListener('submit', submitAddPackage);
  document.getElementById('addPromoForm').addEventListener('submit', submitAddPromo);
  document.getElementById('closeEdit').addEventListener('click', () => document.getElementById('editModal').style.display='none');
  document.getElementById('editPackageForm').addEventListener('submit', submitEditPackage);
  bindAddDay('editPlansContainer','editAddDayBtn'); // bind add day modal edit
  loadPackages();
  loadPromotionsTable();
  await bindDiscounts();
}

// bind +Add Day ให้กับ container ใดก็ได้
function bindAddDay(containerId, btnId){
  document.getElementById(btnId).addEventListener('click', () => {
    plansCount++;
    const div = document.createElement('div');
    div.className = 'plan';
    div.innerHTML = `
      <strong>Day ${plansCount}</strong>
      <div class="row"><label>Title</label><input name="day_title_${plansCount}" required></div>
      <div class="row"><label>Activities</label><textarea name="day_activities_${plansCount}"></textarea></div>
      <button type="button" onclick="this.parentElement.remove()">Remove Day</button>
    `;
    document.getElementById(containerId).appendChild(div);
  });
}

// gather plans จาก container ใดก็ได้
function gatherPlans(containerId){
  const plans = [];
  const container = document.getElementById(containerId);
  const blocks = container.querySelectorAll('.plan');
  blocks.forEach((blk, idx)=>{
    const day = idx+1;
    const title = blk.querySelector(`[name="day_title_${day}"]`)?.value || '';
    const activities = blk.querySelector(`[name="day_activities_${day}"]`)?.value || '';
    plans.push({day_number: day, title, activities});
  });
  return plans;
}

// --- LOAD PROMOTIONS ---
async function loadPromotions(){
  const res = await fetch('../../../backend/adminsystem/Mpackage/getpro.php');
  promotions = await res.json();
  const container = document.getElementById('promoCheckboxes');
  container.innerHTML = '';
  promotions.forEach(p => {
    const label = document.createElement('label');
    label.innerHTML = `<input type="checkbox" name="promo_${p.promo_id}" value="${p.promo_id}"> ${p.name} (${p.discount_percent}%)`;
    container.appendChild(label);
  });
}

async function loadPromotionsTable(){
  const res = await fetch('../../../backend/adminsystem/Mpackage/getpro.php');
  const promos = await res.json();
  const tbody = document.querySelector('#promotionsTable tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  promos.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${p.promo_id}</td>
      <td>${p.name}</td>
      <td>${p.discount_percent}%</td>
      <td>${p.start_date || '-'}</td>
      <td>${p.end_date || '-'}</td>
      <td><button class="danger" onclick="deletePromotion('${p.promo_id}')">Delete</button></td>
    `;
    tbody.appendChild(tr);
  });
}

// --- LOAD PACKAGES ---
async function loadPackages(){
  const res = await fetch('../../../backend/adminsystem/Mpackage/getpackage.php');
  const data = await res.json();
  const tbody = document.querySelector('#packagesTable tbody');
  tbody.innerHTML = '';
  data.forEach(p=>{
    const tr = document.createElement('tr');
    const promos = p.promotions ? p.promotions.map(x=>x.name).join(', ') : '';
    const plans = p.plans ? p.plans.map(pl=>`Day ${pl.day_number}: ${pl.title}`).join('<br>') : '';
    tr.innerHTML = `
      <td>${p.package_id}</td>
      <td>${p.title}</td>
      <td>${p.destination}</td>
      <td>${p.travel_date}</td>
      <td>${p.duration_days}</td>
      <td>${Number(p.price).toLocaleString()}</td>
      <td>${p.available_seats}</td>
      <td>${p.description || ''}</td>
      <td>${promos}</td>
      <td>${plans}</td>
      <td>
        <button onclick="openEdit('${p.package_id}')">Edit</button>
        <button class="danger" onclick="deletePackage('${p.package_id}')">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// --- ADD PACKAGE ---
async function submitAddPackage(e){
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  document.querySelectorAll('#promoCheckboxes input[type="checkbox"]').forEach(cb=>{
    if (cb.checked) formData.append('promotions[]', cb.value);
  });
  formData.append('plans', JSON.stringify(gatherPlans('plansContainer')));
  const res = await fetch('../../../backend/adminsystem/Mpackage/addpackage.php', {method:'POST', body: formData});
  const text = await res.text();
  if (text.trim() === 'success') {
    alert('Package added');
    form.reset();
    document.getElementById('plansContainer').querySelectorAll('.plan').forEach(n=>n.remove());
    plansCount=0;
    loadPackages();
  } else alert('Error: '+text);
}

// --- ADD PROMO ---
async function submitAddPromo(e){
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  try {
    const res = await fetch('../../../backend/adminsystem/Mpackage/addpromotion.php', { method: 'POST', body: formData });
    const text = await res.text();
    if(text.trim() === 'success') {
      alert('Promotion created');
      form.reset();
      loadPromotions();
      loadPromotionsTable();
    } else { alert('Error: ' + text); }
  } catch(err) { console.error(err); alert('Fetch error'); }
}

// --- DELETE PACKAGE ---
async function deletePackage(id){
  if (!confirm('ต้องการลบแพ็กเกจนี้หรือไม่?')) return;
  const res = await fetch(`../../../backend/adminsystem/Mpackage/deletepackage.php?id=${id}`);
  const t = await res.text();
  if (t.trim()==='success'){ alert('Deleted'); loadPackages(); }
  else alert('Error: '+t);
}

// --- DELETE PROMO ---
async function deletePromotion(id){
  if (!confirm('ต้องการลบโปรโมชั่นนี้หรือไม่?')) return;
  const res = await fetch(`../../../backend/adminsystem/Mpackage/deletepromotion.php`, {
    method: 'POST',
    headers: {'Content-Type':'application/x-www-form-urlencoded'},
    body: `promo_id=${id}`
  });
  const t = await res.text();
  if (t.trim()==='success'){ alert('Promotion deleted'); loadPromotionsTable(); loadPromotions(); }
  else alert(t);
}

// --- EDIT PACKAGE ---
async function openEdit(id){
  const res = await fetch('../../../backend/adminsystem/Mpackage/getpackage.php');
  const data = await res.json();
  const p = data.find(x => x.package_id === id);
  if (!p) return alert('Not found');

  document.getElementById('edit_package_id').value = p.package_id;
  document.getElementById('edit_title').value = p.title;
  document.getElementById('edit_destination').value = p.destination;
  document.getElementById('edit_duration_days').value = p.duration_days;
  document.getElementById('edit_travel_date').value = p.travel_date;
  document.getElementById('edit_price').value = p.price;
  document.getElementById('edit_available_seats').value = p.available_seats;
  document.getElementById('edit_description').value = p.description || '';

  // clear & load plans
  const container = document.getElementById('editPlansContainer');
  container.innerHTML = '';
  plansCount = 0;
  if(p.plans && p.plans.length){
    p.plans.forEach(pl => {
      plansCount++;
      const div = document.createElement('div');
      div.className = 'plan';
      div.innerHTML = `
        <strong>Day ${plansCount}</strong>
        <div class="row"><label>Title</label><input name="day_title_${plansCount}" value="${pl.title}" required></div>
        <div class="row"><label>Activities</label><textarea name="day_activities_${plansCount}">${pl.activities}</textarea></div>
        <button type="button" onclick="this.parentElement.remove()">Remove Day</button>
      `;
      container.appendChild(div);
    });
  }

  document.getElementById('editModal').style.display = 'block';
}

async function submitEditPackage(e){
  e.preventDefault();
  const f = new FormData(e.target);
  f.append('plans', JSON.stringify(gatherPlans('editPlansContainer')));
  const res = await fetch('../../../backend/adminsystem/Mpackage/updatepackage.php',{method:'POST',body:f}); 
  const t = await res.text();
  if (t.trim()==='success'){ 
    alert('Updated'); 
    document.getElementById('editModal').style.display='none'; 
    loadPackages(); 
  } else alert('Error: '+t);
}

// --- DISCOUNT CODE ---
async function bindDiscounts() {
  await loadDiscounts();
  document.getElementById('addDiscountForm').addEventListener('submit', submitAddDiscount);
  document.getElementById('addRuleBtn').addEventListener('click', addRuleInput);
}

function addRuleInput() {
  const container = document.getElementById('rulesContainer');
  const div = document.createElement('div');
  div.className = 'rule-row';
  div.innerHTML = `
    <select name="rule_type[]">
      <option value="user_new_days">User New Days</option>
      <option value="min_price">Minimum Price</option>
      <option value="first_order_only">First Order Only</option>
    </select>
    <input type="text" name="rule_value[]" placeholder="Value">
    <button type="button" onclick="this.parentElement.remove()">Remove</button>
  `;
  container.appendChild(div);
}

async function submitAddDiscount(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  try {
    const res = await fetch('../../../backend/adminsystem/Mpackage/adddiscount.php', { method: 'POST', body: formData });
    const text = await res.text();
    if (text.trim() === 'success') {
      alert('Discount code & rules created');
      e.target.reset();
      document.getElementById('rulesContainer').innerHTML = '';
      await loadDiscounts();
    } else { alert('Error: '+text); }
  } catch(err) { console.error(err); alert('Fetch error'); }
}

async function loadDiscounts() {
  try {
    const res = await fetch('../../../backend/adminsystem/Mpackage/getdiscount.php');
    const codes = await res.json();
    const tbody = document.querySelector('#discountTable tbody');
    tbody.innerHTML = '';
    codes.forEach(c => {
      let rulesText = '';
      if (c.rules) {
        const parsed = typeof c.rules==='string'?JSON.parse(c.rules):c.rules;
        if(Array.isArray(parsed)){
          rulesText = parsed.map(r => `${r.rule_type}: ${r.rule_value}`).join(', ');
        }
      }
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${c.code}</td>
        <td>${c.discount_percent}</td>
        <td>${c.start_date || ''}</td>
        <td>${c.end_date || ''}</td>
        <td>${rulesText}</td>
        <td><button class="danger" onclick="deleteDiscount('${c.code_id}')">Delete</button></td>
      `;
      tbody.appendChild(tr);
    });
  } catch(err){ console.error(err); alert('Failed to load discount codes'); }
}

async function deleteDiscount(id) {
  if(!confirm('ลบ code นี้หรือไม่?')) return;
  try {
    const res = await fetch('../../../backend/adminsystem/Mpackage/deletediscount.php', {
      method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body:`code_id=${id}`
    });
    const text = await res.text();
    if(text.trim()==='success'){ alert('Deleted'); await loadDiscounts(); }
    else alert('Error: '+text);
  } catch(err){ console.error(err); alert('Fetch error'); }
}

document.addEventListener('DOMContentLoaded', init);
