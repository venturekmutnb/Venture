document.addEventListener('DOMContentLoaded', async () => {
    const filterType = document.getElementById('filterType');
    const filterYear = document.getElementById('filterYear');
    const revenueTableBody = document.querySelector('#revenueTable tbody');
    const ctx = document.getElementById('revenueChart').getContext('2d');
    let revenueChart;

    // ===== 1. เติมปีให้เลือก =====
    const currentYear = new Date().getFullYear();
    for (let y = currentYear; y >= currentYear - 10; y--) {
        const option = document.createElement('option');
        option.value = y;
        option.textContent = y;
        filterYear.appendChild(option);
    }
    filterYear.value = currentYear;

    // ===== 2. ฟังก์ชันโหลดรายงาน =====
    async function loadReport() {
        const type = filterType.value;
        const year = filterYear.value;

        try {
            const res = await fetch(`../../../backend/adminsystem/getRevenueReport.php?type=${type}&year=${year}`);
            if (!res.ok) throw new Error('Cannot fetch report');

            const data = await res.json(); // คาดว่า data เป็น array: [{ period: 'ม.ค.', total: 20000 }, ...]

            // ===== 3. อัปเดตกราฟ =====
            const labels = data.map(d => d.period);
            const totals = data.map(d => d.total);

            if (revenueChart) revenueChart.destroy(); // ล้างกราฟเก่า

            revenueChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels,
                    datasets: [{
                        label: 'รายได้รวม (บาท)',
                        data: totals,
                        backgroundColor: '#007bff'
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: false },
                        tooltip: { mode: 'index', intersect: false }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });

            // ===== 4. อัปเดตตาราง =====
            revenueTableBody.innerHTML = '';
            data.forEach(row => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${row.period}</td>
                    <td>${row.total.toLocaleString('th-TH')}</td>
                `;
                revenueTableBody.appendChild(tr);
            });

        } catch (err) {
            console.error(err);
            revenueTableBody.innerHTML = '<tr><td colspan="2">เกิดข้อผิดพลาดในการโหลดรายงาน</td></tr>';
        }
    }

    // ===== 5. เรียกครั้งแรก =====
    await loadReport();

    // ===== 6. Event listener =====
    filterType.addEventListener('change', loadReport);
    filterYear.addEventListener('change', loadReport);
});
