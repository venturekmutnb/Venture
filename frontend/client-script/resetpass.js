document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (!token) {
        alert("❌ ลิงก์ไม่ถูกต้อง");
        return;
    }

    // ใส่ค่า token ลง hidden input
    const hiddenInput = document.getElementById("token");
    hiddenInput.value = token;

    console.log("Token set in hidden input:", hiddenInput.value); // ตรวจสอบใน console

    const form = document.getElementById("resetPass");
    form.addEventListener("submit", function(event) {
        event.preventDefault();

        const password = document.getElementById("password").value.trim();
        const confirm  = document.getElementById("confirm").value.trim();

        if (!password || !confirm) {
            alert("❌ ข้อมูลไม่ครบ");
            return;
        }

        if (password !== confirm) {
            alert("❌ รหัสผ่านไม่ตรงกัน");
            return;
        }

        // ตรวจสอบค่า token ก่อนส่ง
        console.log("Sending token:", hiddenInput.value);

        fetch("../../backend/resetPassword.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `token=${encodeURIComponent(hiddenInput.value)}&password=${encodeURIComponent(password)}`
        })
        .then(res => res.text())
        .then(data => {
            alert(data);
            if (data.includes("✅")) {
                window.location.href = "../Public/signin.html";
            }
        })
        .catch(err => console.error("Error:", err));
    });
});
