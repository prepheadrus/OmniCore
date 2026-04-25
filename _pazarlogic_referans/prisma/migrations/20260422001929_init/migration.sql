-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'viewer',
    "avatar" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "twoFactor" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorCode" TEXT NOT NULL DEFAULT '',
    "lastLogin" DATETIME,
    "storeId" TEXT NOT NULL DEFAULT 'default',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Store" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "domain" TEXT NOT NULL DEFAULT '',
    "logo" TEXT NOT NULL DEFAULT '',
    "plan" TEXT NOT NULL DEFAULT 'basic',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "ownerId" TEXT NOT NULL DEFAULT '',
    "settings" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "License" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'inactive',
    "licenseType" TEXT NOT NULL DEFAULT 'trial',
    "ownerName" TEXT NOT NULL DEFAULT '',
    "ownerEmail" TEXT NOT NULL DEFAULT '',
    "company" TEXT NOT NULL DEFAULT '',
    "activatedAt" DATETIME,
    "expiresAt" DATETIME,
    "machineId" TEXT NOT NULL DEFAULT '',
    "features" TEXT NOT NULL DEFAULT 'all',
    "storeId" TEXT NOT NULL DEFAULT 'default',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL DEFAULT 'default',
    "storeId" TEXT NOT NULL DEFAULT 'default',
    "type" TEXT NOT NULL DEFAULT 'info',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT NOT NULL DEFAULT '',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "category" TEXT NOT NULL DEFAULT 'system',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AutomationRule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL DEFAULT 'default',
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "trigger" TEXT NOT NULL DEFAULT '',
    "condition" TEXT NOT NULL DEFAULT '{}',
    "action" TEXT NOT NULL DEFAULT '',
    "actionData" TEXT NOT NULL DEFAULT '{}',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "runCount" INTEGER NOT NULL DEFAULT 0,
    "lastRun" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "barcode" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "stock" INTEGER NOT NULL,
    "cost" REAL NOT NULL,
    "category" TEXT NOT NULL,
    "subCategory" TEXT NOT NULL DEFAULT '',
    "brand" TEXT NOT NULL DEFAULT '',
    "marketplace" TEXT NOT NULL DEFAULT '',
    "storeId" TEXT NOT NULL DEFAULT 'default',
    "description" TEXT NOT NULL DEFAULT '',
    "shortDesc" TEXT NOT NULL DEFAULT '',
    "images" TEXT NOT NULL DEFAULT '[]',
    "variants" TEXT NOT NULL DEFAULT '[]',
    "attributes" TEXT NOT NULL DEFAULT '{}',
    "seoTitle" TEXT NOT NULL DEFAULT '',
    "seoDesc" TEXT NOT NULL DEFAULT '',
    "supplierId" TEXT NOT NULL DEFAULT '',
    "minStock" INTEGER NOT NULL DEFAULT 0,
    "weight" REAL NOT NULL DEFAULT 0,
    "dimensions" TEXT NOT NULL DEFAULT '{}',
    "vatRate" REAL NOT NULL DEFAULT 20,
    "cargoTemplate" TEXT NOT NULL DEFAULT 'standart',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isListed" BOOLEAN NOT NULL DEFAULT false,
    "listings" TEXT NOT NULL DEFAULT '{}',
    "stockReserve" INTEGER NOT NULL DEFAULT 0,
    "gtin" TEXT NOT NULL DEFAULT '',
    "mpn" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderNumber" TEXT NOT NULL,
    "marketplace" TEXT NOT NULL DEFAULT '',
    "marketplaceOrderNo" TEXT NOT NULL DEFAULT '',
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL DEFAULT '',
    "customerPhone" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "totalAmount" REAL NOT NULL,
    "discount" REAL NOT NULL DEFAULT 0,
    "taxAmount" REAL NOT NULL DEFAULT 0,
    "netAmount" REAL NOT NULL DEFAULT 0,
    "commission" REAL NOT NULL DEFAULT 0,
    "cargoCost" REAL NOT NULL DEFAULT 0,
    "items" INTEGER NOT NULL DEFAULT 1,
    "itemsJson" TEXT NOT NULL DEFAULT '[]',
    "storeId" TEXT NOT NULL DEFAULT 'default',
    "notes" TEXT NOT NULL DEFAULT '',
    "shippingAddr" TEXT NOT NULL DEFAULT '',
    "billingAddr" TEXT NOT NULL DEFAULT '',
    "invoiceNo" TEXT NOT NULL DEFAULT '',
    "trackingNo" TEXT NOT NULL DEFAULT '',
    "carrier" TEXT NOT NULL DEFAULT '',
    "cancelReason" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Return" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "returnNumber" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "reason" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "totalAmount" REAL NOT NULL,
    "refundAmount" REAL NOT NULL DEFAULT 0,
    "type" TEXT NOT NULL DEFAULT 'full',
    "items" INTEGER NOT NULL DEFAULT 1,
    "storeId" TEXT NOT NULL DEFAULT 'default',
    "resolvedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "city" TEXT NOT NULL DEFAULT '',
    "district" TEXT NOT NULL DEFAULT '',
    "segment" TEXT NOT NULL DEFAULT 'new',
    "loyaltyScore" INTEGER NOT NULL DEFAULT 0,
    "totalOrders" INTEGER NOT NULL DEFAULT 0,
    "totalSpent" REAL NOT NULL DEFAULT 0,
    "avgOrderValue" REAL NOT NULL DEFAULT 0,
    "lastOrderAt" DATETIME,
    "storeId" TEXT NOT NULL DEFAULT 'default',
    "notes" TEXT NOT NULL DEFAULT '',
    "tags" TEXT NOT NULL DEFAULT '[]',
    "taxNo" TEXT NOT NULL DEFAULT '',
    "taxOffice" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Integration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'marketplace',
    "platform" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'disconnected',
    "apiKey" TEXT NOT NULL DEFAULT '',
    "apiSecret" TEXT NOT NULL DEFAULT '',
    "shopUrl" TEXT NOT NULL DEFAULT '',
    "storeId" TEXT NOT NULL DEFAULT 'default',
    "config" TEXT NOT NULL DEFAULT '{}',
    "lastSync" DATETIME,
    "syncStats" TEXT NOT NULL DEFAULT '{}',
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "invoiceNumber" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'sales',
    "amount" REAL NOT NULL,
    "tax" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "storeId" TEXT NOT NULL DEFAULT 'default',
    "xmlUrl" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Shipment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "trackingNumber" TEXT NOT NULL DEFAULT '',
    "orderNumber" TEXT NOT NULL,
    "carrier" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "customerName" TEXT NOT NULL,
    "address" TEXT NOT NULL DEFAULT '',
    "storeId" TEXT NOT NULL DEFAULT 'default',
    "labelUrl" TEXT NOT NULL DEFAULT '',
    "cargoCost" REAL NOT NULL DEFAULT 0,
    "weight" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Warehouse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL DEFAULT '',
    "address" TEXT NOT NULL DEFAULT '',
    "capacity" INTEGER NOT NULL DEFAULT 0,
    "usedSpace" INTEGER NOT NULL DEFAULT 0,
    "type" TEXT NOT NULL DEFAULT 'standard',
    "status" TEXT NOT NULL DEFAULT 'active',
    "storeId" TEXT NOT NULL DEFAULT 'default',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "contact" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "address" TEXT NOT NULL DEFAULT '',
    "rating" INTEGER NOT NULL DEFAULT 0,
    "leadTime" INTEGER NOT NULL DEFAULT 0,
    "storeId" TEXT NOT NULL DEFAULT 'default',
    "totalOrders" INTEGER NOT NULL DEFAULT 0,
    "totalSpent" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'discount',
    "marketplace" TEXT NOT NULL DEFAULT '',
    "discount" REAL NOT NULL DEFAULT 0,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "productIds" TEXT NOT NULL DEFAULT '[]',
    "storeId" TEXT NOT NULL DEFAULT 'default',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL DEFAULT '',
    "userName" TEXT NOT NULL DEFAULT '',
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL DEFAULT '',
    "entityId" TEXT NOT NULL DEFAULT '',
    "details" TEXT NOT NULL DEFAULT '',
    "storeId" TEXT NOT NULL DEFAULT 'default',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "BackgroundJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "payload" TEXT NOT NULL DEFAULT '{}',
    "result" TEXT NOT NULL DEFAULT '',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "storeId" TEXT NOT NULL DEFAULT 'default',
    "startedAt" DATETIME,
    "endedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ProductFeed" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'upload',
    "sourceUrl" TEXT NOT NULL DEFAULT '',
    "format" TEXT NOT NULL DEFAULT 'xml',
    "status" TEXT NOT NULL DEFAULT 'active',
    "schedule" TEXT NOT NULL DEFAULT 'manual',
    "lastImport" DATETIME,
    "lastError" TEXT NOT NULL DEFAULT '',
    "totalProducts" INTEGER NOT NULL DEFAULT 0,
    "validProducts" INTEGER NOT NULL DEFAULT 0,
    "errorProducts" INTEGER NOT NULL DEFAULT 0,
    "fieldMapping" TEXT NOT NULL DEFAULT '{}',
    "storeId" TEXT NOT NULL DEFAULT 'default',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PriceRule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "type" TEXT NOT NULL DEFAULT 'markup',
    "baseField" TEXT NOT NULL DEFAULT 'cost',
    "value" REAL NOT NULL DEFAULT 0,
    "valueType" TEXT NOT NULL DEFAULT 'percentage',
    "minMargin" REAL NOT NULL DEFAULT 0,
    "maxPrice" REAL NOT NULL DEFAULT 0,
    "roundTo" REAL NOT NULL DEFAULT 0,
    "marketplace" TEXT NOT NULL DEFAULT '',
    "categoryId" TEXT NOT NULL DEFAULT '',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "storeId" TEXT NOT NULL DEFAULT 'default',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CategoryMapping" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "source" TEXT NOT NULL DEFAULT '',
    "sourceCat" TEXT NOT NULL DEFAULT '',
    "target" TEXT NOT NULL DEFAULT '',
    "targetCat" TEXT NOT NULL DEFAULT '',
    "storeId" TEXT NOT NULL DEFAULT 'default',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ContentRule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'title_template',
    "channel" TEXT NOT NULL DEFAULT 'all',
    "category" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "template" TEXT NOT NULL DEFAULT '',
    "variables" TEXT NOT NULL DEFAULT '{}',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "applyCount" INTEGER NOT NULL DEFAULT 0,
    "lastApplied" DATETIME,
    "storeId" TEXT NOT NULL DEFAULT 'default',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "FeedTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "platform" TEXT NOT NULL DEFAULT '',
    "format" TEXT NOT NULL DEFAULT 'xml',
    "category" TEXT NOT NULL DEFAULT '',
    "fields" TEXT NOT NULL DEFAULT '[]',
    "requirements" TEXT NOT NULL DEFAULT '{}',
    "sampleUrl" TEXT NOT NULL DEFAULT '',
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "rating" REAL NOT NULL DEFAULT 0,
    "storeId" TEXT NOT NULL DEFAULT 'default',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "StockSyncLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL DEFAULT '',
    "productName" TEXT NOT NULL DEFAULT '',
    "sku" TEXT NOT NULL DEFAULT '',
    "channel" TEXT NOT NULL DEFAULT '',
    "oldStock" INTEGER NOT NULL DEFAULT 0,
    "newStock" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'success',
    "error" TEXT NOT NULL DEFAULT '',
    "triggeredBy" TEXT NOT NULL DEFAULT 'manual',
    "storeId" TEXT NOT NULL DEFAULT 'default',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "FeedQualityRule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'required_field',
    "field" TEXT NOT NULL DEFAULT '',
    "condition" TEXT NOT NULL DEFAULT '',
    "severity" TEXT NOT NULL DEFAULT 'error',
    "channel" TEXT NOT NULL DEFAULT 'all',
    "category" TEXT NOT NULL DEFAULT '',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "lastCheck" DATETIME,
    "storeId" TEXT NOT NULL DEFAULT 'default',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PriceHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL DEFAULT '',
    "productName" TEXT NOT NULL DEFAULT '',
    "sku" TEXT NOT NULL DEFAULT '',
    "oldPrice" REAL NOT NULL DEFAULT 0,
    "newPrice" REAL NOT NULL DEFAULT 0,
    "ruleApplied" TEXT NOT NULL DEFAULT '',
    "marketplace" TEXT NOT NULL DEFAULT '',
    "changedBy" TEXT NOT NULL DEFAULT 'auto',
    "storeId" TEXT NOT NULL DEFAULT 'default',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "WebhookEndpoint" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "secret" TEXT NOT NULL DEFAULT '',
    "events" TEXT NOT NULL DEFAULT '[]',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "failCount" INTEGER NOT NULL DEFAULT 0,
    "lastTriggered" DATETIME,
    "storeId" TEXT NOT NULL DEFAULT 'default',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Store_code_key" ON "Store"("code");

-- CreateIndex
CREATE UNIQUE INDEX "License_key_key" ON "License"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Return_returnNumber_key" ON "Return"("returnNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");
