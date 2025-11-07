// Application State (for UI state management)
const appState = {
    currentPage: 'dashboard',
    currentReceiptItems: [],
    currentIssueItems: [],
    vehicleAlertHours: 8, // Cảnh báo nếu xe chưa ra sau 8 giờ
    // Data will now be loaded from API, not stored here
};

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    checkAuthentication();
    
    // Load user info
    loadUserInfo();
    
    initializeNavigation();
    initializeForms();
    loadSampleData();
    updateDashboard();
    
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    const receiptDateEl = document.getElementById('receiptDate');
    const issueDateEl = document.getElementById('issueDate');
    const reportDateFromEl = document.getElementById('reportDateFrom');
    const reportDateToEl = document.getElementById('reportDateTo');
    
    if (receiptDateEl) receiptDateEl.value = today;
    if (issueDateEl) issueDateEl.value = today;
    if (reportDateFromEl) reportDateFromEl.value = today;
    if (reportDateToEl) reportDateToEl.value = today;
});

// Authentication Check
function checkAuthentication() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
        // Redirect to login page if not authenticated
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Load User Info
function loadUserInfo() {
    const currentUser = sessionStorage.getItem('currentUser');
    const usernameEl = document.getElementById('headerUsername');
    if (usernameEl && currentUser) {
        usernameEl.textContent = currentUser;
    }
}

// Handle Logout
function handleLogout() {
    if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
        // Clear session storage
        sessionStorage.removeItem('isLoggedIn');
        sessionStorage.removeItem('currentUser');
        sessionStorage.removeItem('userRole');
        sessionStorage.removeItem('loginTime');
        
        // Remove auth token
        if (window.API) {
            window.API.removeToken();
        }
        
        // Redirect to login page
        window.location.href = 'login.html';
    }
}

// Navigation Management
function initializeNavigation() {
    // Main menu items
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            if (this.classList.contains('has-submenu')) {
                e.preventDefault();
                this.classList.toggle('open');
            }
        });
    });

    // Submenu links
    const submenuLinks = document.querySelectorAll('.submenu a');
    submenuLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            if (page) {
                navigateToPage(page);
            }
        });
    });

    // Dashboard link
    const dashboardLink = document.querySelector('[data-module="dashboard"] a');
    if (dashboardLink) {
        dashboardLink.addEventListener('click', function(e) {
            e.preventDefault();
            navigateToPage('dashboard');
        });
    }
}

function navigateToPage(pageName) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });

    // Show target section
    const targetSection = document.getElementById(pageName);
    if (targetSection) {
        targetSection.classList.add('active');
        appState.currentPage = pageName;

        // Update navigation active state
        updateNavActiveState(pageName);

        // Load data for the page
        loadPageData(pageName);
    }
}

function updateNavActiveState(pageName) {
    // Remove active from all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    // Find and activate the corresponding nav item
    const submenuLink = document.querySelector(`[data-page="${pageName}"]`);
    if (submenuLink) {
        const parentNavItem = submenuLink.closest('.has-submenu');
        if (parentNavItem) {
            parentNavItem.classList.add('active', 'open');
        }
    } else if (pageName === 'dashboard') {
        const dashboardNav = document.querySelector('[data-module="dashboard"]');
        if (dashboardNav) {
            dashboardNav.classList.add('active');
        }
    }
}

// Form Initialization
function initializeForms() {
    // Product Form
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveProduct();
        });
    }

    // Location Form
    const locationForm = document.getElementById('locationForm');
    if (locationForm) {
        locationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveLocation();
        });
    }

    // Supplier Form
    const supplierForm = document.getElementById('supplierForm');
    if (supplierForm) {
        supplierForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveSupplier();
        });
    }

    // Customer Form
    const customerForm = document.getElementById('customerForm');
    if (customerForm) {
        customerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveCustomer();
        });
    }

    // Receipt Form
    const receiptForm = document.getElementById('receiptForm');
    if (receiptForm) {
        receiptForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveReceipt();
        });
    }

    // Issue Form
    const issueForm = document.getElementById('issueForm');
    if (issueForm) {
        issueForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveIssue();
        });
    }

    // User Form
    const userForm = document.getElementById('userForm');
    if (userForm) {
        userForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveUser();
        });
    }

    // Vehicle Form
    const vehicleForm = document.getElementById('vehicleForm');
    if (vehicleForm) {
        vehicleForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveVehicle();
        });
    }

    // Vehicle Log Form
    const vehicleLogForm = document.getElementById('vehicleLogForm');
    if (vehicleLogForm) {
        vehicleLogForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveVehicleLog();
        });
    }

    // Vehicle Report Period Change
    const vehicleReportPeriod = document.getElementById('vehicleReportPeriod');
    if (vehicleReportPeriod) {
        vehicleReportPeriod.addEventListener('change', function() {
            const customRange = document.getElementById('vehicleCustomDateRange');
            if (this.value === 'custom') {
                customRange.style.display = 'flex';
            } else {
                customRange.style.display = 'none';
            }
        });
    }

    // Product search
    const productSearch = document.getElementById('productSearch');
    if (productSearch) {
        productSearch.addEventListener('input', function() {
            filterProducts();
        });
    }
}

// Modal Management
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        // Reset form
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
        }
    }
}

// Close modal when clicking outside
window.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// Product Management
async function openProductModal(id = null) {
    if (id) {
        // Edit mode - load from API
        try {
            const response = await window.API.products.getById(id);
            if (response.success) {
                const product = response.data;
            document.getElementById('productModalTitle').textContent = 'Sửa sản phẩm';
            document.getElementById('productSku').value = product.sku;
            document.getElementById('productName').value = product.name;
            document.getElementById('productDescription').value = product.description || '';
            document.getElementById('productUnit').value = product.unit;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productCategory').value = product.category || '';
            document.getElementById('productForm').dataset.editId = id;
            } else {
                alert('Không thể tải thông tin sản phẩm: ' + response.message);
                return;
            }
        } catch (error) {
            alert('Lỗi khi tải sản phẩm: ' + error.message);
            return;
        }
    } else {
        // Add mode
        document.getElementById('productModalTitle').textContent = 'Thêm sản phẩm';
        document.getElementById('productForm').dataset.editId = '';
    }
    openModal('productModal');
}

async function saveProduct() {
    const form = document.getElementById('productForm');
    const editId = form.dataset.editId;
    
    const product = {
        sku: document.getElementById('productSku').value,
        name: document.getElementById('productName').value,
        description: document.getElementById('productDescription').value,
        unit: document.getElementById('productUnit').value,
        price: parseFloat(document.getElementById('productPrice').value),
        category: document.getElementById('productCategory').value
    };

    try {
        let response;
    if (editId) {
            response = await window.API.products.update(editId, product);
    } else {
            response = await window.API.products.create(product);
    }

        if (response.success) {
    closeModal('productModal');
            await loadPageData('products');
            await updateDashboard();
        } else {
            alert('Lỗi: ' + response.message);
        }
    } catch (error) {
        alert('Lỗi khi lưu sản phẩm: ' + error.message);
    }
}

async function deleteProduct(id) {
    if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
        try {
            const response = await window.API.products.delete(id);
            if (response.success) {
                await loadPageData('products');
                await updateDashboard();
            } else {
                alert('Lỗi: ' + response.message);
            }
        } catch (error) {
            alert('Lỗi khi xóa sản phẩm: ' + error.message);
        }
    }
}

async function filterProducts() {
    const searchTerm = document.getElementById('productSearch').value;
    const filterValue = document.getElementById('productFilter').value;
    
    try {
        const response = await window.API.products.getAll(searchTerm, filterValue);
        if (response.success) {
            renderProductsTable(response.data);
        }
    } catch (error) {
        console.error('Error filtering products:', error);
    }
}

function renderProductsTable(products = []) {
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;

    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Không có dữ liệu</td></tr>';
        return;
    }

    tbody.innerHTML = products.map(product => `
        <tr>
            <td>${product.sku}</td>
            <td>${product.name}</td>
            <td>${product.unit}</td>
            <td>${formatCurrency(product.price)}</td>
            <td>${product.stock || 0}</td>
            <td>${product.category || '-'}</td>
            <td>
                <div class="table-action">
                    <button class="btn-edit" onclick="openProductModal('${product.id}')">Sửa</button>
                    <button class="btn-delete" onclick="deleteProduct('${product.id}')">Xóa</button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Location Management
function openLocationModal(id = null) {
    if (id) {
        const location = appState.locations.find(l => l.id === id);
        if (location) {
            document.getElementById('locationModalTitle').textContent = 'Sửa vị trí kho';
            document.getElementById('locationName').value = location.name;
            document.getElementById('locationCode').value = location.code;
            document.getElementById('locationCapacity').value = location.capacity || '';
            document.getElementById('locationForm').dataset.editId = id;
        }
    } else {
        document.getElementById('locationModalTitle').textContent = 'Thêm vị trí kho';
        document.getElementById('locationForm').dataset.editId = '';
    }
    openModal('locationModal');
}

function saveLocation() {
    const form = document.getElementById('locationForm');
    const editId = form.dataset.editId;
    
    const location = {
        id: editId || Date.now().toString(),
        name: document.getElementById('locationName').value,
        code: document.getElementById('locationCode').value,
        capacity: parseInt(document.getElementById('locationCapacity').value) || 0,
        used: editId ? appState.locations.find(l => l.id === editId)?.used || 0 : 0
    };

    if (editId) {
        const index = appState.locations.findIndex(l => l.id === editId);
        if (index !== -1) {
            appState.locations[index] = location;
        }
    } else {
        appState.locations.push(location);
    }

    closeModal('locationModal');
    loadPageData('locations');
    updateDashboard();
}

function deleteLocation(id) {
    if (confirm('Bạn có chắc chắn muốn xóa vị trí kho này?')) {
        appState.locations = appState.locations.filter(l => l.id !== id);
        loadPageData('locations');
        updateDashboard();
    }
}

function renderLocationsTable(locations = []) {
    const tbody = document.getElementById('locationsTableBody');
    if (!tbody) return;

    if (locations.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Không có dữ liệu</td></tr>';
        return;
    }

    tbody.innerHTML = locations.map(location => `
        <tr>
            <td>${location.name}</td>
            <td>${location.code}</td>
            <td>${location.capacity || 0}</td>
            <td>${location.used || 0}</td>
            <td>
                <div class="table-action">
                    <button class="btn-edit" onclick="openLocationModal('${location.id}')">Sửa</button>
                    <button class="btn-delete" onclick="deleteLocation('${location.id}')">Xóa</button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Supplier Management
function openSupplierModal(id = null) {
    if (id) {
        const supplier = appState.suppliers.find(s => s.id === id);
        if (supplier) {
            document.getElementById('supplierModalTitle').textContent = 'Sửa nhà cung cấp';
            document.getElementById('supplierName').value = supplier.name;
            document.getElementById('supplierTaxCode').value = supplier.taxCode || '';
            document.getElementById('supplierAddress').value = supplier.address || '';
            document.getElementById('supplierPhone').value = supplier.phone || '';
            document.getElementById('supplierEmail').value = supplier.email || '';
            document.getElementById('supplierForm').dataset.editId = id;
        }
    } else {
        document.getElementById('supplierModalTitle').textContent = 'Thêm nhà cung cấp';
        document.getElementById('supplierForm').dataset.editId = '';
    }
    openModal('supplierModal');
}

function saveSupplier() {
    const form = document.getElementById('supplierForm');
    const editId = form.dataset.editId;
    
    const supplier = {
        id: editId || Date.now().toString(),
        name: document.getElementById('supplierName').value,
        taxCode: document.getElementById('supplierTaxCode').value,
        address: document.getElementById('supplierAddress').value,
        phone: document.getElementById('supplierPhone').value,
        email: document.getElementById('supplierEmail').value
    };

    if (editId) {
        const index = appState.suppliers.findIndex(s => s.id === editId);
        if (index !== -1) {
            appState.suppliers[index] = supplier;
        }
    } else {
        appState.suppliers.push(supplier);
    }

    closeModal('supplierModal');
    loadPageData('suppliers');
}

function deleteSupplier(id) {
    if (confirm('Bạn có chắc chắn muốn xóa nhà cung cấp này?')) {
        appState.suppliers = appState.suppliers.filter(s => s.id !== id);
        loadPageData('suppliers');
    }
}

function renderSuppliersTable(suppliers = []) {
    const tbody = document.getElementById('suppliersTableBody');
    if (!tbody) return;

    if (suppliers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Không có dữ liệu</td></tr>';
        return;
    }

    tbody.innerHTML = suppliers.map(supplier => `
        <tr>
            <td>${supplier.name}</td>
            <td>${supplier.tax_code || '-'}</td>
            <td>${supplier.address || '-'}</td>
            <td>${supplier.phone || '-'} ${supplier.email ? `(${supplier.email})` : ''}</td>
            <td>
                <div class="table-action">
                    <button class="btn-edit" onclick="openSupplierModal('${supplier.id}')">Sửa</button>
                    <button class="btn-delete" onclick="deleteSupplier('${supplier.id}')">Xóa</button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Customer Management
function openCustomerModal(id = null) {
    if (id) {
        const customer = appState.customers.find(c => c.id === id);
        if (customer) {
            document.getElementById('customerModalTitle').textContent = 'Sửa khách hàng';
            document.getElementById('customerName').value = customer.name;
            document.getElementById('customerTaxCode').value = customer.taxCode || '';
            document.getElementById('customerAddress').value = customer.address || '';
            document.getElementById('customerPhone').value = customer.phone || '';
            document.getElementById('customerEmail').value = customer.email || '';
            document.getElementById('customerForm').dataset.editId = id;
        }
    } else {
        document.getElementById('customerModalTitle').textContent = 'Thêm khách hàng';
        document.getElementById('customerForm').dataset.editId = '';
    }
    openModal('customerModal');
}

function saveCustomer() {
    const form = document.getElementById('customerForm');
    const editId = form.dataset.editId;
    
    const customer = {
        id: editId || Date.now().toString(),
        name: document.getElementById('customerName').value,
        taxCode: document.getElementById('customerTaxCode').value,
        address: document.getElementById('customerAddress').value,
        phone: document.getElementById('customerPhone').value,
        email: document.getElementById('customerEmail').value
    };

    if (editId) {
        const index = appState.customers.findIndex(c => c.id === editId);
        if (index !== -1) {
            appState.customers[index] = customer;
        }
    } else {
        appState.customers.push(customer);
    }

    closeModal('customerModal');
    loadPageData('customers');
}

function deleteCustomer(id) {
    if (confirm('Bạn có chắc chắn muốn xóa khách hàng này?')) {
        appState.customers = appState.customers.filter(c => c.id !== id);
        loadPageData('customers');
    }
}

function renderCustomersTable(customers = []) {
    const tbody = document.getElementById('customersTableBody');
    if (!tbody) return;

    if (customers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Không có dữ liệu</td></tr>';
        return;
    }

    tbody.innerHTML = customers.map(customer => `
        <tr>
            <td>${customer.name}</td>
            <td>${customer.tax_code || '-'}</td>
            <td>${customer.address || '-'}</td>
            <td>${customer.phone || '-'} ${customer.email ? `(${customer.email})` : ''}</td>
            <td>
                <div class="table-action">
                    <button class="btn-edit" onclick="openCustomerModal('${customer.id}')">Sửa</button>
                    <button class="btn-delete" onclick="deleteCustomer('${customer.id}')">Xóa</button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Receipt Management
function openReceiptModal(id = null) {
    appState.currentReceiptItems = [];
    if (id) {
        // Edit mode - load receipt data
        const receipt = appState.receipts.find(r => r.id === id);
        if (receipt) {
            document.getElementById('receiptSupplier').value = receipt.supplierId;
            document.getElementById('receiptDate').value = receipt.date;
            document.getElementById('receiptNote').value = receipt.note || '';
            appState.currentReceiptItems = receipt.items || [];
            renderReceiptItems();
        }
    } else {
        // New receipt
        document.getElementById('receiptForm').dataset.editId = '';
        renderReceiptItems();
    }
    
    // Populate supplier dropdown
    const supplierSelect = document.getElementById('receiptSupplier');
    if (supplierSelect) {
        supplierSelect.innerHTML = '<option value="">Chọn nhà cung cấp</option>' +
            appState.suppliers.map(s => 
                `<option value="${s.id}">${s.name}</option>`
            ).join('');
    }
    
    openModal('receiptModal');
}

function addReceiptItem() {
    const item = {
        id: Date.now().toString(),
        productId: '',
        quantity: 0,
        locationId: '',
        price: 0,
        total: 0
    };
    appState.currentReceiptItems.push(item);
    renderReceiptItems();
}

function removeReceiptItem(itemId) {
    appState.currentReceiptItems = appState.currentReceiptItems.filter(item => item.id !== itemId);
    renderReceiptItems();
}

function updateReceiptItem(itemId, field, value) {
    const item = appState.currentReceiptItems.find(i => i.id === itemId);
    if (item) {
        item[field] = field === 'quantity' || field === 'price' ? parseFloat(value) || 0 : value;
        if (field === 'productId') {
            const product = appState.products.find(p => p.id === value);
            if (product) {
                item.price = product.price;
            }
        }
        item.total = item.quantity * item.price;
        renderReceiptItems();
    }
}

function renderReceiptItems() {
    const tbody = document.getElementById('receiptItemsBody');
    if (!tbody) return;

    tbody.innerHTML = appState.currentReceiptItems.map(item => `
        <tr>
            <td>
                <select onchange="updateReceiptItem('${item.id}', 'productId', this.value)">
                    <option value="">Chọn sản phẩm</option>
                    ${appState.products.map(p => 
                        `<option value="${p.id}" ${item.productId === p.id ? 'selected' : ''}>${p.name} (${p.sku})</option>`
                    ).join('')}
                </select>
            </td>
            <td>
                <input type="number" value="${item.quantity}" 
                    onchange="updateReceiptItem('${item.id}', 'quantity', this.value)" 
                    min="0" step="1" />
            </td>
            <td>
                <select onchange="updateReceiptItem('${item.id}', 'locationId', this.value)">
                    <option value="">Chọn vị trí</option>
                    ${appState.locations.map(l => 
                        `<option value="${l.id}" ${item.locationId === l.id ? 'selected' : ''}>${l.name} (${l.code})</option>`
                    ).join('')}
                </select>
            </td>
            <td>
                <input type="number" value="${item.price}" 
                    onchange="updateReceiptItem('${item.id}', 'price', this.value)" 
                    min="0" step="0.01" />
            </td>
            <td>${formatCurrency(item.total)}</td>
            <td>
                <button class="btn-delete" onclick="removeReceiptItem('${item.id}')">Xóa</button>
            </td>
        </tr>
    `).join('');

    // Update total
    const total = appState.currentReceiptItems.reduce((sum, item) => sum + item.total, 0);
    document.getElementById('receiptTotal').textContent = formatCurrency(total);
}

function saveReceipt() {
    if (appState.currentReceiptItems.length === 0) {
        alert('Vui lòng thêm ít nhất một sản phẩm');
        return;
    }

    const receipt = {
        id: Date.now().toString(),
        code: 'NH' + Date.now().toString().slice(-6),
        date: document.getElementById('receiptDate').value,
        supplierId: document.getElementById('receiptSupplier').value,
        supplierName: appState.suppliers.find(s => s.id === document.getElementById('receiptSupplier').value)?.name || '',
        note: document.getElementById('receiptNote').value,
        items: [...appState.currentReceiptItems],
        total: appState.currentReceiptItems.reduce((sum, item) => sum + item.total, 0),
        status: 'completed',
        createdAt: new Date().toISOString()
    };

    // Update product stock
    receipt.items.forEach(item => {
        const product = appState.products.find(p => p.id === item.productId);
        if (product) {
            product.stock = (product.stock || 0) + item.quantity;
        }
    });

    appState.receipts.push(receipt);
    closeModal('receiptModal');
    loadPageData('receipts');
    updateDashboard();
}

function saveReceiptDraft() {
    // Similar to saveReceipt but with status 'draft'
    const receipt = {
        id: Date.now().toString(),
        code: 'NH' + Date.now().toString().slice(-6),
        date: document.getElementById('receiptDate').value,
        supplierId: document.getElementById('receiptSupplier').value,
        supplierName: appState.suppliers.find(s => s.id === document.getElementById('receiptSupplier').value)?.name || '',
        note: document.getElementById('receiptNote').value,
        items: [...appState.currentReceiptItems],
        total: appState.currentReceiptItems.reduce((sum, item) => sum + item.total, 0),
        status: 'draft',
        createdAt: new Date().toISOString()
    };

    appState.receipts.push(receipt);
    closeModal('receiptModal');
    loadPageData('receipts');
    alert('Đã lưu nháp');
}

function renderReceiptsTable(receipts = []) {
    const tbody = document.getElementById('receiptsTableBody');
    if (!tbody) return;

    if (receipts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Không có dữ liệu</td></tr>';
        return;
    }

    tbody.innerHTML = receipts.map(receipt => `
        <tr>
            <td>${receipt.code}</td>
            <td>${formatDate(receipt.date)}</td>
            <td>${receipt.supplier_name || '-'}</td>
            <td><span class="status-badge status-${receipt.status}">${getStatusText(receipt.status)}</span></td>
            <td>${formatCurrency(receipt.total)}</td>
            <td>
                <div class="table-action">
                    <button class="btn-view" onclick="viewReceipt('${receipt.id}')">Xem</button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Issue Management (similar to Receipt)
function openIssueModal(id = null) {
    appState.currentIssueItems = [];
    if (id) {
        const issue = appState.issues.find(i => i.id === id);
        if (issue) {
            document.getElementById('issueCustomer').value = issue.customerId;
            document.getElementById('issueDate').value = issue.date;
            document.getElementById('issueNote').value = issue.note || '';
            appState.currentIssueItems = issue.items || [];
            renderIssueItems();
        }
    } else {
        renderIssueItems();
    }
    
    const customerSelect = document.getElementById('issueCustomer');
    if (customerSelect) {
        customerSelect.innerHTML = '<option value="">Chọn khách hàng</option>' +
            appState.customers.map(c => 
                `<option value="${c.id}">${c.name}</option>`
            ).join('');
    }
    
    openModal('issueModal');
}

function addIssueItem() {
    const item = {
        id: Date.now().toString(),
        productId: '',
        quantity: 0,
        locationId: '',
        price: 0,
        total: 0
    };
    appState.currentIssueItems.push(item);
    renderIssueItems();
}

function removeIssueItem(itemId) {
    appState.currentIssueItems = appState.currentIssueItems.filter(item => item.id !== itemId);
    renderIssueItems();
}

function updateIssueItem(itemId, field, value) {
    const item = appState.currentIssueItems.find(i => i.id === itemId);
    if (item) {
        item[field] = field === 'quantity' || field === 'price' ? parseFloat(value) || 0 : value;
        if (field === 'productId') {
            const product = appState.products.find(p => p.id === value);
            if (product) {
                item.price = product.price;
                // Check stock availability
                if (item.quantity > (product.stock || 0)) {
                    alert(`Số lượng tồn kho không đủ. Tồn kho hiện tại: ${product.stock || 0}`);
                }
            }
        }
        item.total = item.quantity * item.price;
        renderIssueItems();
    }
}

function renderIssueItems() {
    const tbody = document.getElementById('issueItemsBody');
    if (!tbody) return;

    tbody.innerHTML = appState.currentIssueItems.map(item => `
        <tr>
            <td>
                <select onchange="updateIssueItem('${item.id}', 'productId', this.value)">
                    <option value="">Chọn sản phẩm</option>
                    ${appState.products.map(p => 
                        `<option value="${p.id}" ${item.productId === p.id ? 'selected' : ''}>${p.name} (${p.sku})</option>`
                    ).join('')}
                </select>
            </td>
            <td>
                <input type="number" value="${item.quantity}" 
                    onchange="updateIssueItem('${item.id}', 'quantity', this.value)" 
                    min="0" step="1" />
            </td>
            <td>
                <select onchange="updateIssueItem('${item.id}', 'locationId', this.value)">
                    <option value="">Chọn vị trí</option>
                    ${appState.locations.map(l => 
                        `<option value="${l.id}" ${item.locationId === l.id ? 'selected' : ''}>${l.name} (${l.code})</option>`
                    ).join('')}
                </select>
            </td>
            <td>
                <input type="number" value="${item.price}" 
                    onchange="updateIssueItem('${item.id}', 'price', this.value)" 
                    min="0" step="0.01" />
            </td>
            <td>${formatCurrency(item.total)}</td>
            <td>
                <button class="btn-delete" onclick="removeIssueItem('${item.id}')">Xóa</button>
            </td>
        </tr>
    `).join('');

    const total = appState.currentIssueItems.reduce((sum, item) => sum + item.total, 0);
    document.getElementById('issueTotal').textContent = formatCurrency(total);
}

function saveIssue() {
    if (appState.currentIssueItems.length === 0) {
        alert('Vui lòng thêm ít nhất một sản phẩm');
        return;
    }

    // Check stock availability
    for (const item of appState.currentIssueItems) {
        const product = appState.products.find(p => p.id === item.productId);
        if (product && item.quantity > (product.stock || 0)) {
            alert(`Sản phẩm ${product.name} không đủ số lượng tồn kho. Tồn kho: ${product.stock || 0}`);
            return;
        }
    }

    const issue = {
        id: Date.now().toString(),
        code: 'XU' + Date.now().toString().slice(-6),
        date: document.getElementById('issueDate').value,
        customerId: document.getElementById('issueCustomer').value,
        customerName: appState.customers.find(c => c.id === document.getElementById('issueCustomer').value)?.name || '',
        note: document.getElementById('issueNote').value,
        items: [...appState.currentIssueItems],
        total: appState.currentIssueItems.reduce((sum, item) => sum + item.total, 0),
        status: 'completed',
        createdAt: new Date().toISOString()
    };

    // Update product stock
    issue.items.forEach(item => {
        const product = appState.products.find(p => p.id === item.productId);
        if (product) {
            product.stock = Math.max(0, (product.stock || 0) - item.quantity);
        }
    });

    appState.issues.push(issue);
    closeModal('issueModal');
    loadPageData('issues');
    updateDashboard();
}

function saveIssueDraft() {
    const issue = {
        id: Date.now().toString(),
        code: 'XU' + Date.now().toString().slice(-6),
        date: document.getElementById('issueDate').value,
        customerId: document.getElementById('issueCustomer').value,
        customerName: appState.customers.find(c => c.id === document.getElementById('issueCustomer').value)?.name || '',
        note: document.getElementById('issueNote').value,
        items: [...appState.currentIssueItems],
        total: appState.currentIssueItems.reduce((sum, item) => sum + item.total, 0),
        status: 'draft',
        createdAt: new Date().toISOString()
    };

    appState.issues.push(issue);
    closeModal('issueModal');
    loadPageData('issues');
    alert('Đã lưu nháp');
}

function renderIssuesTable(issues = []) {
    const tbody = document.getElementById('issuesTableBody');
    if (!tbody) return;

    if (issues.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Không có dữ liệu</td></tr>';
        return;
    }

    tbody.innerHTML = issues.map(issue => `
        <tr>
            <td>${issue.code}</td>
            <td>${formatDate(issue.date)}</td>
            <td>${issue.customer_name || '-'}</td>
            <td><span class="status-badge status-${issue.status}">${getStatusText(issue.status)}</span></td>
            <td>${formatCurrency(issue.total)}</td>
            <td>
                <div class="table-action">
                    <button class="btn-view" onclick="viewIssue('${issue.id}')">Xem</button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Stock Management
function renderStockTable() {
    const tbody = document.getElementById('stockTableBody');
    if (!tbody) return;

    // Aggregate stock by product and location
    const stockMap = {};
    
    // Initialize from products
    appState.products.forEach(product => {
        const key = `${product.id}_all`;
        if (!stockMap[key]) {
            stockMap[key] = {
                productId: product.id,
                productName: product.name,
                sku: product.sku,
                locationId: 'all',
                locationName: 'Tất cả kho',
                quantity: product.stock || 0,
                unit: product.unit,
                price: product.price,
                value: (product.stock || 0) * product.price
            };
        }
    });

    const stockData = Object.values(stockMap);
    
    tbody.innerHTML = stockData.map(stock => `
        <tr>
            <td>${stock.sku}</td>
            <td>${stock.productName}</td>
            <td>${stock.locationName}</td>
            <td>${stock.quantity}</td>
            <td>${stock.unit}</td>
            <td>${formatCurrency(stock.value)}</td>
        </tr>
    `).join('');
}

function applyStockFilter() {
    // Filter implementation
    renderStockTable();
}

// Transaction History
function renderHistoryTable() {
    const tbody = document.getElementById('historyTableBody');
    if (!tbody) return;

    const allTransactions = [];
    
    // Combine receipts and issues
    appState.receipts.forEach(receipt => {
        receipt.items.forEach(item => {
            const product = appState.products.find(p => p.id === item.productId);
            allTransactions.push({
                date: receipt.createdAt,
                type: 'receipt',
                code: receipt.code,
                productName: product?.name || '',
                quantity: item.quantity,
                user: 'Admin'
            });
        });
    });

    appState.issues.forEach(issue => {
        issue.items.forEach(item => {
            const product = appState.products.find(p => p.id === item.productId);
            allTransactions.push({
                date: issue.createdAt,
                type: 'issue',
                code: issue.code,
                productName: product?.name || '',
                quantity: item.quantity,
                user: 'Admin'
            });
        });
    });

    // Sort by date
    allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    tbody.innerHTML = allTransactions.map(trans => `
        <tr>
            <td>${formatDateTime(trans.date)}</td>
            <td>${trans.type === 'receipt' ? 'Nhập kho' : 'Xuất kho'}</td>
            <td>${trans.code}</td>
            <td>${trans.productName}</td>
            <td>${trans.quantity}</td>
            <td>${trans.user}</td>
        </tr>
    `).join('');
}

function applyHistoryFilter() {
    renderHistoryTable();
}

// Reports
function generateReport() {
    const fromDate = document.getElementById('reportDateFrom').value;
    const toDate = document.getElementById('reportDateTo').value;

    // Filter receipts and issues by date range
    const filteredReceipts = appState.receipts.filter(r => r.date >= fromDate && r.date <= toDate);
    const filteredIssues = appState.issues.filter(i => i.date >= fromDate && i.date <= toDate);

    renderReportTable(filteredReceipts, filteredIssues);
    // TODO: Render charts
}

function renderReportTable(receipts, issues) {
    const tbody = document.getElementById('reportTableBody');
    if (!tbody) return;

    // Group by date
    const dateMap = {};
    
    receipts.forEach(receipt => {
        if (!dateMap[receipt.date]) {
            dateMap[receipt.date] = { date: receipt.date, receiptQty: 0, receiptValue: 0, issueQty: 0, issueValue: 0 };
        }
        dateMap[receipt.date].receiptQty += receipt.items.reduce((sum, item) => sum + item.quantity, 0);
        dateMap[receipt.date].receiptValue += receipt.total;
    });

    issues.forEach(issue => {
        if (!dateMap[issue.date]) {
            dateMap[issue.date] = { date: issue.date, receiptQty: 0, receiptValue: 0, issueQty: 0, issueValue: 0 };
        }
        dateMap[issue.date].issueQty += issue.items.reduce((sum, item) => sum + item.quantity, 0);
        dateMap[issue.date].issueValue += issue.total;
    });

    const reportData = Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));

    tbody.innerHTML = reportData.map(row => `
        <tr>
            <td>${formatDate(row.date)}</td>
            <td>Nhập/Xuất</td>
            <td>${row.receiptQty}</td>
            <td>${row.issueQty}</td>
            <td>${formatCurrency(row.receiptValue)}</td>
            <td>${formatCurrency(row.issueValue)}</td>
        </tr>
    `).join('');
}

function exportExcel() {
    alert('Tính năng xuất Excel đang được phát triển');
}

function exportPDF() {
    alert('Tính năng xuất PDF đang được phát triển');
}

// User Management
function openUserModal(id = null) {
    if (id) {
        const user = appState.users.find(u => u.id === id);
        if (user) {
            document.getElementById('userModalTitle').textContent = 'Sửa người dùng';
            document.getElementById('userUsername').value = user.username;
            document.getElementById('userFullName').value = user.fullName;
            document.getElementById('userEmail').value = user.email;
            document.getElementById('userRole').value = user.role;
            document.getElementById('userForm').dataset.editId = id;
            document.getElementById('userPassword').required = false;
        }
    } else {
        document.getElementById('userModalTitle').textContent = 'Thêm người dùng';
        document.getElementById('userForm').dataset.editId = '';
        document.getElementById('userPassword').required = true;
    }
    openModal('userModal');
}

function saveUser() {
    const form = document.getElementById('userForm');
    const editId = form.dataset.editId;
    
    const user = {
        id: editId || Date.now().toString(),
        username: document.getElementById('userUsername').value,
        fullName: document.getElementById('userFullName').value,
        email: document.getElementById('userEmail').value,
        password: document.getElementById('userPassword').value || undefined,
        role: document.getElementById('userRole').value,
        status: editId ? appState.users.find(u => u.id === editId)?.status || 'active' : 'active'
    };

    if (editId) {
        const index = appState.users.findIndex(u => u.id === editId);
        if (index !== -1) {
            if (!user.password) {
                delete user.password;
            }
            appState.users[index] = { ...appState.users[index], ...user };
        }
    } else {
        appState.users.push(user);
    }

    closeModal('userModal');
    loadPageData('users');
}

function deleteUser(id) {
    if (confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
        appState.users = appState.users.filter(u => u.id !== id);
        loadPageData('users');
    }
}

function renderUsersTable() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;

    tbody.innerHTML = appState.users.map(user => `
        <tr>
            <td>${user.username}</td>
            <td>${user.fullName}</td>
            <td>${user.email}</td>
            <td>${getRoleText(user.role)}</td>
            <td><span class="status-badge status-${user.status}">${getStatusText(user.status)}</span></td>
            <td>
                <div class="table-action">
                    <button class="btn-edit" onclick="openUserModal('${user.id}')">Sửa</button>
                    <button class="btn-delete" onclick="deleteUser('${user.id}')">Xóa</button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Utility Functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
}

function formatDateTime(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN');
}

function getStatusText(status) {
    const statusMap = {
        'draft': 'Nháp',
        'completed': 'Hoàn thành',
        'pending': 'Đang chờ',
        'active': 'Hoạt động',
        'inactive': 'Không hoạt động'
    };
    return statusMap[status] || status;
}

function getRoleText(role) {
    const roleMap = {
        'admin': 'Admin',
        'warehouse': 'Thủ kho',
        'viewer': 'Xem báo cáo'
    };
    return roleMap[role] || role;
}

// Vehicle Management
function openVehicleModal(id = null) {
    if (id) {
        const vehicle = appState.vehicles.find(v => v.id === id);
        if (vehicle) {
            document.getElementById('vehicleModalTitle').textContent = 'Sửa thông tin xe';
            document.getElementById('vehiclePlate').value = vehicle.plate;
            document.getElementById('vehicleType').value = vehicle.type;
            document.getElementById('vehicleDriver').value = vehicle.driver;
            document.getElementById('vehicleDriverPhone').value = vehicle.driverPhone || '';
            document.getElementById('vehicleOwner').value = vehicle.owner;
            document.getElementById('vehicleNote').value = vehicle.note || '';
            document.getElementById('vehicleForm').dataset.editId = id;
        }
    } else {
        document.getElementById('vehicleModalTitle').textContent = 'Thêm xe';
        document.getElementById('vehicleForm').dataset.editId = '';
    }
    openModal('vehicleModal');
}

function saveVehicle() {
    const form = document.getElementById('vehicleForm');
    const editId = form.dataset.editId;
    
    const vehicle = {
        id: editId || Date.now().toString(),
        plate: document.getElementById('vehiclePlate').value.toUpperCase(),
        type: document.getElementById('vehicleType').value,
        driver: document.getElementById('vehicleDriver').value,
        driverPhone: document.getElementById('vehicleDriverPhone').value,
        owner: document.getElementById('vehicleOwner').value,
        note: document.getElementById('vehicleNote').value,
        status: 'active',
        createdAt: editId ? appState.vehicles.find(v => v.id === editId)?.createdAt || new Date().toISOString() : new Date().toISOString()
    };

    if (editId) {
        const index = appState.vehicles.findIndex(v => v.id === editId);
        if (index !== -1) {
            appState.vehicles[index] = vehicle;
        }
    } else {
        appState.vehicles.push(vehicle);
    }

    closeModal('vehicleModal');
    loadPageData('vehicles');
}

function deleteVehicle(id) {
    if (confirm('Bạn có chắc chắn muốn xóa xe này?')) {
        appState.vehicles = appState.vehicles.filter(v => v.id !== id);
        loadPageData('vehicles');
    }
}

function renderVehiclesTable() {
    const tbody = document.getElementById('vehiclesTableBody');
    if (!tbody) return;

    tbody.innerHTML = appState.vehicles.map(vehicle => {
        const typeText = {
            'truck': 'Xe tải',
            'container': 'Container',
            'van': 'Xe bán tải',
            'car': 'Ô tô',
            'other': 'Khác'
        }[vehicle.type] || vehicle.type;

        return `
        <tr>
            <td><strong>${vehicle.plate}</strong></td>
            <td>${typeText}</td>
            <td>${vehicle.driver}</td>
            <td>${vehicle.owner}</td>
            <td><span class="status-badge status-${vehicle.status}">${getStatusText(vehicle.status)}</span></td>
            <td>
                <div class="table-action">
                    <button class="btn-edit" onclick="openVehicleModal('${vehicle.id}')">Sửa</button>
                    <button class="btn-delete" onclick="deleteVehicle('${vehicle.id}')">Xóa</button>
                </div>
            </td>
        </tr>
        `;
    }).join('');
}

// Vehicle Log Management
function openVehicleLogModal(type = null) {
    // Populate vehicle dropdown
    const vehicleSelect = document.getElementById('logVehicleId');
    if (vehicleSelect) {
        vehicleSelect.innerHTML = '<option value="">Chọn xe</option>' +
            appState.vehicles.map(v => 
                `<option value="${v.id}">${v.plate} - ${v.driver}</option>`
            ).join('');
    }

    // Set default datetime to now
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('logDateTime').value = `${year}-${month}-${day}T${hours}:${minutes}`;

    // Set type if provided
    if (type) {
        document.getElementById('logType').value = type;
    }

    // Set guard name from session
    const currentUser = sessionStorage.getItem('currentUser');
    if (currentUser) {
        document.getElementById('logGuard').value = currentUser;
    }

    openModal('vehicleLogModal');
}

function toggleLogType() {
    const logType = document.getElementById('logType').value;
    // Could add logic here if needed
}

function saveVehicleLog() {
    const vehicleId = document.getElementById('logVehicleId').value;
    const logType = document.getElementById('logType').value;
    const datetime = document.getElementById('logDateTime').value;
    const purpose = document.getElementById('logPurpose').value;
    const guard = document.getElementById('logGuard').value;
    const note = document.getElementById('logNote').value;

    if (!vehicleId || !logType || !datetime || !purpose || !guard) {
        alert('Vui lòng điền đầy đủ thông tin bắt buộc');
        return;
    }

    const vehicle = appState.vehicles.find(v => v.id === vehicleId);
    if (!vehicle) {
        alert('Không tìm thấy xe');
        return;
    }

    // Check if vehicle is already in/out
    if (logType === 'in') {
        const lastLog = appState.vehicleLogs
            .filter(log => log.vehicleId === vehicleId)
            .sort((a, b) => new Date(b.datetime) - new Date(a.datetime))[0];
        
        if (lastLog && lastLog.type === 'in' && !lastLog.exitLogId) {
            if (!confirm('Xe này đang trong kho. Bạn có muốn ghi nhận lại lượt vào mới?')) {
                return;
            }
        }
    } else if (logType === 'out') {
        const lastLog = appState.vehicleLogs
            .filter(log => log.vehicleId === vehicleId)
            .sort((a, b) => new Date(b.datetime) - new Date(a.datetime))[0];
        
        if (!lastLog || lastLog.type === 'out' || lastLog.exitLogId) {
            alert('Xe này chưa có lượt vào. Vui lòng ghi nhận lượt vào trước.');
            return;
        }
    }

    const log = {
        id: Date.now().toString(),
        vehicleId: vehicleId,
        vehiclePlate: vehicle.plate,
        vehicleDriver: vehicle.driver,
        type: logType,
        datetime: datetime,
        purpose: purpose,
        guard: guard,
        note: note,
        exitLogId: null, // Link to exit log if this is an entry
        createdAt: new Date().toISOString()
    };

    // If this is an exit, link it to the last entry
    if (logType === 'out') {
        const lastEntry = appState.vehicleLogs
            .filter(l => l.vehicleId === vehicleId && l.type === 'in' && !l.exitLogId)
            .sort((a, b) => new Date(b.datetime) - new Date(a.datetime))[0];
        
        if (lastEntry) {
            lastEntry.exitLogId = log.id;
        }
    }

    appState.vehicleLogs.push(log);
    closeModal('vehicleLogModal');
    loadPageData('vehicle-logs');
    checkVehicleAlerts();
}

function renderVehicleLogsTable() {
    const tbody = document.getElementById('vehicleLogsTableBody');
    if (!tbody) return;

    const logs = [...appState.vehicleLogs].sort((a, b) => new Date(b.datetime) - new Date(a.datetime));
    
    tbody.innerHTML = logs.map(log => {
        const purposeText = {
            'delivery': 'Giao hàng',
            'pickup': 'Lấy hàng',
            'maintenance': 'Bảo trì',
            'inspection': 'Kiểm tra',
            'other': 'Khác'
        }[log.purpose] || log.purpose;

        const statusText = log.exitLogId ? 'Đã ra' : (log.type === 'in' ? 'Trong kho' : 'Đã ra');
        const statusClass = log.exitLogId ? 'completed' : (log.type === 'in' ? 'pending' : 'completed');

        return `
        <tr>
            <td>${formatDateTime(log.datetime)}</td>
            <td><strong>${log.vehiclePlate}</strong></td>
            <td>${log.vehicleDriver}</td>
            <td>${log.type === 'in' ? 'Vào' : 'Ra'}</td>
            <td>${purposeText}</td>
            <td>${log.guard}</td>
            <td><span class="status-badge status-${statusClass}">${statusText}</span></td>
            <td>
                <div class="table-action">
                    <button class="btn-view" onclick="viewVehicleLog('${log.id}')">Xem</button>
                </div>
            </td>
        </tr>
        `;
    }).join('');

    checkVehicleAlerts();
}

function filterVehicleLogs() {
    const filter = document.getElementById('vehicleLogFilter').value;
    const dateFilter = document.getElementById('vehicleLogDate').value;

    let logs = [...appState.vehicleLogs];

    if (filter === 'in') {
        logs = logs.filter(log => log.type === 'in' && !log.exitLogId);
    } else if (filter === 'out') {
        logs = logs.filter(log => log.type === 'out');
    } else if (filter === 'parked') {
        logs = logs.filter(log => log.type === 'in' && !log.exitLogId);
    }

    if (dateFilter) {
        logs = logs.filter(log => log.datetime.startsWith(dateFilter));
    }

    logs.sort((a, b) => new Date(b.datetime) - new Date(a.datetime));

    const tbody = document.getElementById('vehicleLogsTableBody');
    if (!tbody) return;

    tbody.innerHTML = logs.map(log => {
        const purposeText = {
            'delivery': 'Giao hàng',
            'pickup': 'Lấy hàng',
            'maintenance': 'Bảo trì',
            'inspection': 'Kiểm tra',
            'other': 'Khác'
        }[log.purpose] || log.purpose;

        const statusText = log.exitLogId ? 'Đã ra' : (log.type === 'in' ? 'Trong kho' : 'Đã ra');
        const statusClass = log.exitLogId ? 'completed' : (log.type === 'in' ? 'pending' : 'completed');

        return `
        <tr>
            <td>${formatDateTime(log.datetime)}</td>
            <td><strong>${log.vehiclePlate}</strong></td>
            <td>${log.vehicleDriver}</td>
            <td>${log.type === 'in' ? 'Vào' : 'Ra'}</td>
            <td>${purposeText}</td>
            <td>${log.guard}</td>
            <td><span class="status-badge status-${statusClass}">${statusText}</span></td>
            <td>
                <div class="table-action">
                    <button class="btn-view" onclick="viewVehicleLog('${log.id}')">Xem</button>
                </div>
            </td>
        </tr>
        `;
    }).join('');
}

function checkVehicleAlerts() {
    const alertContainer = document.getElementById('vehicleAlerts');
    if (!alertContainer) return;

    const now = new Date();
    const alertHours = appState.vehicleAlertHours * 60 * 60 * 1000; // Convert to milliseconds
    const parkedVehicles = appState.vehicleLogs.filter(log => 
        log.type === 'in' && !log.exitLogId
    );

    const alerts = parkedVehicles.filter(log => {
        const entryTime = new Date(log.datetime);
        const hoursIn = (now - entryTime) / (60 * 60 * 1000);
        return hoursIn >= appState.vehicleAlertHours;
    });

    if (alerts.length > 0) {
        alertContainer.innerHTML = alerts.map(log => {
            const entryTime = new Date(log.datetime);
            const hoursIn = Math.floor((now - entryTime) / (60 * 60 * 1000));
            return `
                <div class="alert-warning" style="background: #fef3c7; color: #92400e; padding: 1rem; margin-bottom: 0.5rem; border-radius: 0.5rem; border: 1px solid #fbbf24;">
                    <strong>⚠️ Cảnh báo:</strong> Xe <strong>${log.vehiclePlate}</strong> 
                    đã vào kho từ ${formatDateTime(log.datetime)} (${hoursIn} giờ trước) 
                    nhưng chưa có lượt ra. Vui lòng kiểm tra.
                </div>
            `;
        }).join('');
    } else {
        alertContainer.innerHTML = '';
    }
}

function viewVehicleLog(id) {
    const log = appState.vehicleLogs.find(l => l.id === id);
    if (!log) return;

    const vehicle = appState.vehicles.find(v => v.id === log.vehicleId);
    const purposeText = {
        'delivery': 'Giao hàng',
        'pickup': 'Lấy hàng',
        'maintenance': 'Bảo trì',
        'inspection': 'Kiểm tra',
        'other': 'Khác'
    }[log.purpose] || log.purpose;

    let info = `Biển số: ${log.vehiclePlate}\n`;
    info += `Tài xế: ${log.vehicleDriver}\n`;
    info += `Loại: ${log.type === 'in' ? 'Xe vào' : 'Xe ra'}\n`;
    info += `Thời gian: ${formatDateTime(log.datetime)}\n`;
    info += `Mục đích: ${purposeText}\n`;
    info += `Người xác nhận: ${log.guard}\n`;
    if (log.note) info += `Ghi chú: ${log.note}\n`;

    if (log.type === 'in' && log.exitLogId) {
        const exitLog = appState.vehicleLogs.find(l => l.id === log.exitLogId);
        if (exitLog) {
            const entryTime = new Date(log.datetime);
            const exitTime = new Date(exitLog.datetime);
            const duration = Math.floor((exitTime - entryTime) / (60 * 1000)); // minutes
            info += `\nThời gian trong kho: ${Math.floor(duration / 60)} giờ ${duration % 60} phút`;
        }
    }

    alert(info);
}

function generateVehicleReport() {
    const period = document.getElementById('vehicleReportPeriod').value;
    let fromDate, toDate;
    const now = new Date();

    if (period === 'day') {
        fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        toDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    } else if (period === 'week') {
        const dayOfWeek = now.getDay();
        const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        fromDate = new Date(now.getFullYear(), now.getMonth(), diff);
        toDate = new Date(fromDate);
        toDate.setDate(toDate.getDate() + 7);
    } else if (period === 'month') {
        fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
        toDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    } else if (period === 'custom') {
        fromDate = new Date(document.getElementById('vehicleReportDateFrom').value);
        toDate = new Date(document.getElementById('vehicleReportDateTo').value);
        toDate.setHours(23, 59, 59, 999);
    }

    const filteredLogs = appState.vehicleLogs.filter(log => {
        const logDate = new Date(log.datetime);
        return logDate >= fromDate && logDate < toDate;
    });

    const inCount = filteredLogs.filter(log => log.type === 'in').length;
    const outCount = filteredLogs.filter(log => log.type === 'out').length;
    const parkedCount = filteredLogs.filter(log => log.type === 'in' && !log.exitLogId).length;

    document.getElementById('totalVehiclesIn').textContent = inCount;
    document.getElementById('totalVehiclesOut').textContent = outCount;
    document.getElementById('vehiclesParked').textContent = parkedCount;

    // Group by date
    const dateMap = {};
    filteredLogs.forEach(log => {
        const date = log.datetime.split('T')[0];
        if (!dateMap[date]) {
            dateMap[date] = { date, inCount: 0, outCount: 0, parkedCount: 0 };
        }
        if (log.type === 'in') {
            dateMap[date].inCount++;
            if (!log.exitLogId) {
                dateMap[date].parkedCount++;
            }
        } else {
            dateMap[date].outCount++;
        }
    });

    const reportData = Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));

    const tbody = document.getElementById('vehicleReportTableBody');
    if (!tbody) return;

    tbody.innerHTML = reportData.map(row => `
        <tr>
            <td>${formatDate(row.date)}</td>
            <td>${row.inCount}</td>
            <td>${row.outCount}</td>
            <td>${row.parkedCount}</td>
            <td>
                <button class="btn-view" onclick="viewVehicleReportDetails('${row.date}')">Xem chi tiết</button>
            </td>
        </tr>
    `).join('');
}

function viewVehicleReportDetails(date) {
    const logs = appState.vehicleLogs.filter(log => log.datetime.startsWith(date));
    if (logs.length === 0) {
        alert('Không có dữ liệu cho ngày này');
        return;
    }

    let info = `Chi tiết ngày ${formatDate(date)}\n\n`;
    logs.forEach(log => {
        info += `${formatDateTime(log.datetime)} - ${log.vehiclePlate} - ${log.type === 'in' ? 'Vào' : 'Ra'}\n`;
    });

    alert(info);
}

// Load Page Data
async function loadPageData(pageName) {
    switch(pageName) {
        case 'dashboard':
            await updateDashboard();
            break;
        case 'products':
            await loadProducts();
            break;
        case 'locations':
            await loadLocations();
            break;
        case 'suppliers':
            await loadSuppliers();
            break;
        case 'customers':
            await loadCustomers();
            break;
        case 'receipts':
            await loadReceipts();
            break;
        case 'issues':
            await loadIssues();
            break;
        case 'stock':
            await loadStock();
            break;
        case 'history':
            await loadHistory();
            break;
        case 'users':
            await loadUsers();
            break;
        case 'reports':
            await generateReport();
            break;
        case 'vehicles':
            await loadVehicles();
            break;
        case 'vehicle-logs':
            await loadVehicleLogs();
            break;
        case 'vehicle-reports':
            await generateVehicleReport();
            break;
    }
}

// Load functions for each page
async function loadProducts() {
    try {
        const response = await window.API.products.getAll();
        if (response.success) {
            renderProductsTable(response.data);
        }
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

async function loadLocations() {
    try {
        const response = await window.API.locations.getAll();
        if (response.success) {
            renderLocationsTable(response.data);
        }
    } catch (error) {
        console.error('Error loading locations:', error);
    }
}

async function loadSuppliers() {
    try {
        const response = await window.API.suppliers.getAll();
        if (response.success) {
            renderSuppliersTable(response.data);
        }
    } catch (error) {
        console.error('Error loading suppliers:', error);
    }
}

async function loadCustomers() {
    try {
        const response = await window.API.customers.getAll();
        if (response.success) {
            renderCustomersTable(response.data);
        }
    } catch (error) {
        console.error('Error loading customers:', error);
    }
}

async function loadReceipts() {
    try {
        const response = await window.API.receipts.getAll();
        if (response.success) {
            renderReceiptsTable(response.data);
        }
    } catch (error) {
        console.error('Error loading receipts:', error);
    }
}

async function loadIssues() {
    try {
        const response = await window.API.issues.getAll();
        if (response.success) {
            renderIssuesTable(response.data);
        }
    } catch (error) {
        console.error('Error loading issues:', error);
    }
}

async function loadStock() {
    try {
        const response = await window.API.stock.getCurrent();
        if (response.success) {
            renderStockTable(response.data);
        }
    } catch (error) {
        console.error('Error loading stock:', error);
    }
}

async function loadHistory() {
    try {
        const dateFrom = document.getElementById('historyDateFrom')?.value;
        const dateTo = document.getElementById('historyDateTo')?.value;
        const type = document.getElementById('historyTypeFilter')?.value;
        const response = await window.API.stock.getHistory(dateFrom, dateTo, type);
        if (response.success) {
            renderHistoryTable(response.data);
        }
    } catch (error) {
        console.error('Error loading history:', error);
    }
}

async function loadUsers() {
    try {
        const response = await window.API.users.getAll();
        if (response.success) {
            renderUsersTable(response.data);
        }
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

async function loadVehicles() {
    try {
        const response = await window.API.vehicles.getAll();
        if (response.success) {
            renderVehiclesTable(response.data);
        }
    } catch (error) {
        console.error('Error loading vehicles:', error);
    }
}

async function loadVehicleLogs() {
    try {
        const filter = document.getElementById('vehicleLogFilter')?.value;
        const date = document.getElementById('vehicleLogDate')?.value;
        const response = await window.API.vehicleLogs.getAll(filter, date);
        if (response.success) {
            renderVehicleLogsTable(response.data);
        }
    } catch (error) {
        console.error('Error loading vehicle logs:', error);
    }
}

// Update Dashboard
async function updateDashboard() {
    try {
        const response = await window.API.dashboard.getStats();
        if (response.success) {
            const stats = response.data;
            document.getElementById('totalProducts').textContent = stats.totalProducts || 0;
            document.getElementById('totalLocations').textContent = stats.totalLocations || 0;
            document.getElementById('todayReceipts').textContent = stats.todayReceipts || 0;
            document.getElementById('todayIssues').textContent = stats.todayIssues || 0;
        }
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

// Load Sample Data - No longer needed, data comes from API
function loadSampleData() {
    // Data will be loaded from API when needed
    console.log('Data will be loaded from API');
}

// View functions
function viewReceipt(id) {
    const receipt = appState.receipts.find(r => r.id === id);
    if (receipt) {
        alert(`Phiếu nhập: ${receipt.code}\nNgày: ${formatDate(receipt.date)}\nNhà cung cấp: ${receipt.supplierName}\nTổng tiền: ${formatCurrency(receipt.total)}`);
    }
}

function viewIssue(id) {
    const issue = appState.issues.find(i => i.id === id);
    if (issue) {
        alert(`Phiếu xuất: ${issue.code}\nNgày: ${formatDate(issue.date)}\nKhách hàng: ${issue.customerName}\nTổng tiền: ${formatCurrency(issue.total)}`);
    }
}

