#!/bin/bash
git restore libs/database/prisma/schema.prisma

sed -i '/warehouses_list            Warehouse\[\]/a\
  feedTemplates              FeedTemplate\[\]\
  contentRules               ContentRule\[\]\
  feedQualityRules           FeedQualityRule\[\]\
  abTests                    AbTest\[\]\
' libs/database/prisma/schema.prisma

cat << 'INNER_EOF' >> libs/database/prisma/schema.prisma

// ========== FEED TEMPLATES ==========
model FeedTemplate {
  id            String       @id @default(uuid())
  name          String
  description   String       @default("")
  platform      String       @default("")
  format        String       @default("xml")
  category      String       @default("")
  fields        Json         @default("[]")
  requirements  Json         @default("{}")
  sampleUrl     String       @default("")
  isPopular     Boolean      @default(false)
  downloadCount Int          @default(0)
  rating        Float        @default(0)
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
  channelId     String
  channel       SalesChannel @relation(fields: [channelId], references: [id])
}

// ========== CONTENT RULES (İçerik Optimizasyonu) ==========
model ContentRule {
  id            String       @id @default(uuid())
  name          String
  type          String       @default("title_template")
  targetChannel String       @default("all")
  category      String       @default("")
  description   String       @default("")
  template      String       @default("")
  variables     Json         @default("{}")
  isActive      Boolean      @default(true)
  priority      Int          @default(0)
  applyCount    Int          @default(0)
  lastApplied   DateTime?
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
  channelId     String
  channel       SalesChannel @relation(fields: [channelId], references: [id])
}

// ========== FEED QUALITY RULE ==========
model FeedQualityRule {
  id            String       @id @default(uuid())
  name          String
  type          String       @default("required_field")
  field         String       @default("")
  condition     String       @default("")
  severity      String       @default("error")
  targetChannel String       @default("all")
  category      String       @default("")
  isActive      Boolean      @default(true)
  errorCount    Int          @default(0)
  lastCheck     DateTime?
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
  channelId     String
  channel       SalesChannel @relation(fields: [channelId], references: [id])
}

// ========== AB TEST (A/B Testi) ==========
model AbTest {
  id           String       @id @default(uuid())
  name         String
  description  String       @default("")
  type         String       @default("feed")
  marketplace  String       @default("")
  variantA     Json         @default("{}")
  variantB     Json         @default("{}")
  metric       String       @default("conversion")
  impressionsA Int          @default(0)
  impressionsB Int          @default(0)
  clicksA      Int          @default(0)
  clicksB      Int          @default(0)
  conversionsA Int          @default(0)
  conversionsB Int          @default(0)
  winner       String       @default("")
  confidence   Float        @default(0)
  status       String       @default("running")
  startDate    DateTime?
  endDate      DateTime?
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt
  channelId    String
  channel      SalesChannel @relation(fields: [channelId], references: [id])
}
INNER_EOF
