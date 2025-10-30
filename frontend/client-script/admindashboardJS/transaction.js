document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('transactionsContainer');

    if (!container) {
        console.error('ไม่พบ container');
        return;
    }

    async function loadTransactions() {
        try {
            // --- 1. โหลด transactions แยกตาม package ---
            const res = await fetch('../../../backend/adminsystem/getAllTransactions.php');
            if (!res.ok) throw new Error('Cannot fetch transactions');
            const transactions = await res.json();

            const grouped = {};
            transactions.forEach(tx => {
                if (!grouped[tx.package_name]) grouped[tx.package_name] = [];
                grouped[tx.package_name].push(tx);
            });

            container.innerHTML = '';

            for (const [packageName, txs] of Object.entries(grouped)) {
                const tableWrapper = document.createElement('div');
                tableWrapper.className = 'packageTableWrapper';

                tableWrapper.innerHTML = `
                    <h3>Package: ${packageName}</h3>
                    <table class="transactionTable">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>User</th>
                                <th>Quantity</th>
                                <th>Total Price</th>
                                <th>Status</th>
                                <th>Slip</th>
                                <th>Change Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${txs.map(tx => `
                                <tr data-id="${tx.trans_id || ''}">
                                    <td>${tx.trans_id || '-'}</td>
                                    <td>${tx.username || '-'}</td>
                                    <td>${tx.quantity || '-'}</td>
                                    <td>${tx.total_price ? tx.total_price.toLocaleString('th-TH') + ' ฿' : '-'}</td>
                                    <td class="statusCell ${tx.status ? 'status-' + tx.status : ''}">${tx.status || 'No Transaction'}</td>
                                    <td>
                                        ${tx.slip_image ? `<a href="../../../backend/${tx.slip_image}" target="_blank">View Slip</a>` : '-' }
                                    </td>
                                    <td>
                                        ${tx.trans_id ? `<select class="statusSelect">
                                            <option value="pending" ${tx.status === 'pending' ? 'selected' : ''}>pending</option>
                                            <option value="paid" ${tx.status === 'paid' ? 'selected' : ''}>paid</option>
                                            <option value="completed" ${tx.status === 'completed' ? 'selected' : ''}>completed</option>
                                            <option value="cancelled" ${tx.status === 'cancelled' ? 'selected' : ''}>cancelled</option>
                                        </select>
                                        <button class="btnUpdate">Update</button>` : '-' }
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;

                container.appendChild(tableWrapper);
            }

            // --- 2. โหลด summary table ของแต่ละ package ---
            const summaryRes = await fetch('../../../backend/getPackageSummary.php');
            if (!summaryRes.ok) throw new Error('Cannot fetch package summary');
            const summaryJson = await summaryRes.json();
            const summaries = Array.isArray(summaryJson) ? summaryJson
                                : Array.isArray(summaryJson.data) ? summaryJson.data
                                : [];

            const summaryTable = document.createElement('div');
            summaryTable.className = 'packageSummaryWrapper';
            summaryTable.innerHTML = `
                <h3>Package Summary</h3>
                <table class="summaryTable">
                    <thead>
                        <tr>
                            <th>Package ID</th>
                            <th>Package Name</th>
                            <th>Total Bookings</th>
                            <th>Total Revenue</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${summaries.map(s => `
                            <tr>
                                <td>${s.package_id}</td>
                                <td>${s.title}</td>
                                <td>${s.total_bookings}</td>
                                <td>${s.total_revenue.toLocaleString('th-TH')} ฿</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
            container.prepend(summaryTable); // summary table ด้านบน

            // --- 3. โหลด top customers ---
            const topRes = await fetch('../../../backend/adminsystem/getTopCustomers.php');
            if (!topRes.ok) throw new Error('Cannot fetch top customers');
            const topJson = await topRes.json();
            const topCustomers = Array.isArray(topJson) ? topJson
                                 : Array.isArray(topJson.data) ? topJson.data
                                 : [];

            const topTable = document.createElement('div');
            topTable.className = 'topCustomersWrapper';
            topTable.innerHTML = `
                <h3>Top Customers (Completed Transactions)</h3>
                <table class="topCustomersTable">
                    <thead>
                        <tr>
                            <th>Customer ID</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Total Spent</th>
                            <th>Total Points</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${topCustomers.map(c => `
                            <tr>
                                <td>${c.acc_id}</td>
                                <td>${c.username}</td>
                                <td>${c.email}</td>
                                <td>${c.total_spent.toLocaleString('th-TH')} ฿</td>
                                <td>${c.total_points}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
            container.appendChild(topTable); // แสดงด้านล่าง

            // --- 4. เพิ่ม event listener ให้ปุ่ม Update ---
            document.querySelectorAll('.btnUpdate').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const row = e.target.closest('tr');
                    const transId = row.dataset.id;
                    const select = row.querySelector('.statusSelect');
                    const newStatus = select.value;

                    try {
                        const res = await fetch('../../../backend/adminsystem/updateTran.php', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ trans_id: transId, status: newStatus })
                        });

                        const data = await res.json();
                        if (data.success) {
                            row.querySelector('.statusCell').textContent = newStatus;
                            if (data.points_added > 0) {
                                alert(`Transaction updated! User received ${data.points_added} points.`);
                            } else {
                                alert('Transaction updated successfully.');
                            }
                        } else {
                            alert('Error: ' + data.message);
                        }
                    } catch (err) {
                        console.error(err);
                        alert('Failed to update status.');
                    }
                });
            });

        } catch (err) {
            console.error(err);
            container.innerHTML = '<p>Error loading transactions.</p>';
        }
    }

    await loadTransactions();
});
