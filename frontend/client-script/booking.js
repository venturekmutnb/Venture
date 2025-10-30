let pricePerPerson = 0;

async function loadPackage() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('package_id');

    if (!id) {
        console.warn("No package ID provided in URL.");
        return;
    }

    try {
        const res = await fetch(`../../backend/getPackageById.php?package_id=${encodeURIComponent(id)}`);
        if (!res.ok) throw new Error("Network error");
        const data = await res.json();
        if (data.error) throw new Error(data.error);

        document.getElementById("pkgName").innerText = data.title || "Unknown Package";
        document.getElementById("pkgDesc").innerText = data.destination || "";
        document.getElementById("pkgPrice").innerText = Number(data.price || 0).toLocaleString();

        pricePerPerson = Number(data.price) || 0;
        document.getElementById("perPerson").innerText = pricePerPerson.toLocaleString();

        updateSummary();
    } catch (err) {
        console.error("Fetch failed:", err);
    }
}

function showTravelerForms(qty) {
    for (let i = 1; i <= 10; i++) {
        const form = document.getElementById(`traveler${i}`);
        if (form) {
            const inputs = form.querySelectorAll("input, select");

            if (i <= qty) {
                form.style.display = "block";

                inputs.forEach(input => input.required = true);
            } else {
                form.style.display = "none";

                inputs.forEach(input => input.required = false);
            }
        }
    }
}

function changeQty(num) {
    let qty = parseInt(document.getElementById('qty').value) || 1;
    qty += num;
    if (qty < 1) qty = 1;
    if (qty > 10) qty = 10;

    document.getElementById('qty').value = qty;
    document.getElementById('showQty').innerText = qty;

    showTravelerForms(qty);
    updateSummary();
}

function updateSummary() {
    const qty = parseInt(document.getElementById('qty').value) || 1;
    const total = qty * (pricePerPerson || 0);
    document.getElementById('total').innerText = total.toLocaleString() + " Baht";
    const pkgName = document.getElementById("pkgName").innerText;
    const pkgDetail = document.getElementById("pkgDesc").innerText;
    localStorage.setItem("currentBooking", JSON.stringify({
        qty,
        pricePerPerson,
        total,
        pkgName: pkgName,     
        pkgDetail: pkgDetail 
    }));

    const params = new URLSearchParams(window.location.search);
    const id = params.get('package_id');
    document.getElementById("nextLink").href =
      `../Public/sumBooking.html?package_id=${encodeURIComponent(id)}&travelers=${qty}`;
}

window.onload = function() {
    showTravelerForms(1);
    loadPackage();
};