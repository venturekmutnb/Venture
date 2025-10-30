function updateNavbar(username, role) {
    const signinLink = document.getElementById('signin-link');
    const profileLink = document.getElementById('profile-link');
    const usernameDisplay = document.getElementById('username-display');
    const adminDashboard = document.getElementById('admin-dashboard');
    const userDashboard = document.getElementById('user-dashboard');

    if (!signinLink || !profileLink || !usernameDisplay) return;

    if (username) {
        signinLink.classList.add('hidden');
        signinLink.classList.remove('visible');

        profileLink.classList.remove('hidden');
        profileLink.classList.add('visible');

        usernameDisplay.textContent = username;

        // แสดง dashboard ตาม role
        if (role === 'admin') {
            adminDashboard.classList.remove('hidden');
        } else {
            adminDashboard.classList.add('hidden');
        }
    } else {
        signinLink.classList.remove('hidden');
        signinLink.classList.add('visible');

        profileLink.classList.remove('visible');
        profileLink.classList.add('hidden');
        usernameDisplay.textContent = '';
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const profileLink = document.getElementById('profile-link');
    const toggle = profileLink.querySelector('.dropdown-toggle');

    toggle.addEventListener('click', () => {
        profileLink.classList.toggle('open');
    });


    document.getElementById('logout-btn').addEventListener('click', function(e) {
        e.preventDefault();
        fetch('../../backend/logout.php')
            .then(res => res.text())
            .then(data => {
                if (data.trim() === "logout_success") {
                    updateNavbar(null);
                }
            });
    });

   
    fetch('../../backend/CheckSes.php')
        .then(res => res.json())
        .then(data => {
            if (data.username) {
                updateNavbar(data.username, data.role);
            }
        });
});
