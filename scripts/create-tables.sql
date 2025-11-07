-- Script tạo các bảng cho hệ thống quản lý kho bãi
-- Database: QuanLyKhoPhanPhoi_SQLServer

USE QuanLyKhoPhanPhoi_SQLServer;
GO

-- Bảng Products (Sản phẩm)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[products]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[products] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [sku] NVARCHAR(50) NOT NULL UNIQUE,
        [name] NVARCHAR(255) NOT NULL,
        [description] NVARCHAR(MAX),
        [unit] NVARCHAR(50) NOT NULL,
        [price] DECIMAL(18,2) NOT NULL,
        [category] NVARCHAR(100),
        [createdAt] DATETIME2 DEFAULT GETDATE(),
        [updatedAt] DATETIME2 DEFAULT GETDATE()
    );
    CREATE INDEX IX_products_sku ON [dbo].[products]([sku]);
    CREATE INDEX IX_products_category ON [dbo].[products]([category]);
END
GO

-- Bảng Locations (Vị trí kho)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[locations]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[locations] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [name] NVARCHAR(255) NOT NULL,
        [code] NVARCHAR(50) NOT NULL UNIQUE,
        [capacity] DECIMAL(18,2) DEFAULT 0,
        [createdAt] DATETIME2 DEFAULT GETDATE(),
        [updatedAt] DATETIME2 DEFAULT GETDATE()
    );
    CREATE INDEX IX_locations_code ON [dbo].[locations]([code]);
END
GO

-- Bảng Suppliers (Nhà cung cấp)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[suppliers]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[suppliers] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [name] NVARCHAR(255) NOT NULL,
        [tax_code] NVARCHAR(50),
        [address] NVARCHAR(500),
        [phone] NVARCHAR(50),
        [email] NVARCHAR(255),
        [createdAt] DATETIME2 DEFAULT GETDATE(),
        [updatedAt] DATETIME2 DEFAULT GETDATE()
    );
END
GO

-- Bảng Customers (Khách hàng)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[customers]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[customers] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [name] NVARCHAR(255) NOT NULL,
        [tax_code] NVARCHAR(50),
        [address] NVARCHAR(500),
        [phone] NVARCHAR(50),
        [email] NVARCHAR(255),
        [createdAt] DATETIME2 DEFAULT GETDATE(),
        [updatedAt] DATETIME2 DEFAULT GETDATE()
    );
END
GO

-- Bảng Users (Người dùng)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[users]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[users] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [username] NVARCHAR(50) NOT NULL UNIQUE,
        [fullName] NVARCHAR(255) NOT NULL,
        [email] NVARCHAR(255),
        [password] NVARCHAR(255) NOT NULL,
        [role] NVARCHAR(50) NOT NULL,
        [status] NVARCHAR(20) DEFAULT 'active',
        [createdAt] DATETIME2 DEFAULT GETDATE(),
        [updatedAt] DATETIME2 DEFAULT GETDATE()
    );
    CREATE INDEX IX_users_username ON [dbo].[users]([username]);
END
GO

-- Bảng Vehicles (Phương tiện)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[vehicles]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[vehicles] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [plate] NVARCHAR(50) NOT NULL UNIQUE,
        [type] NVARCHAR(50) NOT NULL,
        [driver] NVARCHAR(255) NOT NULL,
        [driverPhone] NVARCHAR(50),
        [owner] NVARCHAR(255) NOT NULL,
        [note] NVARCHAR(MAX),
        [status] NVARCHAR(20) DEFAULT 'active',
        [createdAt] DATETIME2 DEFAULT GETDATE(),
        [updatedAt] DATETIME2 DEFAULT GETDATE()
    );
    CREATE INDEX IX_vehicles_plate ON [dbo].[vehicles]([plate]);
END
GO

-- Bảng Receipts (Phiếu nhập)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[receipts]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[receipts] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [code] NVARCHAR(50) NOT NULL UNIQUE,
        [supplierId] INT NOT NULL,
        [date] DATE NOT NULL,
        [note] NVARCHAR(MAX),
        [total] DECIMAL(18,2) NOT NULL,
        [status] NVARCHAR(50) DEFAULT 'completed',
        [createdAt] DATETIME2 DEFAULT GETDATE(),
        [createdBy] INT,
        FOREIGN KEY ([supplierId]) REFERENCES [dbo].[suppliers]([id]),
        FOREIGN KEY ([createdBy]) REFERENCES [dbo].[users]([id])
    );
    CREATE INDEX IX_receipts_code ON [dbo].[receipts]([code]);
    CREATE INDEX IX_receipts_date ON [dbo].[receipts]([date]);
    CREATE INDEX IX_receipts_supplierId ON [dbo].[receipts]([supplierId]);
END
GO

-- Bảng Receipt Items (Chi tiết phiếu nhập)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[receipt_items]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[receipt_items] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [receiptId] INT NOT NULL,
        [productId] INT NOT NULL,
        [quantity] DECIMAL(18,2) NOT NULL,
        [locationId] INT NOT NULL,
        [price] DECIMAL(18,2) NOT NULL,
        [total] DECIMAL(18,2) NOT NULL,
        FOREIGN KEY ([receiptId]) REFERENCES [dbo].[receipts]([id]) ON DELETE CASCADE,
        FOREIGN KEY ([productId]) REFERENCES [dbo].[products]([id]),
        FOREIGN KEY ([locationId]) REFERENCES [dbo].[locations]([id])
    );
    CREATE INDEX IX_receipt_items_receiptId ON [dbo].[receipt_items]([receiptId]);
    CREATE INDEX IX_receipt_items_productId ON [dbo].[receipt_items]([productId]);
END
GO

-- Bảng Issues (Phiếu xuất)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[issues]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[issues] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [code] NVARCHAR(50) NOT NULL UNIQUE,
        [customerId] INT NOT NULL,
        [date] DATE NOT NULL,
        [note] NVARCHAR(MAX),
        [total] DECIMAL(18,2) NOT NULL,
        [status] NVARCHAR(50) DEFAULT 'completed',
        [createdAt] DATETIME2 DEFAULT GETDATE(),
        [createdBy] INT,
        FOREIGN KEY ([customerId]) REFERENCES [dbo].[customers]([id]),
        FOREIGN KEY ([createdBy]) REFERENCES [dbo].[users]([id])
    );
    CREATE INDEX IX_issues_code ON [dbo].[issues]([code]);
    CREATE INDEX IX_issues_date ON [dbo].[issues]([date]);
    CREATE INDEX IX_issues_customerId ON [dbo].[issues]([customerId]);
END
GO

-- Bảng Issue Items (Chi tiết phiếu xuất)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[issue_items]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[issue_items] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [issueId] INT NOT NULL,
        [productId] INT NOT NULL,
        [quantity] DECIMAL(18,2) NOT NULL,
        [locationId] INT NOT NULL,
        [price] DECIMAL(18,2) NOT NULL,
        [total] DECIMAL(18,2) NOT NULL,
        FOREIGN KEY ([issueId]) REFERENCES [dbo].[issues]([id]) ON DELETE CASCADE,
        FOREIGN KEY ([productId]) REFERENCES [dbo].[products]([id]),
        FOREIGN KEY ([locationId]) REFERENCES [dbo].[locations]([id])
    );
    CREATE INDEX IX_issue_items_issueId ON [dbo].[issue_items]([issueId]);
    CREATE INDEX IX_issue_items_productId ON [dbo].[issue_items]([productId]);
END
GO

-- Bảng Stock (Tồn kho)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[stock]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[stock] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [productId] INT NOT NULL,
        [locationId] INT NOT NULL,
        [quantity] DECIMAL(18,2) NOT NULL DEFAULT 0,
        [updatedAt] DATETIME2 DEFAULT GETDATE(),
        UNIQUE ([productId], [locationId]),
        FOREIGN KEY ([productId]) REFERENCES [dbo].[products]([id]),
        FOREIGN KEY ([locationId]) REFERENCES [dbo].[locations]([id])
    );
    CREATE INDEX IX_stock_productId ON [dbo].[stock]([productId]);
    CREATE INDEX IX_stock_locationId ON [dbo].[stock]([locationId]);
END
GO

-- Bảng Vehicle Logs (Nhật ký phương tiện)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[vehicle_logs]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[vehicle_logs] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [vehicleId] INT NOT NULL,
        [vehiclePlate] NVARCHAR(50) NOT NULL,
        [vehicleDriver] NVARCHAR(255),
        [type] NVARCHAR(10) NOT NULL CHECK ([type] IN ('in', 'out')),
        [datetime] DATETIME2 NOT NULL,
        [purpose] NVARCHAR(255) NOT NULL,
        [guard] NVARCHAR(255) NOT NULL,
        [note] NVARCHAR(MAX),
        [exitLogId] INT NULL,
        [createdAt] DATETIME2 DEFAULT GETDATE(),
        [createdBy] INT,
        FOREIGN KEY ([vehicleId]) REFERENCES [dbo].[vehicles]([id]),
        FOREIGN KEY ([exitLogId]) REFERENCES [dbo].[vehicle_logs]([id]),
        FOREIGN KEY ([createdBy]) REFERENCES [dbo].[users]([id])
    );
    CREATE INDEX IX_vehicle_logs_vehicleId ON [dbo].[vehicle_logs]([vehicleId]);
    CREATE INDEX IX_vehicle_logs_datetime ON [dbo].[vehicle_logs]([datetime]);
    CREATE INDEX IX_vehicle_logs_type ON [dbo].[vehicle_logs]([type]);
END
GO

PRINT 'Tất cả các bảng đã được tạo thành công!';
GO





