# SMART JEWELLERY INVENTORY OS - Technical Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                   Frontend Layer (Next.js)                 │
│              ┌──────────────────────────────┐              │
│              │    Mobile-First UI (PWA)     │              │
│              │  • Luxury Dark Theme         │              │
│              │  • Responsive Design         │              │
│              │  • Fast Performance          │              │
│              └──────────────────────────────┘              │
├─────────────────────────────────────────────────────────────┤
│              API Layer (Next.js Routes)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Inventory   │  │    Audit     │  │     AI       │     │
│  │   Routes    │  │   Routes     │  │   Routes    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
├─────────────────────────────────────────────────────────────┤
│         Backend Layer (Supabase + PostgreSQL)              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         PostgreSQL Database                         │  │
│  │  • Users  • Inventory  • Audits  • Logs            │  │
│  │  • Tenants • Subscriptions • Images               │  │
│  └──────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│         External Services Integration                      │
│  ┌────────────────┐  ┌────────────────┐                   │
│  │  OpenRouter    │  │   Supabase     │                   │
│  │  (Claude AI)   │  │  (Auth/Storage)│                   │
│  └────────────────┘  └────────────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Technology Stack Details

### Frontend (Next.js 14 App Router)

```
pages/
├── (auth)
│   └── login/              - Login page
├── (dashboard)
│   ├── dashboard/          - Main dashboard
│   ├── inventory/          - Inventory management
│   ├── audit/              - Audit system
│   └── settings/           - Settings
└── api/                    - API routes
    ├── inventory/          - CRUD operations
    ├── audit/              - Audit logic
    └── ai/                 - AI integration
```

### State Management (Zustand)

```typescript
// Auth Store
- user: Current authenticated user
- tenant: Current business/organization
- setUser(), setTenant(), logout()

// Inventory Store
- inventory: Array of items
- setInventory(), addItem(), updateItem(), deleteItem()
```

### Component Architecture

```
components/
├── inventory/
│   ├── InventoryCard.tsx       - Product display card
│   ├── InventoryForm.tsx       - Add/edit form
│   ├── ImageUpload.tsx         - Camera/upload handler
│   └── AISuggestions.tsx       - AI suggestions display
├── audit/
│   └── AuditComparison.tsx     - Mismatch display
└── dashboard/
    └── DashboardStats.tsx      - KPI cards
```

### Database Schema

```sql
users                 - User accounts (owner, staff, super_admin)
tenants              - Businesses/organizations
inventory            - Product items
inventory_images     - Product photos (multi-image support)
audit_logs           - Audit history & mismatch tracking
activity_logs        - User action history
subscriptions        - Billing & plan info
```

---

## Data Flow Diagrams

### Inventory Addition Flow

```
User Captures Image
    ↓
[Image Upload] → Supabase Storage
    ↓
[AI Analysis] → OpenRouter API (Claude)
    ↓
AI Returns: {product_name, category, confidence}
    ↓
[User Reviews] → Approves/edits suggestions
    ↓
[Save to Database] → Supabase inventory table
    ↓
✓ Complete
```

### Audit Flow

```
User Enters Physical Count
    ↓
[API Compare] → Fetch recorded inventory
    ↓
AI Calculates Mismatches & Severity
    ↓
[Display Results] → Color-coded severity levels
    ↓
User Reviews & Approves
    ↓
[Update Inventory] → Adjust quantities
    ↓
[Log Audit] → Save to audit_logs
    ↓
✓ Complete
```

---

## Security Architecture

### Row-Level Security (RLS)

```sql
-- Users can only access own tenant data
SELECT * FROM inventory
WHERE tenant_id IN (
  SELECT tenant_id FROM users WHERE id = auth.uid()
)
```

### Authentication Flow

```
1. User enters credentials
2. Supabase Auth validates
3. JWT token issued
4. Token stored client-side
5. All API requests include JWT
6. Backend validates token
7. RLS policies enforced
```

### Data Isolation

```
Tenant 1              Tenant 2
├── Owner 1           ├── Owner 2
├── Staff 1-5         ├── Staff 6-10
└── Inventory 1-100   └── Inventory 101-200
   (No access)           (No access)
```

---

## API Route Structure

### Inventory Endpoints

```
GET    /api/inventory              → List all items
POST   /api/inventory              → Create item
PUT    /api/inventory/:id          → Update item
DELETE /api/inventory/:id          → Soft delete item

Request/Response:
POST /api/inventory
{
  "product_name": "Gold Ring",
  "category": "Ring",
  "gross_weight": 5.2,
  "quantity": 10,
  "purchase_price": 15000,
  "selling_price": 20000,
  "vendor": "ABC Jewelry",
  "storage_location": "Shelf A1",
  "notes": "18K gold"
}

Response (201):
{
  "id": "uuid",
  "tenant_id": "uuid",
  "product_name": "Gold Ring",
  "category": "Ring",
  ...
  "created_at": "2024-01-01T00:00:00Z"
}
```

### Audit Endpoints

```
POST /api/audit/compare            → Compare inventory
POST /api/audit/approve            → Approve changes
GET  /api/audit                     → List audit history

Request:
POST /api/audit/compare
{
  "items": [
    { "product_id": "uuid", "physical_count": 8 },
    { "product_id": "uuid", "physical_count": 5 }
  ]
}

Response:
{
  "mismatches": [
    {
      "inventory_id": "uuid",
      "product_name": "Gold Ring",
      "recorded_quantity": 10,
      "physical_quantity": 8,
      "difference": -2,
      "severity": "orange"
    }
  ]
}
```

### AI Analysis Endpoints

```
POST /api/ai/analyze               → Analyze image

Request:
POST /api/ai/analyze
{
  "imageBase64": "data:image/jpeg;base64,..."
}

Response:
{
  "product_name": "Gold Ring",
  "category": "Ring",
  "confidence": 92,
  "material": "Gold",
  "notes": "18K purity visible"
}
```

---

## Performance Optimization

### Frontend

- **Code Splitting**: Route-based code splitting in Next.js
- **Image Optimization**: next/image for automatic resizing
- **Caching**: SWR for API calls with automatic revalidation
- **Compression**: Gzip compression enabled

### Database

- **Indexes**: Created on frequently queried columns
- **Pagination**: API returns paginated results
- **Connection Pooling**: Supabase handles connections

### Images

- **Compression**: Server-side image optimization
- **CDN**: Supabase storage uses CDN
- **Responsive**: Multiple sizes generated

---

## Deployment Architecture

### Development

```
Local Machine
├── Node.js environment
├── .env.local with credentials
└── npm run dev
```

### Production (Vercel + Supabase)

```
GitHub Repository
    ↓
[Push Code]
    ↓
Vercel (Auto Deploy)
├── Build: npm run build
├── Deploy: Serverless functions
├── Edge: Next.js Edge Runtime
└── CDN: Global distribution
    ↓
Live at: https://your-project.vercel.app
```

---

## Monitoring & Analytics

### Application Monitoring

- Vercel Analytics: Performance metrics
- Error tracking: Sentry integration ready
- User analytics: PostHog ready

### Database Monitoring

- Supabase dashboard: Real-time metrics
- Query performance: PostgreSQL slow query log
- Storage usage: Monitor image storage

---

## Scalability Considerations

### Current Capacity

- Users per tenant: Unlimited
- Inventory items: 10,000+ (tested)
- Images per item: Multiple
- Concurrent users: Supabase handles auto-scaling

### Future Scaling

- Implement Redis caching
- Add webhook system
- Database sharding if needed
- CDN optimization

---

## Security Checklist

- [x] Row-level security enabled
- [x] Environment variables protected
- [x] HTTPS enforced
- [x] CSRF protection
- [x] Rate limiting ready
- [x] SQL injection prevention (parameterized queries)
- [x] XSS protection (React escapes by default)
- [x] Audit logging enabled

---

## Development Workflow

### Adding a New Feature

1. Create feature branch: `git checkout -b feature/my-feature`
2. Develop locally: `npm run dev`
3. Test thoroughly
4. Commit changes: `git commit -m "feat: my-feature"`
5. Push to GitHub: `git push origin feature/my-feature`
6. Create Pull Request
7. Vercel auto-deploys preview
8. Merge to main
9. Vercel auto-deploys production

---

## Troubleshooting Guide

### Common Issues

**Issue**: Database connection fails
- Solution: Check Supabase credentials in .env.local

**Issue**: Images not uploading
- Solution: Verify Supabase storage bucket permissions

**Issue**: AI analysis not working
- Solution: Check OpenRouter API key and usage limits

**Issue**: Slow performance
- Solution: Check network tab in DevTools, review database indexes

---

## Support & Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [React Documentation](https://react.dev)