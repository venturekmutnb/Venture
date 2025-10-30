
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. ประกาศตัวแปร Element ทั้งหมดไว้ที่นี่ ---
    const slipUpload = document.getElementById("slipUpload");
    const btnSuccess = document.querySelector(".btnSuccess");
    const uploadButton = document.getElementById("uploadButton");
    const fileNameDisplay = document.getElementById("fileName");
    const displayElement = document.getElementById('paymentAmountDisplay');

    // --- 2. จัดการเรื่องอัปโหลดสลิป ---
    
    // ทำให้ปุ่ม "อัปโหลดสลิป" ไปกด <input type="file">
    uploadButton.addEventListener("click", function() {
        slipUpload.click();
    });

    // (รวม 2 ฟังก์ชัน change ของคุณไว้ในที่เดียว)
    // เมื่อผู้ใช้เลือกไฟล์...
    slipUpload.addEventListener("change", function() {
        if (this.files.length > 0) {
            // 1. แสดงชื่อไฟล์
            fileNameDisplay.textContent = this.files[0].name;
            
            // 2. เปิดใช้งานปุ่ม Success
            btnSuccess.disabled = false;
            btnSuccess.style.cursor = "pointer";
            btnSuccess.style.color = "#f9fafb";
        } else {
            fileNameDisplay.textContent = "ยังไม่ได้เลือกไฟล์";
            btnSuccess.disabled = true;
            btnSuccess.style.cursor = "not-allowed";
        }
    });

    // --- 3. แสดงยอดที่ต้องชำระ ---
    const totalString = sessionStorage.getItem('finalPaymentTotal');

    if (totalString) {
        const total = parseFloat(totalString);
        const formattedTotal = total.toLocaleString('th-TH', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
        });
        displayElement.textContent = `ยอดที่ต้องชำระ: ${formattedTotal} Baht`;
        displayElement.style.color = 'black';
    } else {
        displayElement.textContent = 'ไม่พบยอดชำระ';
        displayElement.style.color = 'red';
    }

    // --- 4. จัดการการกดปุ่ม "Success" ---
    
    // (*** แก้ไขชื่อตัวแปรตรงนี้ ***)
    btnSuccess.addEventListener('click', async function() {
    const bookingDetails = JSON.parse(localStorage.getItem('currentBooking'));
    const slipFile = slipUpload.files[0];

    if (!slipFile) {
        alert('กรุณาอัปโหลดสลิปก่อนครับ');
        return;
    }
    if (!bookingDetails || !bookingDetails.packageId) {
        alert('เกิดข้อผิดพลาด: ไม่พบข้อมูลการจอง หรือ Package ID ไม่ถูกต้อง');
        console.error('currentBooking:', localStorage.getItem('currentBooking'));
        return;
    }

    console.log('Booking details before submit:', bookingDetails);
    console.log('Slip file:', slipFile);

    const formData = new FormData();
    formData.append('paymentSlip', slipFile);
    formData.append('packageId', bookingDetails.packageId); 
    formData.append('quantity', bookingDetails.quantity);
    formData.append('totalPrice', bookingDetails.totalPrice);
    formData.append('discountCode', bookingDetails.discountCode || null);

    try {
        const response = await fetch('../../backend/submit-booking.php', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            let errorData = {};
            try {
                errorData = await response.json();
            } catch(e) {
                console.error('Failed to parse JSON from server:', e);
            }
            throw new Error(errorData.message || 'Server error');
        }

        localStorage.removeItem('currentBooking');
        window.location.href = '../../frontend/Public/user_dash/userdashboard.html';

    } catch (error) {
        console.error('Error submitting booking:', error);
        alert('เกิดข้อผิดพลาด: ' + error.message);
    }
});
});