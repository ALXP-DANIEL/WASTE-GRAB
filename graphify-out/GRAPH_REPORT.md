# Graph Report - WasteGrab focused code graph  (2026-06-02)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 965 nodes · 1380 edges · 70 communities (49 shown, 21 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.97)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `72151ad9`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `tools/graphify/update-codebase-graphify.sh ast|label|deep` after code changes; do not run `graphify update .` from the repo root.

## Community Hubs (Navigation)
- [[_COMMUNITY_Pickup Request UI|Pickup Request UI]]
- [[_COMMUNITY_Auth and User Logic|Auth and User Logic]]
- [[_COMMUNITY_Admin Dashboard UI|Admin Dashboard UI]]
- [[_COMMUNITY_Notification Backend Logic|Notification Backend Logic]]
- [[_COMMUNITY_API Response Models|API Response Models]]
- [[_COMMUNITY_Pickup List UI|Pickup List UI]]
- [[_COMMUNITY_Address Management API|Address Management API]]
- [[_COMMUNITY_User Profile UI|User Profile UI]]
- [[_COMMUNITY_Pickup Data Parsing|Pickup Data Parsing]]
- [[_COMMUNITY_Voucher Management UI|Voucher Management UI]]
- [[_COMMUNITY_Pickup Data Models|Pickup Data Models]]
- [[_COMMUNITY_Admin Test Mocks|Admin Test Mocks]]
- [[_COMMUNITY_Pickup Detail Data|Pickup Detail Data]]
- [[_COMMUNITY_New Pickup Wizard|New Pickup Wizard]]
- [[_COMMUNITY_Pickup Calculation Logic|Pickup Calculation Logic]]
- [[_COMMUNITY_Build Configuration|Build Configuration]]
- [[_COMMUNITY_Auth UI Components|Auth UI Components]]
- [[_COMMUNITY_Admin Pickup List|Admin Pickup List]]
- [[_COMMUNITY_Location Management UI|Location Management UI]]
- [[_COMMUNITY_Waste Category UI|Waste Category UI]]
- [[_COMMUNITY_Voucher Management Logic|Voucher Management Logic]]
- [[_COMMUNITY_Home Dashboard UI|Home Dashboard UI]]
- [[_COMMUNITY_Location Management UI|Location Management UI]]
- [[_COMMUNITY_Auth and AI Logic|Auth and AI Logic]]
- [[_COMMUNITY_Core Services Layer|Core Services Layer]]
- [[_COMMUNITY_Pickup Test Suite|Pickup Test Suite]]
- [[_COMMUNITY_TypeScript Configuration|TypeScript Configuration]]
- [[_COMMUNITY_Customer Dashboard UI|Customer Dashboard UI]]
- [[_COMMUNITY_Google Maps Integration|Google Maps Integration]]
- [[_COMMUNITY_Waste Category Logic|Waste Category Logic]]
- [[_COMMUNITY_Backend Routing and DB|Backend Routing and DB]]
- [[_COMMUNITY_Voucher API Logic|Voucher API Logic]]
- [[_COMMUNITY_Routing and Guards|Routing and Guards]]
- [[_COMMUNITY_Pickup Workflow UI|Pickup Workflow UI]]
- [[_COMMUNITY_User and Location API|User and Location API]]
- [[_COMMUNITY_Collector Service Logic|Collector Service Logic]]
- [[_COMMUNITY_Package Metadata|Package Metadata]]
- [[_COMMUNITY_Voucher API Logic|Voucher API Logic]]
- [[_COMMUNITY_Library Configuration|Library Configuration]]
- [[_COMMUNITY_Project Metadata|Project Metadata]]
- [[_COMMUNITY_TypeScript Configuration|TypeScript Configuration]]
- [[_COMMUNITY_Timeline UI Components|Timeline UI Components]]
- [[_COMMUNITY_Location Service Logic|Location Service Logic]]
- [[_COMMUNITY_User Service Logic|User Service Logic]]
- [[_COMMUNITY_Admin Dashboard Views|Admin Dashboard Views]]
- [[_COMMUNITY_Settings UI|Settings UI]]
- [[_COMMUNITY_Admin API Tests|Admin API Tests]]
- [[_COMMUNITY_Customer API Tests|Customer API Tests]]
- [[_COMMUNITY_Admin Page UI|Admin Page UI]]
- [[_COMMUNITY_Playwright Config|Playwright Config]]
- [[_COMMUNITY_Collector Earnings UI|Collector Earnings UI]]
- [[_COMMUNITY_Rewards Page UI|Rewards Page UI]]
- [[_COMMUNITY_Admin Dashboard|Admin Dashboard]]
- [[_COMMUNITY_Authentication Page|Authentication Page]]
- [[_COMMUNITY_Location Management|Location Management]]
- [[_COMMUNITY_Customer Dashboard|Customer Dashboard]]
- [[_COMMUNITY_Notifications Management|Notifications Management]]

## God Nodes (most connected - your core abstractions)
1. `PickupDetailPage` - 58 edges
2. `CustomerNewPickupPage` - 57 edges
3. `AuthService` - 46 edges
4. `CollectorPickupsPage` - 34 edges
5. `NotificationService` - 31 edges
6. `getCurrentUserFromRequest()` - 27 edges
7. `AdminVouchersPage` - 19 edges
8. `ProfilePage` - 18 edges
9. `customerPickups` - 17 edges
10. `AdminPickupsPage` - 16 edges

## Surprising Connections (you probably didn't know these)
- `CollectorPickupRequest` --calls--> `stringifyDecimal()`  [EXTRACTED]
  libs/shared/types/src/lib/types/pickup.ts → apps/backend/src/routes/collector/pickup.routes.ts
- `requireAdmin()` --calls--> `getCurrentUserFromRequest()`  [EXTRACTED]
  apps/backend/src/routes/admin/location.routes.ts → apps/backend/src/services/auth.service.ts
- `requireAdmin()` --calls--> `getCurrentUserFromRequest()`  [EXTRACTED]
  apps/backend/src/routes/admin/notification.routes.ts → apps/backend/src/services/auth.service.ts
- `requireAdmin()` --calls--> `getCurrentUserFromRequest()`  [EXTRACTED]
  apps/backend/src/routes/admin/pickup.routes.ts → apps/backend/src/services/auth.service.ts
- `AdminPickupRequest` --calls--> `stringifyDecimal()`  [EXTRACTED]
  libs/shared/types/src/lib/types/pickup.ts → apps/backend/src/routes/admin/pickup.routes.ts

## Import Cycles
- None detected.

## Communities (70 total, 21 thin omitted)

### Community 1 - "Auth and User Logic"
Cohesion: 0.07
Nodes (33): isObject(), isPrismaNotFoundError(), notFoundHandler(), authRouter, avatarUpload, AuthService, AuthSession, clearAuthCookie() (+25 more)

### Community 2 - "Admin Dashboard UI"
Cohesion: 0.05
Nodes (30): formatMarkdownSelection(), MarkdownFormat, NotificationFilter, NotificationModalMode, prefixMarkdownLines(), toDate(), toEndOfDayIso(), AdminNotificationLog (+22 more)

### Community 3 - "Notification Backend Logic"
Cohesion: 0.07
Nodes (24): AdminNotificationBatchKey, adminNotificationRouter, normalizeOptionalDate(), normalizeOptionalText(), normalizeText(), requireAdmin(), createNotification(), deleteAllNotifications() (+16 more)

### Community 4 - "API Response Models"
Cohesion: 0.06
Nodes (28): ApiErrorResponse, ApiResponse, HealthResponse, PaginatedResponse, AnalyzeImageResponse, AnalyzeImageResult, DetectedWasteCategory, CollectionLocation (+20 more)

### Community 5 - "Pickup List UI"
Cohesion: 0.08
Nodes (6): PickupFilter, CollectorPickupsPage, CoordinatePair, LocationStatus, RouteFit, RouteFitAnchor

### Community 6 - "Address Management API"
Cohesion: 0.12
Nodes (25): addressRouter, AddressService, deleteAddress(), getAddressById(), listAddress(), setDefaultAddress(), toAddressResponse(), Address (+17 more)

### Community 7 - "User Profile UI"
Cohesion: 0.08
Nodes (5): AddressFilter, AddressItem, AddressModalMode, ProfilePage, ModalMode

### Community 8 - "Pickup Data Parsing"
Cohesion: 0.13
Nodes (26): isLatitude(), isLongitude(), isRecord(), normalizeCoordinatePair(), normalizeOptionalText(), normalizeText(), parseCoordinate(), parseItemsValue() (+18 more)

### Community 9 - "Voucher Management UI"
Cohesion: 0.10
Nodes (8): getErrorMessage(), VoucherTab, AdminVouchersPage, toDate(), toEndOfDayIso(), toStartOfDayIso(), VoucherCatalogFilter, VoucherModalMode

### Community 10 - "Pickup Data Models"
Cohesion: 0.09
Nodes (10): customerPickups, Pickup, PickupCollector, PickupStatus, pickupStatusColors, pickupStatusLabels, PickupTimelineEvent, PickupTimelineStatus (+2 more)

### Community 11 - "Admin Test Mocks"
Cohesion: 0.09
Nodes (9): admin, existingLocation, LocationRecord, AdminUser, existingUser, existingVoucher, Voucher, UserFilter (+1 more)

### Community 13 - "New Pickup Wizard"
Cohesion: 0.08
Nodes (22): AiAutoSnapshot, AiSuggestion, AnalysisSummary, NewPickupForm, PreviewImage, StepMeta, WizardStep, CreatePickupRequestInput (+14 more)

### Community 14 - "Pickup Calculation Logic"
Cohesion: 0.13
Nodes (15): calculateDistanceKm(), CoordinatePair, isLatitude(), isLongitude(), isRecord(), normalizeCoordinatePair(), parseActualWeights(), parseCoordinate() (+7 more)

### Community 15 - "Build Configuration"
Cohesion: 0.10
Nodes (20): executor, options, outputs, name, assets, bundle, command, declaration (+12 more)

### Community 16 - "Auth UI Components"
Cohesion: 0.11
Nodes (4): AuthMode, AuthPage, LoginFormGroup, RegisterFormGroup

### Community 18 - "Location Management UI"
Cohesion: 0.15
Nodes (4): CollectorPage, AdminCollectorsPage, LocationFilter, LocationModalMode

### Community 19 - "Waste Category UI"
Cohesion: 0.13
Nodes (3): AdminWasteCategoriesPage, WasteCategoryFilter, WasteCategoryModalMode

### Community 20 - "Voucher Management Logic"
Cohesion: 0.15
Nodes (4): getErrorMessage(), VoucherTab, Customer Vouchers, Voucher Management

### Community 21 - "Home Dashboard UI"
Cohesion: 0.12
Nodes (11): DashboardStat, DetectedItem, Feature, FooterGroup, HomePage, NavLink, Pickup, Stat (+3 more)

### Community 23 - "Auth and AI Logic"
Cohesion: 0.17
Nodes (8): requireAuthenticatedUser(), RoboflowPrediction, RoboflowResponse, router, upload, getCookieValue(), getCurrentUserFromRequest(), verifySessionToken()

### Community 25 - "Pickup Test Suite"
Cohesion: 0.22
Nodes (9): addresses, categories, customer, imageFile(), MockApiOptions, mockPickupApi(), pickupRequest, TestPickupRequest (+1 more)

### Community 26 - "TypeScript Configuration"
Cohesion: 0.14
Nodes (13): compilerOptions, forceConsistentCasingInFileNames, importHelpers, module, noFallthroughCasesInSwitch, noImplicitOverride, noImplicitReturns, noPropertyAccessFromIndexSignature (+5 more)

### Community 28 - "Google Maps Integration"
Cohesion: 0.26
Nodes (11): AddressComponents, assertGoogleStatus(), autocompletePlaces(), buildAddressLine(), getComponents(), getGoogleMapsApiKey(), getPlaceDetails(), GoogleAutocompleteResponse (+3 more)

### Community 29 - "Waste Category Logic"
Cohesion: 0.17
Nodes (5): requireAdmin(), admin, plasticCategory, CreateWasteCategoryInput, UpdateWasteCategoryInput

### Community 30 - "Backend Routing and DB"
Cohesion: 0.24
Nodes (8): pickupRouter, requireAdmin(), stringifyDecimal(), wasteCategoryRouter, adapter, databaseUrl, prisma, AdminPickupRequest

### Community 31 - "Voucher API Logic"
Cohesion: 0.20
Nodes (3): normalizeNonNegativeInteger(), normalizeNullableNonNegativeInteger(), requireAdmin()

### Community 32 - "Routing and Guards"
Cohesion: 0.24
Nodes (7): ROUTE_PATHS, routePath(), RoutePathSegment, LazyPage, RouteConfig, routes, guestGuard()

### Community 33 - "Pickup Workflow UI"
Cohesion: 0.18
Nodes (8): AcceptPickupDialogComponent, AcceptPickupDialogData, AcceptPickupRouteStop, AiSuggestedPayload, PICKUP_STATUS_FLOW, PickupDetail, PickupDetailContext, TimelineStepState

### Community 35 - "User and Location API"
Cohesion: 0.27
Nodes (5): requireAdmin(), requireAdmin(), userRouter, getBody(), isObject()

### Community 36 - "Collector Service Logic"
Cohesion: 0.20
Nodes (3): CollectorLocation, CollectorPickupScope, VerifyPickupItemInput

### Community 37 - "Package Metadata"
Cohesion: 0.25
Nodes (8): exports, import, main, name, private, type, types, version

### Community 38 - "Voucher API Logic"
Cohesion: 0.29
Nodes (4): RedeemVoucherError, toCustomerRedemptionResponse(), toVoucherResponse(), voucherRouter

### Community 39 - "Library Configuration"
Cohesion: 0.25
Nodes (7): compilerOptions, declaration, outDir, types, exclude, extends, include

### Community 40 - "Project Metadata"
Cohesion: 0.33
Nodes (6): name, nx, projectType, tags, private, version

### Community 41 - "TypeScript Configuration"
Cohesion: 0.29
Nodes (6): compilerOptions, outDir, types, exclude, extends, include

### Community 47 - "Admin Dashboard Views"
Cohesion: 0.40
Nodes (6): Collector Pickup Dashboard, Customer Pickup History, Pickup Detail View, Pickup Requests (Admin), User Management, Waste Categories Management

## Knowledge Gaps
- **238 isolated node(s):** `app`, `port`, `authCookieSameSite`, `databaseUrl`, `adapter` (+233 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **21 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `CustomerNewPickupPage` connect `Pickup Request UI` to `Pickup Data Parsing`, `New Pickup Wizard`, `AI Estimation Logic`?**
  _High betweenness centrality (0.104) - this node is a cross-community bridge._
- **Why does `PickupDetailPage` connect `Pickup Detail Data` to `Pickup Workflow UI`, `Route Stop Logic`, `Collector Action Logic`, `Timeline UI Components`, `AI Estimation Logic`, `Pickup Fetching Logic`?**
  _High betweenness centrality (0.082) - this node is a cross-community bridge._
- **Why does `AuthService` connect `Auth and User Logic` to `Routing and Guards`, `Admin Dashboard UI`, `Auth and AI Logic`, `Core Services Layer`, `Backend Routing and DB`?**
  _High betweenness centrality (0.066) - this node is a cross-community bridge._
- **What connects `app`, `port`, `authCookieSameSite` to the rest of the system?**
  _238 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Pickup Request UI` be split into smaller, more focused modules?**
  _Cohesion score 0.06531986531986532 - nodes in this community are weakly interconnected._
- **Should `Auth and User Logic` be split into smaller, more focused modules?**
  _Cohesion score 0.07127882599580712 - nodes in this community are weakly interconnected._
- **Should `Admin Dashboard UI` be split into smaller, more focused modules?**
  _Cohesion score 0.052525252525252523 - nodes in this community are weakly interconnected._
