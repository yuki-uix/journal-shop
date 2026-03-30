# Journal Shop — MVP Scope

> **目标**：以 Shopify Developer Plan（免费）为训练靶场，搭建 journal-shop 的完整电商链路。  
> **双视角**：消费者前台（Storefront）+ 商家后台（Admin）  
> **技术栈**：Next.js (App Router) + Tailwind CSS + Shopify Storefront/Admin API + Vercel  
> **开发原则**：链路优先，UI 后补；先跑通数据流，再打磨样式。

---

## 环境准备

### Shopify Partner 账号（免费）

```
1. 注册 https://partners.shopify.com（免费）
2. 创建 Development Store（功能完整，无需真实付款）
3. Admin → Settings → Apps and sales channels → Develop apps
4. 创建 Custom App，配置以下权限：
   - Admin API scopes: read/write products, inventory, orders, customers
   - Storefront API scopes: unauthenticated read products, cart, checkout
5. 获取：
   - Admin API Access Token
   - Storefront API Public Access Token
   - Shop Domain（xxx.myshopify.com）
```

### 环境变量

```env
# .env.local
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_xxxx
NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN=xxxx
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
```

---

## 项目结构

```
journal-shop/
├── .env.local
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # 首页
│   ├── products/
│   │   ├── page.tsx                # 商品列表
│   │   └── [handle]/page.tsx       # 商品详情
│   ├── collections/
│   │   └── [handle]/page.tsx       # 分类页
│   ├── cart/
│   │   └── page.tsx                # 购物车
│   └── admin/                      # 商家后台（训练用）
│       ├── page.tsx                # Admin Dashboard
│       ├── products/page.tsx       # 商品管理
│       └── orders/page.tsx         # 订单管理
├── components/
│   ├── ui/                         # 原子组件（Button, Badge, Card）
│   ├── product/
│   │   ├── ProductCard.tsx
│   │   ├── ProductDetail.tsx
│   │   └── VariantSelector.tsx
│   ├── cart/
│   │   ├── CartDrawer.tsx
│   │   └── CartItem.tsx
│   └── layout/
│       ├── Header.tsx
│       └── Footer.tsx
├── lib/
│   ├── shopify/
│   │   ├── storefront.ts           # Storefront API client
│   │   ├── admin.ts                # Admin API client
│   │   └── queries/                # GraphQL query 文件
│   │       ├── products.ts
│   │       ├── cart.ts
│   │       └── orders.ts
│   └── types/
│       └── shopify.ts              # 类型定义
└── scripts/                        # 独立训练脚本（node 直接运行）
    ├── 01-create-product.ts
    ├── 02-update-inventory.ts
    ├── 03-create-cart.ts
    └── 04-webhook-test.ts
```

---

## 消费者前台（Storefront API）

### 数据模型

```typescript
// lib/types/shopify.ts

interface Product {
  id: string
  handle: string
  title: string
  description: string
  tags: string[]                    // 风格标签：简约 / 森系 / 文艺 / 可爱
  priceRange: {
    minVariantPrice: { amount: string; currencyCode: string }
  }
  images: { edges: { node: { url: string; altText: string } }[] }
  variants: { edges: { node: Variant }[] }
}

interface Variant {
  id: string
  title: string
  price: { amount: string; currencyCode: string }
  availableForSale: boolean
  selectedOptions: { name: string; value: string }[]
}

interface Cart {
  id: string
  checkoutUrl: string
  totalQuantity: number
  cost: { totalAmount: { amount: string; currencyCode: string } }
  lines: { edges: { node: CartLine }[] }
}

interface CartLine {
  id: string
  quantity: number
  merchandise: Variant & { product: Pick<Product, 'title' | 'images'> }
}
```

### API Client 封装

```typescript
// lib/shopify/storefront.ts

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN
const token = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN
const endpoint = `https://${domain}/api/2024-01/graphql.json`

export async function storefrontFetch<T>(query: string, variables?: object): Promise<T> {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token!,
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 60 },     // ISR：商品数据每 60s 重新验证
  })
  const { data, errors } = await res.json()
  if (errors) throw new Error(errors[0].message)
  return data
}
```

### 页面与功能清单

#### 首页 `/`

- [ ] Hero 区块：一句话定位 + CTA 按钮（"找到你的第一套手帐"）
- [ ] 风格入口：3～4 张风格卡片（按 tag 筛选商品）
- [ ] 精选套装区（is_bundle tag 筛选）
- [ ] 单品分区：本子 / 贴纸 / 笔

#### 商品列表 `/products`

- [ ] 获取全部商品（`products` query，分页 cursor）
- [ ] 按分类（Collection）筛选
- [ ] 按标签筛选（简约 / 森系 / 文艺 / 可爱）
- [ ] ProductCard 展示：图片 + 名称 + 价格 + 售罄状态

#### 商品详情 `/products/[handle]`

- [ ] 商品主图 + 图片切换
- [ ] Variant 选择器（尺寸 / 颜色），选中后价格同步更新
- [ ] 库存状态显示（`availableForSale`）
- [ ] 加入购物车按钮（调用 Cart API）
- [ ] 套装说明（如有 bundle 描述）

#### 购物车

- [ ] CartDrawer（侧滑抽屉，客户端组件）
- [ ] 数量加减 / 删除行
- [ ] 小计实时更新
- [ ] "前往结账"按钮（跳转 `cart.checkoutUrl`，Shopify 托管结账页）

> ⚠️ **结账页由 Shopify 托管**，MVP 阶段不自建结账流程。

#### Cart API 操作

```typescript
// 核心操作：create / addLines / updateLines / removeLines
cartCreate(input)         // 创建购物车，返回 cartId
cartLinesAdd(cartId, lines)
cartLinesUpdate(cartId, lines)
cartLinesRemove(cartId, lineIds)
```

---

## 商家后台（Admin API）

> 以 Admin Dashboard（`/admin`）作为训练界面，直接调用 Admin API 感受工业级数据结构。

### API Client 封装

```typescript
// lib/shopify/admin.ts
// ⚠️ 仅服务端调用，Token 不可暴露到客户端

const domain = process.env.SHOPIFY_STORE_DOMAIN
const token = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN
const endpoint = `https://${domain}/admin/api/2024-01/graphql.json`

export async function adminFetch<T>(query: string, variables?: object): Promise<T> {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token!,
    },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store',             // 后台数据不缓存
  })
  const { data, errors } = await res.json()
  if (errors) throw new Error(errors[0].message)
  return data
}
```

### 商品管理 `/admin/products`

#### 数据操作

```typescript
// 查询商品列表（含库存）
GET products(first: 20) {
  id, title, handle, status,
  variants { inventoryQuantity, price }
}

// 创建商品
productCreate(input: {
  title, descriptionHtml, vendor, productType,
  tags, status: DRAFT | ACTIVE,
  variants: [{ price, sku, inventoryQuantagement: SHOPIFY }]
})

// 更新商品
productUpdate(input: { id, title, tags, status })

// 上架 / 下架
productUpdate(input: { id, status: ACTIVE | DRAFT })
```

#### 页面功能

- [ ] 商品列表：标题 / 状态 / 库存 / 价格
- [ ] 新建商品表单（调用 `productCreate` mutation）
- [ ] 编辑商品（调用 `productUpdate` mutation）
- [ ] 上架 / 下架切换

#### 库存管理

```typescript
// 获取库存层级（需要 locationId）
inventoryLevel(inventoryItemId, locationId) { available }

// 调整库存
inventoryAdjustQuantity(input: {
  inventoryLevelId,
  availableDelta        // 正数增加，负数减少
})
```

- [ ] 库存数量显示与手动调整
- [ ] 售罄商品标记

### 订单管理 `/admin/orders`

#### 数据操作

```typescript
// 查询订单
orders(first: 20, query: "status:open") {
  id, name, createdAt,
  financialStatus,      // PAID | PENDING | REFUNDED
  fulfillmentStatus,    // FULFILLED | UNFULFILLED | PARTIAL
  totalPriceSet { shopMoney { amount } }
  lineItems { title, quantity, originalUnitPrice }
  customer { firstName, lastName, email }
}
```

#### 页面功能

- [ ] 订单列表：订单号 / 客户 / 金额 / 支付状态 / 发货状态
- [ ] 订单详情展开：商品明细 / 收货地址
- [ ] 手动标记发货（`fulfillmentCreate` mutation，MVP 阶段）

#### 订单状态流转（需理解）

```
待支付(PENDING) → 已支付(PAID) → 已发货(FULFILLED) → 完成
                              → 部分发货(PARTIAL)
       ↓
  已取消(VOIDED)
```

### Webhook 事件驱动（进阶训练）

```typescript
// 订阅的核心事件
orders/create       // 新订单创建 → 触发发货提醒
orders/paid         // 支付完成 → 触发库存扣减确认
products/update     // 商品更新 → 触发缓存重新验证
inventory_levels/update  // 库存变更 → 前台售罄状态同步

// Webhook 处理端点
app/api/webhooks/orders/route.ts
app/api/webhooks/products/route.ts
```

- [ ] 注册 Webhook（Admin API `webhookSubscriptionCreate`）
- [ ] 本地 Webhook 接收（用 ngrok 暴露本地端口）
- [ ] 验证 HMAC 签名（安全基础）

---

## 训练脚本（scripts/）

> 脱离 UI，直接感受 API 数据结构。用 `ts-node scripts/xxx.ts` 运行。

```typescript
// 01-create-product.ts — 理解 Product + Variant + Option 数据模型
// 02-update-inventory.ts — 理解 locationId + inventoryLevel 设计
// 03-create-cart.ts — 理解 Storefront Cart token 机制
// 04-webhook-test.ts — 本地注册 + 接收 Webhook 事件
```

---

## MVP 功能优先级

### Must Have（上线前必须）

| 功能 | 视角 | 链路 |
|---|---|---|
| 商品展示（列表 + 详情） | 前台 | Storefront products query |
| Variant 选择 + 价格更新 | 前台 | Storefront variants |
| 购物车（增删改） | 前台 | Storefront Cart API |
| 结账跳转 | 前台 | checkoutUrl |
| 库存状态（售罄显示） | 前台 | availableForSale |
| 商品创建 / 编辑 | 后台 | Admin productCreate/Update |
| 订单列表查看 | 后台 | Admin orders query |

### Should Have（第二轮迭代）

| 功能 | 说明 |
|---|---|
| 分类（Collection）筛选 | Admin 建 Collection，Storefront 读取 |
| 套装（Bundle）展示 | 用 tag 标记 + 自定义描述实现 |
| Webhook 订单通知 | 事件驱动训练 |
| 库存手动调整 | Admin inventoryAdjustQuantity |

### Won't Have（MVP 不做）

- 用户账号系统 / 会员
- 商品评价
- 多语言
- 营销折扣码
- 自建结账页

---

## 验收标准（Definition of Done）

### 前台链路

- [ ] 从首页能找到商品并成功跳转结账页（端到端通）
- [ ] Variant 切换时价格与库存状态正确更新
- [ ] 购物车数量实时反映，刷新后保持（localStorage 存 cartId）
- [ ] 商品库存为 0 时，加购按钮禁用，显示"售罄"
- [ ] 移动端首页、商品页、购物车无布局错位

### 后台链路

- [ ] 能通过 Admin Dashboard 创建一个新商品并在前台看到
- [ ] 能查看订单列表，数据与 Shopify 后台一致
- [ ] 能手动调整库存，前台售罄状态同步更新

### 技术基线

- [ ] Admin Token 不暴露到客户端（仅 Server Component / API Route 调用）
- [ ] GraphQL 查询按需取字段，无过度 fetch
- [ ] 商品图片使用 Next.js `<Image>` 组件优化

---

## 已知技术债（记录，不阻塞）

| 债务 | 影响 | 后续处理时机 |
|---|---|---|
| 无用户账号系统 | 订单历史无法查询 | 第三轮迭代 |
| Bundle 用 tag 模拟 | 无法做真正的套装库存联动 | 接入 Shopify Bundles App |
| Webhook 无持久化 | 事件丢失无法回溯 | 接入 DB 后处理 |
| Admin 页面无鉴权 | 仅训练用，生产不可用 | 生产化时加 NextAuth |

---

## 推荐学习顺序

```
Week 1  商品域      create-product 脚本 → 前台商品列表/详情页
Week 2  购物链路    Cart API → CartDrawer → checkoutUrl 跳转
Week 3  订单域      Admin orders query → 订单列表页
Week 4  事件驱动    Webhook 注册 → 本地接收 → HMAC 验证
```

---

*Last updated: 2026-03-30 | Stack: Next.js App Router · Tailwind CSS · Shopify API 2024-01 · Vercel*