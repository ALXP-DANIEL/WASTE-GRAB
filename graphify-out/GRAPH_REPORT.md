# Graph Report - WasteGrab focused code graph  (2026-06-02)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 820 nodes · 1163 edges · 56 communities (42 shown, 14 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `120108e7`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `tools/graphify/update-codebase-graphify.sh ast|label|deep` after code changes; do not run `graphify update .` from the repo root.

## Community Hubs (Navigation)
- [[_COMMUNITY_Pickup Request UI|Pickup Request UI]]
- [[_COMMUNITY_Core Services|Core Services]]
- [[_COMMUNITY_Authentication Logic|Authentication Logic]]
- [[_COMMUNITY_Address Management|Address Management]]
- [[_COMMUNITY_API Response Models|API Response Models]]
- [[_COMMUNITY_Notification UI|Notification UI]]
- [[_COMMUNITY_Notification Logic|Notification Logic]]
- [[_COMMUNITY_User Profile Management|User Profile Management]]
- [[_COMMUNITY_Pickup Data Models|Pickup Data Models]]
- [[_COMMUNITY_Voucher Admin UI|Voucher Admin UI]]
- [[_COMMUNITY_Admin Test Mocks|Admin Test Mocks]]
- [[_COMMUNITY_Customer Dashboard UI|Customer Dashboard UI]]
- [[_COMMUNITY_Pickup Routing Logic|Pickup Routing Logic]]
- [[_COMMUNITY_Voucher Backend Services|Voucher Backend Services]]
- [[_COMMUNITY_Build Configuration|Build Configuration]]
- [[_COMMUNITY_Auth UI Flow|Auth UI Flow]]
- [[_COMMUNITY_Admin Pickup Management|Admin Pickup Management]]
- [[_COMMUNITY_Location Management UI|Location Management UI]]
- [[_COMMUNITY_Waste Category Admin|Waste Category Admin]]
- [[_COMMUNITY_Home Dashboard UI|Home Dashboard UI]]
- [[_COMMUNITY_Collection Location Management|Collection Location Management]]
- [[_COMMUNITY_Middleware and AI|Middleware and AI]]
- [[_COMMUNITY_Pickup Integration Tests|Pickup Integration Tests]]
- [[_COMMUNITY_TypeScript Configuration|TypeScript Configuration]]
- [[_COMMUNITY_Google Maps Services|Google Maps Services]]
- [[_COMMUNITY_Waste Category Logic|Waste Category Logic]]
- [[_COMMUNITY_Customer Voucher UI|Customer Voucher UI]]
- [[_COMMUNITY_Voucher Routing Logic|Voucher Routing Logic]]
- [[_COMMUNITY_Routing and Guards|Routing and Guards]]
- [[_COMMUNITY_Database and Routing|Database and Routing]]
- [[_COMMUNITY_Package Metadata|Package Metadata]]
- [[_COMMUNITY_Admin Pickup API|Admin Pickup API]]
- [[_COMMUNITY_Voucher Business Logic|Voucher Business Logic]]
- [[_COMMUNITY_Library Configuration|Library Configuration]]
- [[_COMMUNITY_Admin Notification Routing|Admin Notification Routing]]
- [[_COMMUNITY_Project Metadata|Project Metadata]]
- [[_COMMUNITY_TypeScript Configuration|TypeScript Configuration]]
- [[_COMMUNITY_System Domain Overview|System Domain Overview]]
- [[_COMMUNITY_Error Handling Logic|Error Handling Logic]]
- [[_COMMUNITY_User Settings UI|User Settings UI]]
- [[_COMMUNITY_Admin API Tests|Admin API Tests]]
- [[_COMMUNITY_Customer API Tests|Customer API Tests]]
- [[_COMMUNITY_Admin Page Root|Admin Page Root]]
- [[_COMMUNITY_Collector Pickup UI|Collector Pickup UI]]
- [[_COMMUNITY_Playwright Configuration|Playwright Configuration]]
- [[_COMMUNITY_Collector Earnings UI|Collector Earnings UI]]
- [[_COMMUNITY_Rewards Page UI|Rewards Page UI]]
- [[_COMMUNITY_Admin Dashboard Root|Admin Dashboard Root]]
- [[_COMMUNITY_Location Management Root|Location Management Root]]
- [[_COMMUNITY_Notification Management Root|Notification Management Root]]

## God Nodes (most connected - your core abstractions)
1. `CustomerNewPickupPage` - 57 edges
2. `AuthService` - 46 edges
3. `NotificationService` - 30 edges
4. `getCurrentUserFromRequest()` - 25 edges
5. `AdminVouchersPage` - 19 edges
6. `customerPickups` - 18 edges
7. `ProfilePage` - 18 edges
8. `AdminPickupsPage` - 16 edges
9. `AddressService` - 16 edges
10. `AuthPage` - 15 edges

## Surprising Connections (you probably didn't know these)
- `requireAdmin()` --calls--> `getCurrentUserFromRequest()`  [EXTRACTED]
  apps/backend/src/routes/admin/notification.routes.ts → apps/backend/src/services/auth.service.ts
- `requireAdmin()` --calls--> `getCurrentUserFromRequest()`  [EXTRACTED]
  apps/backend/src/routes/admin/pickup.routes.ts → apps/backend/src/services/auth.service.ts
- `AdminPickupRequest` --calls--> `stringifyDecimal()`  [EXTRACTED]
  libs/shared/types/src/lib/types/pickup.ts → apps/backend/src/routes/admin/pickup.routes.ts
- `requireAdmin()` --calls--> `getCurrentUserFromRequest()`  [EXTRACTED]
  apps/backend/src/routes/admin/user.routes.ts → apps/backend/src/services/auth.service.ts
- `requireAdmin()` --calls--> `getCurrentUserFromRequest()`  [EXTRACTED]
  apps/backend/src/routes/admin/voucher.routes.ts → apps/backend/src/services/auth.service.ts

## Import Cycles
- None detected.

## Communities (56 total, 14 thin omitted)

### Community 1 - "Core Services"
Cohesion: 0.05
Nodes (3): environment, LocationRecord, UserService

### Community 2 - "Authentication Logic"
Cohesion: 0.09
Nodes (28): authRouter, avatarUpload, AuthService, AuthSession, clearAuthCookie(), completeCustomerOnboarding(), createAuthCookie(), createPasswordResetToken() (+20 more)

### Community 3 - "Address Management"
Cohesion: 0.11
Nodes (27): addressRouter, AddressService, deleteAddress(), getAddressById(), listAddress(), setDefaultAddress(), toAddressResponse(), Address (+19 more)

### Community 4 - "API Response Models"
Cohesion: 0.06
Nodes (32): ApiErrorResponse, ApiResponse, HealthResponse, PaginatedResponse, AiAutoSnapshot, AiSuggestion, AnalysisSummary, NewPickupForm (+24 more)

### Community 5 - "Notification UI"
Cohesion: 0.06
Nodes (26): NotificationFilter, NotificationModalMode, toEndOfDayIso(), AdminNotificationLog, ListAdminNotificationLogsResponse, ListNotificationsResponse, NotificationRecipientRole, NotificationResponse (+18 more)

### Community 6 - "Notification Logic"
Cohesion: 0.09
Nodes (20): createNotification(), deleteAllNotifications(), deleteNotification(), hashEndpoint(), isWebPushConfigured, markAllNotificationsRead(), markNotificationRead(), NotificationInput (+12 more)

### Community 7 - "User Profile Management"
Cohesion: 0.08
Nodes (5): AddressFilter, AddressItem, AddressModalMode, ProfilePage, ModalMode

### Community 8 - "Pickup Data Models"
Cohesion: 0.09
Nodes (10): customerPickups, Pickup, PickupCollector, PickupStatus, pickupStatusColors, pickupStatusLabels, PickupTimelineEvent, PickupTimelineStatus (+2 more)

### Community 9 - "Voucher Admin UI"
Cohesion: 0.10
Nodes (8): getErrorMessage(), VoucherTab, AdminVouchersPage, toDate(), toEndOfDayIso(), toStartOfDayIso(), VoucherCatalogFilter, VoucherModalMode

### Community 10 - "Admin Test Mocks"
Cohesion: 0.09
Nodes (9): admin, existingLocation, LocationRecord, AdminUser, existingUser, existingVoucher, Voucher, UserFilter (+1 more)

### Community 11 - "Customer Dashboard UI"
Cohesion: 0.10
Nodes (3): CustomerPage, DashboardStat, CustomerPickupDetailPage

### Community 12 - "Pickup Routing Logic"
Cohesion: 0.15
Nodes (21): isRecord(), normalizeOptionalText(), normalizeText(), parseItemsValue(), parseOptionalJson(), parsePositiveNumber(), parseRequestedItems(), PickupRequestUpload (+13 more)

### Community 13 - "Voucher Backend Services"
Cohesion: 0.10
Nodes (15): AdminPointLedgerLog, AdminVoucherRedemptionLog, CreateVoucherInput, CustomerVoucherCatalogItem, CustomerVoucherListResponse, CustomerVoucherRedemption, PointLedger, PointLedgerStatus (+7 more)

### Community 14 - "Build Configuration"
Cohesion: 0.10
Nodes (20): executor, options, outputs, name, assets, bundle, command, declaration (+12 more)

### Community 15 - "Auth UI Flow"
Cohesion: 0.11
Nodes (4): AuthMode, AuthPage, LoginFormGroup, RegisterFormGroup

### Community 17 - "Location Management UI"
Cohesion: 0.15
Nodes (4): CollectorPage, AdminCollectorsPage, LocationFilter, LocationModalMode

### Community 18 - "Waste Category Admin"
Cohesion: 0.13
Nodes (3): AdminWasteCategoriesPage, WasteCategoryFilter, WasteCategoryModalMode

### Community 19 - "Home Dashboard UI"
Cohesion: 0.12
Nodes (11): DashboardStat, DetectedItem, Feature, FooterGroup, HomePage, NavLink, Pickup, Stat (+3 more)

### Community 21 - "Middleware and AI"
Cohesion: 0.19
Nodes (7): requireAdmin(), requireAuthenticatedUser(), RoboflowPrediction, RoboflowResponse, router, upload, getCurrentUserFromRequest()

### Community 22 - "Pickup Integration Tests"
Cohesion: 0.22
Nodes (9): addresses, categories, customer, imageFile(), MockApiOptions, mockPickupApi(), pickupRequest, TestPickupRequest (+1 more)

### Community 23 - "TypeScript Configuration"
Cohesion: 0.14
Nodes (13): compilerOptions, forceConsistentCasingInFileNames, importHelpers, module, noFallthroughCasesInSwitch, noImplicitOverride, noImplicitReturns, noPropertyAccessFromIndexSignature (+5 more)

### Community 24 - "Google Maps Services"
Cohesion: 0.26
Nodes (11): AddressComponents, assertGoogleStatus(), autocompletePlaces(), buildAddressLine(), getComponents(), getGoogleMapsApiKey(), getPlaceDetails(), GoogleAutocompleteResponse (+3 more)

### Community 25 - "Waste Category Logic"
Cohesion: 0.17
Nodes (5): requireAdmin(), admin, plasticCategory, CreateWasteCategoryInput, UpdateWasteCategoryInput

### Community 26 - "Customer Voucher UI"
Cohesion: 0.21
Nodes (3): getErrorMessage(), VoucherTab, CustomerVouchersPage

### Community 27 - "Voucher Routing Logic"
Cohesion: 0.20
Nodes (3): normalizeNonNegativeInteger(), normalizeNullableNonNegativeInteger(), requireAdmin()

### Community 28 - "Routing and Guards"
Cohesion: 0.24
Nodes (7): ROUTE_PATHS, routePath(), RoutePathSegment, LazyPage, RouteConfig, routes, guestGuard()

### Community 29 - "Database and Routing"
Cohesion: 0.24
Nodes (6): requireAdmin(), userRouter, wasteCategoryRouter, adapter, databaseUrl, prisma

### Community 30 - "Package Metadata"
Cohesion: 0.25
Nodes (8): exports, import, main, name, private, type, types, version

### Community 31 - "Admin Pickup API"
Cohesion: 0.29
Nodes (4): pickupRouter, requireAdmin(), stringifyDecimal(), AdminPickupRequest

### Community 32 - "Voucher Business Logic"
Cohesion: 0.29
Nodes (4): RedeemVoucherError, toCustomerRedemptionResponse(), toVoucherResponse(), voucherRouter

### Community 33 - "Library Configuration"
Cohesion: 0.25
Nodes (7): compilerOptions, declaration, outDir, types, exclude, extends, include

### Community 34 - "Admin Notification Routing"
Cohesion: 0.38
Nodes (5): adminNotificationRouter, normalizeOptionalDate(), normalizeOptionalText(), normalizeText(), requireAdmin()

### Community 35 - "Project Metadata"
Cohesion: 0.33
Nodes (6): name, nx, projectType, tags, private, version

### Community 36 - "TypeScript Configuration"
Cohesion: 0.29
Nodes (6): compilerOptions, outDir, types, exclude, extends, include

### Community 37 - "System Domain Overview"
Cohesion: 0.33
Nodes (6): Customer Pickup Request, Pickup Requests Management, User Roles (Admin, Collector, Customer), User Management, Voucher Management, Waste Categories Management

### Community 38 - "Error Handling Logic"
Cohesion: 0.47
Nodes (4): isObject(), isPrismaNotFoundError(), notFoundHandler(), app

## Knowledge Gaps
- **212 isolated node(s):** `app`, `port`, `authCookieSameSite`, `databaseUrl`, `adapter` (+207 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `CustomerNewPickupPage` connect `Pickup Request UI` to `Customer Dashboard UI`, `API Response Models`, `Pickup Routing Logic`?**
  _High betweenness centrality (0.150) - this node is a cross-community bridge._
- **Why does `removeImages()` connect `Pickup Routing Logic` to `Pickup Request UI`?**
  _High betweenness centrality (0.109) - this node is a cross-community bridge._
- **Why does `AuthService` connect `Authentication Logic` to `Core Services`, `Notification UI`, `Notification Logic`, `Middleware and AI`, `Routing and Guards`, `Database and Routing`?**
  _High betweenness centrality (0.080) - this node is a cross-community bridge._
- **What connects `app`, `port`, `authCookieSameSite` to the rest of the system?**
  _212 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Pickup Request UI` be split into smaller, more focused modules?**
  _Cohesion score 0.06531986531986532 - nodes in this community are weakly interconnected._
- **Should `Core Services` be split into smaller, more focused modules?**
  _Cohesion score 0.05365402405180388 - nodes in this community are weakly interconnected._
- **Should `Authentication Logic` be split into smaller, more focused modules?**
  _Cohesion score 0.08686868686868687 - nodes in this community are weakly interconnected._
