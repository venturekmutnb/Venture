function deleteUser(id) {
  if (confirm("คุณต้องการลบ User นี้จริงหรือไม่?")) {
    fetch(`../../../backend/adminsystem/deleteuser.php?id=${id}`, { method: "GET" })
      .then(res => res.text())
      .then(msg => {
        if (msg === "success") {
          alert("ลบผู้ใช้เรียบร้อยแล้ว");
          loadUsers();
        } else {
          alert("เกิดข้อผิดพลาดในการลบ");
        }
      });
  }
}