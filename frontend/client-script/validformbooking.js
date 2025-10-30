document.addEventListener("DOMContentLoaded", function() {
    const nextLink = document.getElementById("nextLink");

    if (!nextLink) return;

    nextLink.addEventListener("click", function(e) {
        e.preventDefault();

        const forms = document.querySelectorAll(".travelerForm:not([style*='display: none'])");
        let ok = true;

        forms.forEach(f => {
            if (!f.checkValidity()) {
                f.reportValidity();
                ok = false;
            }
        });

        if (!ok) return; 

        const hrefAttr = nextLink.getAttribute('href');
        if (hrefAttr && hrefAttr !== '#' && hrefAttr.trim() !== '') {
            window.location.href = hrefAttr;
            return;
        }

        if (nextLink.href && nextLink.href !== window.location.href) {
            window.location.href = nextLink.href;
            return;
        }

        const fallback = nextLink.dataset.target || localStorage.getItem('nextBookingHref') || '../Public/sumBooking.html';
        window.location.href = fallback;
    });
});