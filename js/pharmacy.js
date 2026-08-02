const pharmacyModule = {
    async render() {
        const container = document.getElementById('router-view');
        if (!container) return;

        container.innerHTML = `
            <div class="page-header" style="display: flex; justify-content: space-between; align-items: center; padding: 20px;">
                <h2 style="color: var(--primary-color);">الصيدلية والمخزون الدوائي</h2>
                <div style="display: flex; gap: 10px;">
                    <button class="btn-secondary" style="background: #10b981; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer;">صرف دواء</button>
                    <button class="btn-primary" onclick="alert('نافذة إضافة دواء قيد الإنشاء')">إضافة صنف جديد</button>
                </div>
            </div>
            
            <div class="card" style="padding: 20px; overflow-x: auto;">
                <table class="data-table" style="width: 100%; border-collapse: collapse; text-align: right; background: white;">
                    <thead style="background-color: var(--border-color);">
                        <tr>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">الكود (Barcode)</th>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">اسم الدواء</th>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">التصنيف</th>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">الكمية المتوفرة</th>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">السعر</th>
                            <th style="padding: 12px; border-bottom: 2px solid #ccc;">تاريخ الانتهاء</th>
                        </tr>
                    </thead>
                    <tbody id="pharmacy-tbody">
                        <tr><td colspan="6" style="text-align: center; padding: 20px;">جاري تحميل بيانات الأدوية...</td></tr>
                    </tbody>
                </table>
            </div>
        `;

        await this.loadData();
    },

    async loadData() {
        try {
            const tbody = document.getElementById('pharmacy-tbody');
            const rawData = await dbService.getAll('Medicines'); 
            
            if (!rawData || rawData.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">المخزون الدوائي فارغ حالياً</td></tr>';
                return;
            }

            tbody.innerHTML = ''; 

            rawData.forEach((item) => {
                const tr = document.createElement('tr');
                // تغيير لون الكمية إذا كانت منخفضة
                const stockColor = (item.stock > 10) ? 'color: #10b981;' : 'color: #ef4444; font-weight: bold;';
                
                tr.innerHTML = `
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.barcode || "-"}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;"><strong>${item.name || "-"}</strong></td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.category || "-"}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee; ${stockColor}">${item.stock || "0"}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.price || "0"}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.expiryDate || "-"}</td>
                `;
                tbody.appendChild(tr);
            });
        } catch (error) {
            console.error("خطأ في تحميل الصيدلية:", error);
        }
    }
};

window.pharmacyModule = pharmacyModule;
