-- ================================================
-- DATABASE: QuanLyKhoPhanPhoi (SQL Server)
-- Author: ChatGPT Assistant
-- Description: Complete SQL Server schema (11 tables)
-- ================================================

IF DB_ID('QuanLyKhoPhanPhoi') IS NOT NULL
    DROP DATABASE QuanLyKhoPhanPhoi;
GO

CREATE DATABASE QuanLyKhoPhanPhoi;
GO

USE QuanLyKhoPhanPhoi;
GO

-- ================================================
-- 1. USERS (Nhân viên, bảo vệ, tài xế, quản lý)
-- ================================================
CREATE TABLE users (
    user_id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(150) NOT NULL,
    email NVARCHAR(150) NOT NULL UNIQUE,
    password_hash NVARCHAR(255) NOT NULL,
    role NVARCHAR(30) NOT NULL,
    phone NVARCHAR(30),
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    is_active BIT NOT NULL DEFAULT 1
);
GO

-- ================================================
-- 2. SUPPLIERS (Nhà cung cấp)
-- ================================================
CREATE TABLE suppliers (
    supplier_id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(200) NOT NULL,
    contact_name NVARCHAR(150),
    phone NVARCHAR(30),
    email NVARCHAR(150),
    address NVARCHAR(MAX),
    tax_code NVARCHAR(50),
    created_at DATETIME2 DEFAULT SYSDATETIME(),
    is_active BIT DEFAULT 1
);
GO

-- ================================================
-- 3. VEHICLES (Phương tiện vận chuyển / Xe ra vào kho)
-- ================================================
CREATE TABLE vehicles (
    vehicle_id INT IDENTITY(1,1) PRIMARY KEY,
    plate_number NVARCHAR(20) NOT NULL UNIQUE,
    driver_name NVARCHAR(150),
    driver_phone NVARCHAR(30),
    vehicle_type NVARCHAR(50),
    company NVARCHAR(150),
    status NVARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'in_use', 'maintenance')),
    created_at DATETIME2 DEFAULT SYSDATETIME(),
    is_active BIT DEFAULT 1
);
GO

-- ================================================
-- 4. VEHICLE_LOG (Nhật ký xe ra vào kho)
-- ================================================
CREATE TABLE vehicle_log (
    log_id INT IDENTITY(1,1) PRIMARY KEY,
    vehicle_id INT NOT NULL FOREIGN KEY REFERENCES vehicles(vehicle_id) ON DELETE CASCADE,
    entry_time DATETIME2 NOT NULL,
    exit_time DATETIME2 NULL,
    purpose NVARCHAR(20) NOT NULL CHECK (purpose IN ('delivery','pickup','maintenance','visitor')),
    security_guard NVARCHAR(100),
    notes NVARCHAR(MAX),
    created_at DATETIME2 DEFAULT SYSDATETIME()
);
GO

-- ================================================
-- 5. WAREHOUSES (Kho vật lý)
-- ================================================
CREATE TABLE warehouses (
    warehouse_id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(150) NOT NULL,
    address NVARCHAR(MAX),
    capacity INT,
    manager_id INT FOREIGN KEY REFERENCES users(user_id),
    created_at DATETIME2 DEFAULT SYSDATETIME(),
    is_active BIT DEFAULT 1
);
GO

-- ================================================
-- 6. PRODUCTS (Hàng hóa)
-- ================================================
CREATE TABLE products (
    product_id INT IDENTITY(1,1) PRIMARY KEY,
    sku NVARCHAR(50) NOT NULL UNIQUE,
    name NVARCHAR(200) NOT NULL,
    category NVARCHAR(100),
    unit NVARCHAR(20) DEFAULT 'pcs',
    supplier_id INT FOREIGN KEY REFERENCES suppliers(supplier_id) ON DELETE SET NULL,
    warehouse_id INT FOREIGN KEY REFERENCES warehouses(warehouse_id) ON DELETE SET NULL,
    qty_on_hand INT NOT NULL DEFAULT 0,
    min_qty INT DEFAULT 0,
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);
GO

-- ================================================
-- 7. CUSTOMERS (Đối tác / Khách hàng)
-- ================================================
CREATE TABLE customers (
    customer_id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(200) NOT NULL,
    contact_name NVARCHAR(150),
    phone NVARCHAR(30),
    email NVARCHAR(150),
    address NVARCHAR(MAX),
    tax_code NVARCHAR(50),
    created_at DATETIME2 DEFAULT SYSDATETIME(),
    is_active BIT DEFAULT 1
);
GO

-- ================================================
-- 8. SHIPMENTS (Lô / Phiếu vận chuyển)
-- ================================================
CREATE TABLE shipments (
    shipment_id INT IDENTITY(1,1) PRIMARY KEY,
    reference_no NVARCHAR(50) NOT NULL UNIQUE,
    vehicle_id INT FOREIGN KEY REFERENCES vehicles(vehicle_id) ON DELETE SET NULL,
    shipment_type NVARCHAR(3) NOT NULL CHECK (shipment_type IN ('IN','OUT')),
    created_by INT FOREIGN KEY REFERENCES users(user_id) ON DELETE SET NULL,
    customer_id INT FOREIGN KEY REFERENCES customers(customer_id) ON DELETE SET NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    status NVARCHAR(20) NOT NULL DEFAULT 'pending',
    origin NVARCHAR(255),
    destination NVARCHAR(255),
    notes NVARCHAR(MAX)
);
GO

-- ================================================
-- 9. SHIPMENT_ITEMS (Chi tiết hàng trong lô)
-- ================================================
CREATE TABLE shipment_items (
    shipment_item_id INT IDENTITY(1,1) PRIMARY KEY,
    shipment_id INT NOT NULL FOREIGN KEY REFERENCES shipments(shipment_id) ON DELETE CASCADE,
    product_id INT NOT NULL FOREIGN KEY REFERENCES products(product_id) ON DELETE NO ACTION,
    warehouse_id INT FOREIGN KEY REFERENCES warehouses(warehouse_id) ON DELETE SET NULL,
    lot_no NVARCHAR(100),
    quantity INT NOT NULL CHECK (quantity > 0),
    unit NVARCHAR(20),
    unit_price DECIMAL(12,2),
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);
GO

-- ================================================
-- 10. STOCK_MOVEMENTS (Lịch sử biến động tồn kho)
-- ================================================
CREATE TABLE stock_movements (
    movement_id INT IDENTITY(1,1) PRIMARY KEY,
    product_id INT NOT NULL FOREIGN KEY REFERENCES products(product_id),
    shipment_id INT FOREIGN KEY REFERENCES shipments(shipment_id),
    movement_type NVARCHAR(3) CHECK (movement_type IN ('IN','OUT')),
    quantity INT NOT NULL CHECK (quantity > 0),
    previous_qty INT,
    new_qty INT,
    created_at DATETIME2 DEFAULT SYSDATETIME(),
    created_by INT FOREIGN KEY REFERENCES users(user_id)
);
GO

-- ================================================
-- 11. STOCK_AUDITS (Kết quả kiểm kê kho)
-- ================================================
CREATE TABLE stock_audits (
    audit_id INT IDENTITY(1,1) PRIMARY KEY,
    warehouse_id INT FOREIGN KEY REFERENCES warehouses(warehouse_id),
    product_id INT FOREIGN KEY REFERENCES products(product_id),
    counted_qty INT NOT NULL,
    system_qty INT NOT NULL,
    difference AS (counted_qty - system_qty) PERSISTED,
    audit_date DATETIME2 DEFAULT SYSDATETIME(),
    auditor_id INT FOREIGN KEY REFERENCES users(user_id)
);
GO


------------------------------------------------------------
-- 1. USERS (Nhân viên, bảo vệ, tài xế, quản lý)
------------------------------------------------------------
INSERT INTO users (name, email, password_hash, role, phone)
VALUES
('Nguyen Van A', 'a@company.com', 'hash1', 'admin', '0901111001'),
('Tran Thi B', 'b@company.com', 'hash2', 'manager', '0901111002'),
('Le Van C', 'c@company.com', 'hash3', 'warehouse', '0901111003'),
('Pham Thi D', 'd@company.com', 'hash4', 'security', '0901111004'),
('Do Van E', 'e@company.com', 'hash5', 'driver', '0901111005'),
('Hoang Thi F', 'f@company.com', 'hash6', 'driver', '0901111006'),
('Vo Van G', 'g@company.com', 'hash7', 'warehouse', '0901111007'),
('Dang Thi H', 'h@company.com', 'hash8', 'security', '0901111008'),
('Nguyen Van I', 'i@company.com', 'hash9', 'accountant', '0901111009'),
('Bui Thi K', 'k@company.com', 'hash10', 'manager', '0901111010');
GO

------------------------------------------------------------
-- 2. SUPPLIERS (Nhà cung cấp)
------------------------------------------------------------
INSERT INTO suppliers (name, contact_name, phone, email, address, tax_code)
VALUES
('CTY TNHH ABC', 'Le Thi Lan', '0902000001', 'abc@sup.com', 'Ha Noi', '0101234567'),
('CTY TNHH XYZ', 'Nguyen Van Hung', '0902000002', 'xyz@sup.com', 'Hai Phong', '0209876543'),
('CTY CP MINH PHAT', 'Tran Thi Mai', '0902000003', 'mp@sup.com', 'Da Nang', '0301122334'),
('CTY HOANG LONG', 'Do Van Khoa', '0902000004', 'hl@sup.com', 'HCM', '0405566778'),
('CTY PHUOC LOC', 'Pham Van Duc', '0902000005', 'pl@sup.com', 'Hue', '0509988776'),
('CTY HUNG THINH', 'Nguyen Thi Nhan', '0902000006', 'ht@sup.com', 'Can Tho', '0603344556'),
('CTY DAI PHAT', 'Le Van Cuong', '0902000007', 'dp@sup.com', 'Bac Ninh', '0705544332'),
('CTY VINATECH', 'Tran Thi Thao', '0902000008', 'vt@sup.com', 'Ha Noi', '0807788991'),
('CTY HOANG MINH', 'Pham Duy An', '0902000009', 'hm@sup.com', 'Ha Tinh', '0902211445'),
('CTY SON HAI', 'Vu Thi Lan', '0902000010', 'sh@sup.com', 'HCM', '1001239876');
GO

------------------------------------------------------------
-- 3. VEHICLES (Xe vận chuyển)
------------------------------------------------------------
INSERT INTO vehicles (plate_number, driver_name, driver_phone, vehicle_type, company, status)
VALUES
('29A-12345', 'Nguyen Van Tai', '0903000001', 'Xe tải', 'CTY Vận Tải Bắc Nam', 'available'),
('30A-67890', 'Le Van Loc', '0903000002', 'Container', 'CTY Vận Tải Nam Bắc', 'in_use'),
('31C-22233', 'Pham Van Hieu', '0903000003', 'Xe nâng', 'Kho Hà Nội', 'available'),
('32C-44455', 'Tran Thi Thanh', '0903000004', 'Xe tải nhỏ', 'Kho Đà Nẵng', 'maintenance'),
('33A-55566', 'Doan Van Toan', '0903000005', 'Xe tải lớn', 'Kho HCM', 'available'),
('34B-77788', 'Hoang Van An', '0903000006', 'Container', 'Kho Hải Phòng', 'available'),
('35A-88899', 'Nguyen Quang', '0903000007', 'Xe nâng', 'Kho Bình Dương', 'available'),
('36C-11122', 'Tran Van Kien', '0903000008', 'Xe tải', 'Kho Hà Nội', 'in_use'),
('37A-99900', 'Le Van Minh', '0903000009', 'Container', 'Kho Đà Nẵng', 'available'),
('38C-33344', 'Pham Duy Hai', '0903000010', 'Xe tải', 'Kho Cần Thơ', 'available');
GO

------------------------------------------------------------
-- 4. WAREHOUSES (Kho vật lý)
------------------------------------------------------------
INSERT INTO warehouses (name, address, capacity, manager_id)
VALUES
('Kho Hà Nội', 'Số 10, Láng Hạ, Hà Nội', 2000, 2),
('Kho Hải Phòng', 'Lạch Tray, Hải Phòng', 1500, 3),
('Kho Đà Nẵng', 'Hoàng Diệu, Đà Nẵng', 1800, 3),
('Kho HCM', 'Cộng Hòa, Tân Bình, HCM', 2500, 2),
('Kho Bình Dương', 'Thủ Dầu Một, Bình Dương', 2200, 7),
('Kho Cần Thơ', 'Ninh Kiều, Cần Thơ', 1600, 7),
('Kho Bắc Ninh', 'Từ Sơn, Bắc Ninh', 1700, 3),
('Kho Vinh', 'Lê Mao, Nghệ An', 1400, 3),
('Kho Thanh Hóa', 'Nguyễn Trãi, Thanh Hóa', 1500, 7),
('Kho Huế', 'An Dương Vương, Huế', 1300, 3);
GO

------------------------------------------------------------
-- 5. PRODUCTS (Hàng hóa)
------------------------------------------------------------
INSERT INTO products (sku, name, category, unit, supplier_id, warehouse_id, qty_on_hand, min_qty)
VALUES
('SP001', 'Bánh quy sữa', 'Thực phẩm', 'hộp', 1, 1, 200, 20),
('SP002', 'Mì gói 3 Miền', 'Thực phẩm', 'thùng', 2, 1, 500, 50),
('SP003', 'Nước suối Lavie 500ml', 'Nước uống', 'chai', 3, 4, 300, 30),
('SP004', 'Sữa Vinamilk 1L', 'Đồ uống', 'hộp', 4, 2, 250, 25),
('SP005', 'Gạo ST25', 'Lương thực', 'kg', 5, 3, 1000, 100),
('SP006', 'Dầu ăn Neptune', 'Gia vị', 'chai', 6, 5, 400, 40),
('SP007', 'Nước tương Maggi', 'Gia vị', 'chai', 7, 6, 300, 30),
('SP008', 'Bột giặt Omo', 'Hóa phẩm', 'túi', 8, 4, 600, 60),
('SP009', 'Kem đánh răng Colgate', 'Hóa phẩm', 'tuýp', 9, 3, 350, 35),
('SP010', 'Khẩu trang 3 lớp', 'Vật tư', 'hộp', 10, 2, 800, 80);
GO

------------------------------------------------------------
-- 6. CUSTOMERS (Khách hàng)
------------------------------------------------------------
INSERT INTO customers (name, contact_name, phone, email, address, tax_code)
VALUES
('Siêu thị Big C', 'Tran Thi Thao', '0904000001', 'bigc@cust.com', 'Hà Nội', '0100111222'),
('Co.op Mart', 'Le Van Hoang', '0904000002', 'coop@cust.com', 'HCM', '0200333444'),
('Winmart', 'Nguyen Thi Thu', '0904000003', 'winmart@cust.com', 'Đà Nẵng', '0300555666'),
('Bách Hóa Xanh', 'Pham Van An', '0904000004', 'bhx@cust.com', 'Cần Thơ', '0400777888'),
('Circle K', 'Tran Van Binh', '0904000005', 'ck@cust.com', 'Hà Nội', '0500999000'),
('Vinmart+', 'Doan Thi My', '0904000006', 'vm@cust.com', 'Huế', '0600123123'),
('Mega Market', 'Hoang Van Quang', '0904000007', 'mm@cust.com', 'HCM', '0700456456'),
('Family Mart', 'Nguyen Duy', '0904000008', 'fm@cust.com', 'Bình Dương', '0800789789'),
('Lotte Mart', 'Le Thanh', '0904000009', 'lotte@cust.com', 'Hà Nội', '0900212565'),
('AEON', 'Bui Thi Lan', '0904000010', 'aeon@cust.com', 'Hải Phòng', '1000879765');
GO

------------------------------------------------------------
-- 7. VEHICLE_LOG (Nhật ký xe ra vào kho)
------------------------------------------------------------
INSERT INTO vehicle_log (vehicle_id, entry_time, exit_time, purpose, security_guard, notes)
VALUES
(1, SYSDATETIME()-3, SYSDATETIME()-2.5, 'delivery', N'Bảo vệ D', N'Xe vào giao hàng sáng'),
(2, SYSDATETIME()-2, SYSDATETIME()-1.8, 'pickup', N'Bảo vệ H', N'Xe lấy hàng xuất đi HCM'),
(3, SYSDATETIME()-1.5, NULL, 'maintenance', N'Bảo vệ D', N'Xe đang bảo trì trong kho'),
(4, SYSDATETIME()-1, SYSDATETIME()-0.8, 'delivery', N'Bảo vệ D', N'Xe giao sữa Vinamilk'),
(5, SYSDATETIME()-0.7, SYSDATETIME()-0.6, 'pickup', N'Bảo vệ H', N'Xe nhận hàng đi Đà Nẵng'),
(6, SYSDATETIME()-0.5, SYSDATETIME()-0.3, 'visitor', N'Bảo vệ D', N'Xe khách tham quan'),
(7, SYSDATETIME()-0.25, SYSDATETIME()-0.2, 'delivery', N'Bảo vệ H', N'Giao hàng cho Big C'),
(8, SYSDATETIME()-0.18, SYSDATETIME()-0.1, 'pickup', N'Bảo vệ D', N'Xe đi lấy gạo ST25'),
(9, SYSDATETIME()-0.08, NULL, 'delivery', N'Bảo vệ H', N'Xe đang giao hàng cho Winmart'),
(10, SYSDATETIME()-0.05, SYSDATETIME()-0.02, 'pickup', N'Bảo vệ D', N'Xe hoàn thành đơn hàng sáng');
GO

------------------------------------------------------------
-- 8. SHIPMENTS (Phiếu nhập/xuất hàng)
------------------------------------------------------------
INSERT INTO shipments (reference_no, vehicle_id, shipment_type, created_by, customer_id, status, origin, destination, notes)
VALUES
('PN001', 1, 'IN', 3, NULL, 'completed', N'Nhà cung cấp ABC', N'Kho Hà Nội', N'Nhập bánh quy sữa'),
('PN002', 2, 'IN', 3, NULL, 'completed', N'Nhà cung cấp XYZ', N'Kho HCM', N'Nhập mì gói'),
('PX001', 3, 'OUT', 7, 1, 'completed', N'Kho Hà Nội', N'Siêu thị Big C', N'Xuất bánh quy sữa'),
('PX002', 4, 'OUT', 7, 2, 'completed', N'Kho HCM', N'Co.op Mart', N'Xuất mì gói 3 Miền'),
('PX003', 5, 'OUT', 7, 3, 'pending', N'Kho HCM', N'Winmart', N'Chuẩn bị xuất nước suối'),
('PN003', 6, 'IN', 3, NULL, 'completed', N'CTY CP Minh Phát', N'Kho Đà Nẵng', N'Nhập nước suối Lavie'),
('PN004', 7, 'IN', 3, NULL, 'completed', N'CTY Hoàng Long', N'Kho Hải Phòng', N'Nhập sữa Vinamilk'),
('PX004', 8, 'OUT', 7, 4, 'completed', N'Kho Đà Nẵng', N'Bách Hóa Xanh', N'Xuất sữa Vinamilk'),
('PN005', 9, 'IN', 3, NULL, 'completed', N'CTY Phước Lộc', N'Kho Cần Thơ', N'Nhập gạo ST25'),
('PX005', 10, 'OUT', 7, 5, 'completed', N'Kho Cần Thơ', N'Circle K', N'Xuất gạo ST25');
GO

------------------------------------------------------------
-- 9. SHIPMENT_ITEMS (Chi tiết hàng trong phiếu)
------------------------------------------------------------
INSERT INTO shipment_items (shipment_id, product_id, warehouse_id, lot_no, quantity, unit, unit_price)
VALUES
(1, 1, 1, 'L001', 200, N'hộp', 12000),
(2, 2, 4, 'L002', 500, N'thùng', 85000),
(3, 1, 1, 'X001', 50, N'hộp', 15000),
(4, 2, 4, 'X002', 100, N'thùng', 90000),
(5, 3, 4, 'X003', 120, N'chái', 8000),
(6, 3, 3, 'L003', 300, N'chái', 7000),
(7, 4, 2, 'L004', 250, N'hộp', 30000),
(8, 4, 2, 'X004', 100, N'hộp', 32000),
(9, 5, 3, 'L005', 500, N'kg', 20000),
(10, 5, 3, 'X005', 300, N'kg', 22000);
GO

------------------------------------------------------------
-- 10. STOCK_MOVEMENTS (Lịch sử nhập/xuất)
------------------------------------------------------------
INSERT INTO stock_movements (product_id, shipment_id, movement_type, quantity, previous_qty, new_qty, created_by)
VALUES
(1, 1, 'IN', 200, 0, 200, 3),
(2, 2, 'IN', 500, 0, 500, 3),
(1, 3, 'OUT', 50, 200, 150, 7),
(2, 4, 'OUT', 100, 500, 400, 7),
(3, 6, 'IN', 300, 0, 300, 3),
(4, 7, 'IN', 250, 0, 250, 3),
(4, 8, 'OUT', 100, 250, 150, 7),
(5, 9, 'IN', 500, 0, 500, 3),
(5, 10, 'OUT', 300, 500, 200, 7),
(3, 5, 'OUT', 120, 300, 180, 7);
GO

------------------------------------------------------------
-- 11. STOCK_AUDITS (Kết quả kiểm kê)
------------------------------------------------------------
INSERT INTO stock_audits (warehouse_id, product_id, counted_qty, system_qty, auditor_id)
VALUES
(1, 1, 155, 150, 2),
(4, 2, 390, 400, 2),
(3, 3, 180, 180, 2),
(2, 4, 150, 150, 2),
(3, 5, 198, 200, 2),
(1, 1, 150, 150, 3),
(4, 2, 405, 400, 3),
(2, 4, 149, 150, 3),
(3, 5, 199, 200, 3),
(4, 8, 610, 600, 2);
GO

-- ================================================
-- End of SQL Server schema
-- ================================================
