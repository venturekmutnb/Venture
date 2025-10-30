let allUsers = []; 

async function loadUsers() {
  try {
    const res = await fetch("../../../backend/adminsystem/getuser.php");
    allUsers = await res.json();
    renderTable(allUsers);
  } catch (err) {
    console.error("Error loading users:", err);
  }
}

function renderTable(users) {
  const tbody = document.querySelector("#userTable tbody");
  tbody.innerHTML = "";

  if (users.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No users found</td></tr>`;
    return;
  }

  users.forEach(user => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${user.acc_id}</td>
      <td>${user.username}</td>
      <td>${user.email}</td>
      <td>${user.role}</td>
      <td>${user.created_at}</td>
      <td>
        <button class="edit-btn" onclick="editUser(${user.acc_id})">Edit</button>
        <button class="delete-btn" onclick="deleteUser(${user.acc_id})">Delete</button>
      </td>
    `;

    tbody.appendChild(row);
  });
}

function applyFilters() {
  const role = document.getElementById("roleFilter").value;
  const search = document.getElementById("searchInput").value.toLowerCase();
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;

  let filtered = allUsers;

  if (role !== "all") {
    filtered = filtered.filter(u => u.role === role);
  }

  if (search) {
    filtered = filtered.filter(u =>
      u.username.toLowerCase().includes(search) ||
      u.email.toLowerCase().includes(search)
    );
  }

  if (startDate) {
    filtered = filtered.filter(u => new Date(u.created_at) >= new Date(startDate));
  }
  if (endDate) {
    filtered = filtered.filter(u => new Date(u.created_at) <= new Date(endDate));
  }

  renderTable(filtered);
}

function editUser(id) {
  alert("Edit user ID: " + id);
}

function deleteUser(id) {
  if (confirm("คุณต้องการลบ User นี้จริงหรือไม่?")) {
    fetch(`../../../backend/adminsystem/deleteuser.php?id=${id}`, { method: "GET" })
      .then(() => loadUsers());
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadUsers();

  document.getElementById("roleFilter").addEventListener("change", applyFilters);
  document.getElementById("searchInput").addEventListener("input", applyFilters);
  document.getElementById("applyDateFilter").addEventListener("click", applyFilters);
});
