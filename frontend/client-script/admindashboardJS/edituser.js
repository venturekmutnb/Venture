function editUser(id) {
  const user = allUsers.find(u => u.acc_id == id);
  if (!user) return;

  document.getElementById("edit_id").value = user.acc_id;
  document.getElementById("edit_username").value = user.username;
  document.getElementById("edit_email").value = user.email;
  document.getElementById("edit_role").value = user.role;

  document.getElementById("editModal").style.display = "block";
}

function closeModal() {
  document.getElementById("editModal").style.display = "none";
}

document.getElementById("editForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("edit_id").value;
  const username = document.getElementById("edit_username").value;
  const email = document.getElementById("edit_email").value;
  const role = document.getElementById("edit_role").value;

  const formData = new FormData();
  formData.append("id", id);
  formData.append("username", username);
  formData.append("email", email);
  formData.append("role", role);

  const res = await fetch("../../../backend/adminsystem/edituser.php", {
    method: "POST",
    body: formData
  });

  const msg = await res.text();
  if (msg === "success") {
    alert("อัปเดตข้อมูลเรียบร้อยแล้ว");
    closeModal();
    loadUsers();
  } else {
    alert("เกิดข้อผิดพลาดในการอัปเดต");
  }
});
