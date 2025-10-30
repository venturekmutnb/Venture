document.getElementById("forgotPass").addEventListener('submit', function(event) {
    event.preventDefault(); // ป้องกัน reload หน้า

    const email = document.getElementById("email").value.trim();

    if (!email) {
        alert("กรุณากรอกอีเมล");
        return;
    }

    fetch('../../backend/forgotpass.php', {
        method : 'POST',
        headers : {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body : `email=${encodeURIComponent(email)}`
    })
    .then(response => response.text())
    .then(data => {
        alert(data); 
    })
    .catch(error => {
        console.error('Error:', error);
        alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    });
});
