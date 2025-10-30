document.addEventListener('DOMContentLoaded', async () => {
    // ===== Elements =====
    const form = document.getElementById('profileForm');
    const inputs = form.querySelectorAll('input');
    const btnEdit = document.getElementById('btnEdit');
    const actions = document.getElementById('editActions');
    const btnCancel = document.getElementById('btnCancel');
    const btnVerifyEmail = document.getElementById('btnVerifyEmail');
    
    const historyContainer = document.getElementById('historyList'); 
    const pointsEl = document.getElementById('pointsValue');

    function setEditing(on){
        inputs.forEach(el => el.disabled = !on);
        actions.style.display = on ? 'flex' : 'none';
        btnEdit.style.display = on ? 'none' : 'inline-flex';
    }

    setEditing(false);

    // ===== Load Profile Data =====
    async function loadProfile(){
        try{
            const res = await fetch('../../../backend/usersystem/getusrPro.php');
            const data = await res.json();
            
            if(data.success){
                const user = data.data;
                document.getElementById('nameShow').textContent = user.username;
                document.getElementById('emailShow').textContent = user.email;
                document.getElementById('inputusername').value = user.username;
                document.getElementById('inputemail').value = user.email;
                document.getElementById('inputpassword').value = ''; 
            }
        } catch(err){
            console.error("Error loading profile:", err);
        }
    }

    // ===== Load User Points =====
    async function loadPoints() {
        try {
            const res = await fetch('../../../backend/getUserpoints.php');
            if (!res.ok) throw new Error('Cannot fetch points');
            const data = await res.json();
            pointsEl.textContent = (data.points !== undefined) ? Number(data.points).toLocaleString() : '0';
        } catch (err) {
            console.error('Error loading points:', err);
            pointsEl.textContent = 'N/A';
        }
    }

    // ===== Load Booking History =====
    async function loadHistory() {
        if (!historyContainer) return;

        try {
            const response = await fetch('../../../backend/get-history.php'); 
            if (!response.ok) throw new Error('Cannot fetch history');

            const bookings = await response.json(); 

            if (bookings.length === 0) {
                historyContainer.innerHTML = '<li class="history-item-none">ยังไม่มีประวัติการจอง</li>';
                return;
            }

            let historyHtml = ''; 
            bookings.forEach((booking, index) => {
                historyHtml += `
                    <li class="history-item status-${booking.status}">
                        <div class="item-header">
                            <strong>ลำดับที่ ${index + 1}: ${booking.package_name}</strong>
                            <span class="status-badge">${booking.statusText}</span> 
                        </div>
                        <div class="item-details">
                            <span>จองเมื่อ: ${new Date(booking.booking_date).toLocaleDateString('th-TH')}</span>
                            <span>ออกเดินทาง: ${new Date(booking.travel_date).toLocaleDateString('th-TH')}</span>
                        </div>
                    </li>
                `;
            });

            historyContainer.innerHTML = historyHtml;

        } catch (error) {
            console.error('Error fetching history:', error);
            historyContainer.innerHTML = '<li class="history-item-error">เกิดข้อผิดพลาดในการโหลดประวัติ</li>';
        }
    }

    // ===== เรียกใช้งานฟังก์ชันโหลดข้อมูล =====
    await loadProfile();
    await loadPoints();
    await loadHistory();

    // ===== Edit / Cancel =====
    btnEdit.addEventListener('click', () => setEditing(true));
    btnCancel.addEventListener('click', () => {
        loadProfile(); 
        setEditing(false);
    });

    // ===== Save Profile =====
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('inputusername').value;
        const email = document.getElementById('inputemail').value;
        const password = document.getElementById('inputpassword').value;

        try {
            const res = await fetch('../../../backend/usersystem/updateprofile.php', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });
            const data = await res.json();

            if(data.success){
                document.getElementById('nameShow').textContent = username;
                document.getElementById('emailShow').textContent = email;
                alert(data.message);
                setEditing(false);
            } else {
                alert(data.message);
            }
        } catch(err){
            console.error(err);
            alert('Error updating profile');
        }
    });

    // ===== Verify Email Button =====
    btnVerifyEmail.addEventListener('click', async () => {
        try{
            const res = await fetch('../../../backend/usersystem/sendconfirmemail.php', { method: 'POST' });
            const data = await res.json();
            alert(data.message);
        } catch(err){
            console.error("Error sending verify email:", err);
            alert("Failed to send verification email");
        }
    });

});
