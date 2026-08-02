/**
 * Al-Aqsa Medical City - Invoices & Billing Module
 * إدارة الفواتير، المدفوعات، وطباعة الإيصالات
 */

async function initInvoicesModule() {
    const container = document.getElementById('router-view');
    if (!container) return;

    // 1. بناء واجهة المستخدم
    container.innerHTML = `
        <div class="page-header">
            <h1 data-label="invoices">الفواتير والمالية</h1>
        </div>
        <div class="actions-bar">
            <button class="btn-primary" id="btn-add-invoice" data-label="create_invoice">إنشاء فاتورة جديدة</button>
            <input type="text" id="search-invoice" placeholder="بحث برقم الفاتورة أو اسم المريض...">
        </div>
        <table class="data-table">
            <thead>
                <tr>
                    <th>رقم الفاتورة</th>
                    <th>اسم المريض</th>
                    <th>الإجمالي</th>
                    <th>المدفوع</th>
                    <th>المتبقي</th>
                    <th>التاريخ</th>
                    <th>الإجراءات</th>
                </tr>
            </thead>
            <tbody id="invoices-table-body"></tbody>
        </table>

        <!-- نافذة إنشاء/تعديل فاتورة -->
        <div id="invoice-modal" class="modal" style="display: none;">
            <div class="modal-content" style="max-width: 700px;">
                <span class="close-btn" id="close-invoice-modal">&times;</span>
                <h2 id="invoice-modal-title">إنشاء فاتورة جديدة</h2>
                <form id="invoice-form" class="form-grid">
                    <input type="hidden" id="inv-id">
                    
                    <div class="form-control">
                        <label>المريض</label>
                        <select id="inv-patient" required></select>
                    </div>
                    
                    <div class="form-control">
                        <label>تاريخ الفاتورة</label>
                        <input type="date" id="inv-date" required>
                    </div>

                    <!-- قسم الخدمات الديناميكي -->
                    <div class="form-control" style="grid-column: 1 / -1; background: var(--bg-color); padding: 15px; border-radius: 8px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <label style="margin: 0; font-size: 16px; color: var(--primary-color);">الخدمات المقدمة</label>
                            <button type="button" id="btn-add-item" class="btn-sm btn-edit">+ إضافة خدمة</button>
                        </div>
                        <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
                            <thead>
                                <tr style="border-bottom: 2px solid #ccc;">
                                    <th style="text-align: right; padding: 5px;">وصف الخدمة / العلاج</th>
                                    <th style="text-align: right; padding: 5px; width: 120px;">السعر ($)</th>
                                    <th style="width: 50px;"></th>
                                </tr>
                            </thead>
                            <tbody id="invoice-items-body">
                                <!-- سيتم إضافة الحقول هنا ديناميكياً -->
                            </tbody>
                        </table>
                    </div>

                    <!-- الحسابات -->
                    <div class="form-control">
                        <label>الإجمالي</label>
                        <input type="number" id="inv-total" readonly style="background: #e9ecef; font-weight: bold;">
                    </div>
                    <div class="form-control">
                        <label>المدفوع</label>
                        <input type="number" id="inv-paid" required min="0" value="0">
                    </div>
                    <div class="form-control">
                        <label>المتبقي</label>
                        <input type="number" id="inv-remaining" readonly style="background: #e9ecef; color: #dc3545; font-weight: bold;">
                    </div>

                    <button type="submit" class="btn-primary" style="grid-column: 1 / -1; margin-top: 15px;">حفظ الفاتورة</button>
                </form>
            </div>
        </div>
    `;

    // تطبيق المسميات الديناميكية
    labelManager.applyLabels(container);

    const tbody = document.getElementById('invoices-table-body');
    const modal = document.getElementById('invoice-modal');
    const form = document.getElementById('invoice-form');
    const patientSelect = document.getElementById('inv-patient');
    const itemsBody = document.getElementById('invoice-items-body');

    let invoicesList = [];
    let patientsList = [];

    // ==========================================
    // 2. الدوال المساعدة والعمليات الحسابية
    // ==========================================

    async function populatePatients() {
        patientsList = await dbService.getAll('Patients') || [];
        patientSelect.innerHTML = '<option value="" disabled selected>-- اختر المريض --</option>';
        patientsList.forEach(p => {
            patientSelect.innerHTML += `<option value="${p.id}">${p.name} (رقم: ${p.medicalNumber})</option>`;
        });
    }

    // دالة حساب الإجمالي والمتبقي
    function calculateTotals() {
        let total = 0;
        // جمع أسعار جميع الخدمات
        const priceInputs = itemsBody.querySelectorAll('.item-price');
        priceInputs.forEach(input => {
            total += parseFloat(input.value) || 0;
        });

        const paid = parseFloat(document.getElementById('inv-paid').value) || 0;
        const remaining = total - paid;

        document.getElementById('inv-total').value = total.toFixed(2);
        document.getElementById('inv-remaining').value = remaining.toFixed(2);
    }

    // دالة إضافة سطر خدمة جديد في الفاتورة
    function addInvoiceItemRow(desc = '', price = '') {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="padding: 5px;">
                <input type="text" class="item-desc" placeholder="اسم الخدمة..." value="${desc}" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;" required>
            </td>
            <td style="padding: 5px;">
                <input type="number" class="item-price" placeholder="0.00" value="${price}" min="0" step="0.01" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;" required>
            </td>
            <td style="padding: 5px; text-align: center;">
                <button type="button" class="btn-sm btn-delete btn-remove-item">X</button>
            </td>
        `;
        
        // ربط حدث التغيير للحساب التلقائي
        tr.querySelector('.item-price').addEventListener('input', calculateTotals);
        
        // ربط حدث الحذف للسطر
        tr.querySelector('.btn-remove-item').addEventListener('click', function() {
            tr.remove();
            calculateTotals();
        });

        itemsBody.appendChild(tr);
    }

    // ==========================================
    // 3. جلب وعرض البيانات (CRUD)
    // ==========================================

    async function loadInvoices(search = '') {
        invoicesList = await dbService.getAll('Invoices') || [];
        tbody.innerHTML = '';
        
        const filtered = invoicesList.filter(inv => {
            const patient = patientsList.find(p => p.id === parseInt(inv.patientId));
            const pName = patient ? patient.name.toLowerCase() : '';
            return inv.id.toString().includes(search) || pName.includes(search.toLowerCase());
        });

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;">لا توجد فواتير</td></tr>`;
            return;
        }

        filtered.forEach(inv => {
            const patient = patientsList.find(p => p.id === parseInt(inv.patientId));
            const patientName = patient ? patient.name : 'مريض محذوف';

            // تلوين المتبقي باللون الأحمر إذا كان هناك ديون
            const remainingHtml = inv.remaining > 0 
                ? `<span style="color: red; font-weight: bold;">${inv.remaining}</span>` 
                : `<span style="color: green;">سددت</span>`;

            tbody.innerHTML += `
                <tr>
                    <td>#INV-${inv.id}</td>
                    <td>${patientName}</td>
                    <td>${inv.total}</td>
                    <td>${inv.paid}</td>
                    <td>${remainingHtml}</td>
                    <td>${inv.date}</td>
                    <td>
                        <button class="btn-sm btn-edit btn-print" data-id="${inv.id}">طباعة</button>
                        <button class="btn-sm btn-delete" data-id="${inv.id}">حذف</button>
                    </td>
                </tr>
            `;
        });
    }

    await populatePatients();
    await loadInvoices();

    // ==========================================
    // 4. الأحداث (Events)
    // ==========================================

    document.getElementById('btn-add-invoice').addEventListener('click', () => {
        if(patientsList.length === 0) {
            alert("لا يوجد مرضى مسجلين في النظام. الرجاء إضافة مريض أولاً.");
            return;
        }
        form.reset();
        document.getElementById('inv-id').value = '';
        itemsBody.innerHTML = ''; // مسح الخدمات السابقة
        addInvoiceItemRow(); // إضافة سطر فارغ افتراضي
        document.getElementById('inv-date').valueAsDate = new Date();
        document.getElementById('invoice-modal-title').textContent = 'إنشاء فاتورة جديدة';
        modal.style.display = 'flex';
    });

    document.getElementById('close-invoice-modal').addEventListener('click', () => modal.style.display = 'none');
    document.getElementById('search-invoice').addEventListener('input', (e) => loadInvoices(e.target.value));
    
    // زر إضافة خدمة
    document.getElementById('btn-add-item').addEventListener('click', () => addInvoiceItemRow());
    
    // تحديث الإجمالي عند تغيير المبلغ المدفوع
    document.getElementById('inv-paid').addEventListener('input', calculateTotals);

    // حفظ الفاتورة
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // تجميع الخدمات في مصفوفة
        const items = [];
        const rows = itemsBody.querySelectorAll('tr');
        rows.forEach(row => {
            const desc = row.querySelector('.item-desc').value;
            const price = parseFloat(row.querySelector('.item-price').value);
            if (desc && price >= 0) {
                items.push({ desc, price });
            }
        });

        if(items.length === 0) {
            alert("يجب إضافة خدمة واحدة على الأقل للفاتورة.");
            return;
        }

        const id = document.getElementById('inv-id').value;
        const invoiceData = {
            patientId: document.getElementById('inv-patient').value,
            date: document.getElementById('inv-date').value,
            items: items,
            total: document.getElementById('inv-total').value,
            paid: document.getElementById('inv-paid').value,
            remaining: document.getElementById('inv-remaining').value
        };

        if (id) invoiceData.id = parseInt(id);

        await dbService.save('Invoices', invoiceData);
        modal.style.display = 'none';
        await loadInvoices();
    });

    // أحداث الجدول (الطباعة والحذف)
    tbody.addEventListener('click', async (e) => {
        const id = parseInt(e.target.getAttribute('data-id'));
        
        if (e.target.classList.contains('btn-delete')) {
            if (confirm('هل أنت متأكد من حذف هذه الفاتورة؟')) {
                await dbService.delete('Invoices', id);
                await loadInvoices();
            }
        } 
        else if (e.target.classList.contains('btn-print')) {
            printInvoice(id);
        }
    });

    // ==========================================
    // 5. نظام الطباعة الاحترافي
    // ==========================================
    async function printInvoice(invoiceId) {
        const invoice = invoicesList.find(i => i.id === invoiceId);
        if (!invoice) return;
        
        const patient = patientsList.find(p => p.id === parseInt(invoice.patientId));
        const hospitalName = labelManager.cache['medical_city_name'] || 'مدينة الأقصى الطبية';
        
        // بناء صفحة HTML للطباعة
        let itemsHtml = '';
        invoice.items.forEach((item, index) => {
            itemsHtml += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${item.desc}</td>
                    <td>${item.price} $</td>
                </tr>
            `;
        });

        const printContent = `
            <!DOCTYPE html>
            <html lang="ar" dir="rtl">
            <head>
                <meta charset="UTF-8">
                <title>فاتورة رقم #${invoice.id}</title>
                <style>
                    body { font-family: Tahoma, Arial, sans-serif; padding: 20px; color: #333; }
                    .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
                    .header h1 { margin: 0; color: #0056b3; }
                    .info-box { display: flex; justify-content: space-between; margin-bottom: 20px; }
                    .info-box div { border: 1px solid #ccc; padding: 10px; width: 45%; border-radius: 5px; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    th, td { border: 1px solid #ccc; padding: 10px; text-align: right; }
                    th { background-color: #f4f7f6; }
                    .totals { width: 300px; margin-right: auto; border: 1px solid #ccc; border-radius: 5px; padding: 10px; }
                    .totals div { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px dashed #ccc; }
                    .totals div:last-child { border: none; font-weight: bold; font-size: 1.2em; }
                    .footer { text-align: center; margin-top: 50px; font-size: 0.9em; color: #666; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>${hospitalName}</h1>
                    <p>إيصال مالي رسمي</p>
                </div>
                
                <div class="info-box">
                    <div>
                        <strong>بيانات المريض:</strong><br>
                        الاسم: ${patient ? patient.name : 'غير معروف'}<br>
                        الرقم الطبي: ${patient ? patient.medicalNumber : 'N/A'}
                    </div>
                    <div>
                        <strong>بيانات الفاتورة:</strong><br>
                        رقم الفاتورة: #${invoice.id}<br>
                        تاريخ الإصدار: ${invoice.date}
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th style="width: 50px;">#</th>
                            <th>الخدمة / العلاج</th>
                            <th style="width: 150px;">السعر</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>

                <div class="totals">
                    <div><span>الإجمالي:</span> <span>${invoice.total} $</span></div>
                    <div><span>المدفوع:</span> <span>${invoice.paid} $</span></div>
                    <div><span>المتبقي:</span> <span>${invoice.remaining} $</span></div>
                </div>

                <div class="footer">
                    <p>نشكر لكم ثقتكم في ${hospitalName}. مع تمنياتنا لكم بالشفاء العاجل.</p>
                </div>
                <script>
                    window.onload = function() { window.print(); }
                </script>
            </body>
            </html>
        `;

        // فتح نافذة جديدة وطباعة الفاتورة
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        printWindow.document.open();
        printWindow.document.write(printContent);
        printWindow.document.close();
    }
}
