# Graph Report - graphify-focus  (2026-06-02)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 780 nodes · 1117 edges · 61 communities (43 shown, 18 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.77)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0bc32d27`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Pickup Request UI|Pickup Request UI]]
- [[_COMMUNITY_Core Services|Core Services]]
- [[_COMMUNITY_Authentication Logic|Authentication Logic]]
- [[_COMMUNITY_Notification Management|Notification Management]]
- [[_COMMUNITY_Address Management|Address Management]]
- [[_COMMUNITY_Profile UI|Profile UI]]
- [[_COMMUNITY_Pickup Data Parsing|Pickup Data Parsing]]
- [[_COMMUNITY_Admin Dashboard Overview|Admin Dashboard Overview]]
- [[_COMMUNITY_Voucher Management UI|Voucher Management UI]]
- [[_COMMUNITY_Admin Test Mocks|Admin Test Mocks]]
- [[_COMMUNITY_Pickup Creation Wizard|Pickup Creation Wizard]]
- [[_COMMUNITY_Build Configuration|Build Configuration]]
- [[_COMMUNITY_Voucher Transaction Logic|Voucher Transaction Logic]]
- [[_COMMUNITY_Auth UI Components|Auth UI Components]]
- [[_COMMUNITY_Admin Pickup List|Admin Pickup List]]
- [[_COMMUNITY_Home Dashboard UI|Home Dashboard UI]]
- [[_COMMUNITY_Google Places Integration|Google Places Integration]]
- [[_COMMUNITY_Data Models and Types|Data Models and Types]]
- [[_COMMUNITY_Location Management UI|Location Management UI]]
- [[_COMMUNITY_Customer Pickup List|Customer Pickup List]]
- [[_COMMUNITY_Pickup Integration Tests|Pickup Integration Tests]]
- [[_COMMUNITY_Auth and AI Middleware|Auth and AI Middleware]]
- [[_COMMUNITY_Customer Profile View|Customer Profile View]]
- [[_COMMUNITY_TypeScript Configuration|TypeScript Configuration]]
- [[_COMMUNITY_Waste Category Management|Waste Category Management]]
- [[_COMMUNITY_Waste Category Logic|Waste Category Logic]]
- [[_COMMUNITY_Pickup Detail View|Pickup Detail View]]
- [[_COMMUNITY_Admin Notification UI|Admin Notification UI]]
- [[_COMMUNITY_Routing and Guards|Routing and Guards]]
- [[_COMMUNITY_Voucher Logic Layer|Voucher Logic Layer]]
- [[_COMMUNITY_Pickup Data Models|Pickup Data Models]]
- [[_COMMUNITY_Package Metadata|Package Metadata]]
- [[_COMMUNITY_Notification Type Definitions|Notification Type Definitions]]
- [[_COMMUNITY_Voucher Routing Logic|Voucher Routing Logic]]
- [[_COMMUNITY_Admin Pickup API|Admin Pickup API]]
- [[_COMMUNITY_Library Configuration|Library Configuration]]
- [[_COMMUNITY_User Management API|User Management API]]
- [[_COMMUNITY_Admin Notification Routing|Admin Notification Routing]]
- [[_COMMUNITY_Project Metadata|Project Metadata]]
- [[_COMMUNITY_Waste Category API|Waste Category API]]
- [[_COMMUNITY_Settings UI|Settings UI]]
- [[_COMMUNITY_API Response Models|API Response Models]]
- [[_COMMUNITY_Admin Operation Tests|Admin Operation Tests]]
- [[_COMMUNITY_Customer Operation Tests|Customer Operation Tests]]
- [[_COMMUNITY_AI Analysis Models|AI Analysis Models]]
- [[_COMMUNITY_Location Data Models|Location Data Models]]
- [[_COMMUNITY_Place Selection Logic|Place Selection Logic]]
- [[_COMMUNITY_Pickup Filter UI|Pickup Filter UI]]
- [[_COMMUNITY_Admin Page Container|Admin Page Container]]
- [[_COMMUNITY_Collector Pickup List|Collector Pickup List]]
- [[_COMMUNITY_Auth and Shared Types|Auth and Shared Types]]
- [[_COMMUNITY_Playwright Configuration|Playwright Configuration]]
- [[_COMMUNITY_Collector Earnings UI|Collector Earnings UI]]
- [[_COMMUNITY_Rewards Page UI|Rewards Page UI]]
- [[_COMMUNITY_Customer Dashboard UI|Customer Dashboard UI]]

## God Nodes (most connected - your core abstractions)
1. `CustomerNewPickupPage` - 57 edges
2. `AuthService` - 46 edges
3. `NotificationService` - 30 edges
4. `getCurrentUserFromRequest()` - 25 edges
5. `AdminVouchersPage` - 17 edges
6. `customerPickups` - 17 edges
7. `AdminPickupsPage` - 16 edges
8. `AddressService` - 16 edges
9. `Customer Vouchers` - 16 edges
10. `AuthPage` - 15 edges

## Surprising Connections (you probably didn't know these)
- `Authentication Page` --references--> `Shared Types Library`  [INFERRED]
  apps/frontend/src/app/pages/auth/auth.html → libs/shared/types/README.md
- `requireAdmin()` --calls--> `getCurrentUserFromRequest()`  [EXTRACTED]
  apps/backend/src/routes/admin/notification.routes.ts → apps/backend/src/services/auth.service.ts
- `requireAdmin()` --calls--> `getCurrentUserFromRequest()`  [EXTRACTED]
  apps/backend/src/routes/admin/pickup.routes.ts → apps/backend/src/services/auth.service.ts
- `AdminPickupRequest` --calls--> `stringifyDecimal()`  [EXTRACTED]
  libs/shared/types/src/lib/types/pickup.ts → apps/backend/src/routes/admin/pickup.routes.ts
- `requireAdmin()` --calls--> `getCurrentUserFromRequest()`  [EXTRACTED]
  apps/backend/src/routes/admin/user.routes.ts → apps/backend/src/services/auth.service.ts

## Import Cycles
- None detected.

## Communities (61 total, 18 thin omitted)

### Community 1 - "Core Services"
Cohesion: 0.06
Nodes (3): environment, LocationRecord, UserService

### Community 2 - "Authentication Logic"
Cohesion: 0.09
Nodes (26): authRouter, avatarUpload, AuthService, AuthSession, clearAuthCookie(), completeCustomerOnboarding(), createAuthCookie(), createPasswordResetToken() (+18 more)

### Community 3 - "Notification Management"
Cohesion: 0.08
Nodes (25): isObject(), isPrismaNotFoundError(), notFoundHandler(), createNotification(), deleteAllNotifications(), deleteNotification(), hashEndpoint(), isWebPushConfigured (+17 more)

### Community 4 - "Address Management"
Cohesion: 0.12
Nodes (24): addressRouter, AddressService, deleteAddress(), getAddressById(), listAddress(), setDefaultAddress(), toAddressResponse(), CreateAddressInput (+16 more)

### Community 5 - "Profile UI"
Cohesion: 0.09
Nodes (4): AddressItem, AddressModalMode, ProfilePage, ModalMode

### Community 6 - "Pickup Data Parsing"
Cohesion: 0.15
Nodes (21): isRecord(), normalizeOptionalText(), normalizeText(), parseItemsValue(), parseOptionalJson(), parsePositiveNumber(), parseRequestedItems(), PickupRequestUpload (+13 more)

### Community 7 - "Admin Dashboard Overview"
Cohesion: 0.10
Nodes (12): Admin Dashboard, getErrorMessage(), VoucherTab, Collectors Management, Customer Vouchers, New Pickup Request, Notifications Management, Pickup Detail View (+4 more)

### Community 8 - "Voucher Management UI"
Cohesion: 0.12
Nodes (7): getErrorMessage(), VoucherTab, AdminVouchersPage, toDate(), toEndOfDayIso(), toStartOfDayIso(), VoucherModalMode

### Community 9 - "Admin Test Mocks"
Cohesion: 0.10
Nodes (8): admin, existingLocation, LocationRecord, AdminUser, existingUser, existingVoucher, Voucher, UserModalMode

### Community 10 - "Pickup Creation Wizard"
Cohesion: 0.10
Nodes (19): AiAutoSnapshot, AiSuggestion, AnalysisSummary, NewPickupForm, PreviewImage, StepMeta, WizardStep, CreatePickupRequestInput (+11 more)

### Community 11 - "Build Configuration"
Cohesion: 0.10
Nodes (20): executor, options, outputs, name, assets, bundle, command, declaration (+12 more)

### Community 12 - "Voucher Transaction Logic"
Cohesion: 0.10
Nodes (15): AdminPointLedgerLog, AdminVoucherRedemptionLog, CreateVoucherInput, CustomerVoucherCatalogItem, CustomerVoucherListResponse, CustomerVoucherRedemption, PointLedger, PointLedgerStatus (+7 more)

### Community 13 - "Auth UI Components"
Cohesion: 0.11
Nodes (4): AuthMode, AuthPage, LoginFormGroup, RegisterFormGroup

### Community 15 - "Home Dashboard UI"
Cohesion: 0.12
Nodes (11): DashboardStat, DetectedItem, Feature, FooterGroup, HomePage, NavLink, Pickup, Stat (+3 more)

### Community 16 - "Google Places Integration"
Cohesion: 0.21
Nodes (11): AddressComponents, assertGoogleStatus(), autocompletePlaces(), buildAddressLine(), getComponents(), getGoogleMapsApiKey(), getPlaceDetails(), GoogleAutocompleteResponse (+3 more)

### Community 17 - "Data Models and Types"
Cohesion: 0.13
Nodes (14): Address, AuthResponse, ChangePasswordResponse, CompleteCustomerOnboardingResponse, CreateUserInput, ForgotPasswordInput, ForgotPasswordResponse, LoginInput (+6 more)

### Community 18 - "Location Management UI"
Cohesion: 0.18
Nodes (3): CollectorPage, AdminCollectorsPage, LocationModalMode

### Community 20 - "Pickup Integration Tests"
Cohesion: 0.22
Nodes (9): addresses, categories, customer, imageFile(), MockApiOptions, mockPickupApi(), pickupRequest, TestPickupRequest (+1 more)

### Community 21 - "Auth and AI Middleware"
Cohesion: 0.18
Nodes (10): requireAdmin(), requireAdmin(), requireAuthenticatedUser(), RoboflowPrediction, RoboflowResponse, router, upload, getCookieValue() (+2 more)

### Community 23 - "TypeScript Configuration"
Cohesion: 0.14
Nodes (13): compilerOptions, forceConsistentCasingInFileNames, importHelpers, module, noFallthroughCasesInSwitch, noImplicitOverride, noImplicitReturns, noPropertyAccessFromIndexSignature (+5 more)

### Community 25 - "Waste Category Logic"
Cohesion: 0.17
Nodes (5): requireAdmin(), admin, plasticCategory, CreateWasteCategoryInput, UpdateWasteCategoryInput

### Community 27 - "Admin Notification UI"
Cohesion: 0.21
Nodes (3): NotificationModalMode, toEndOfDayIso(), AdminNotificationLog

### Community 28 - "Routing and Guards"
Cohesion: 0.24
Nodes (7): ROUTE_PATHS, routePath(), RoutePathSegment, LazyPage, RouteConfig, routes, guestGuard()

### Community 30 - "Pickup Data Models"
Cohesion: 0.24
Nodes (7): Pickup, PickupCollector, PickupStatus, pickupStatusColors, pickupStatusLabels, PickupTimelineEvent, PickupTimelineStatus

### Community 31 - "Package Metadata"
Cohesion: 0.25
Nodes (8): exports, import, main, name, private, type, types, version

### Community 32 - "Notification Type Definitions"
Cohesion: 0.22
Nodes (8): ListAdminNotificationLogsResponse, NotificationRecipientRole, NotificationResponse, NotificationTargetRole, PushSubscriptionInput, SendAdminNotificationInput, SendAdminNotificationResponse, UserRole

### Community 33 - "Voucher Routing Logic"
Cohesion: 0.29
Nodes (4): RedeemVoucherError, toCustomerRedemptionResponse(), toVoucherResponse(), voucherRouter

### Community 34 - "Admin Pickup API"
Cohesion: 0.29
Nodes (4): pickupRouter, requireAdmin(), stringifyDecimal(), AdminPickupRequest

### Community 35 - "Library Configuration"
Cohesion: 0.25
Nodes (7): compilerOptions, declaration, outDir, types, exclude, extends, include

### Community 36 - "User Management API"
Cohesion: 0.38
Nodes (4): requireAdmin(), userRouter, getBody(), isObject()

### Community 37 - "Admin Notification Routing"
Cohesion: 0.38
Nodes (5): adminNotificationRouter, normalizeOptionalDate(), normalizeOptionalText(), normalizeText(), requireAdmin()

### Community 38 - "Project Metadata"
Cohesion: 0.33
Nodes (6): name, nx, projectType, tags, private, version

### Community 39 - "Waste Category API"
Cohesion: 0.40
Nodes (4): wasteCategoryRouter, adapter, databaseUrl, prisma

### Community 41 - "API Response Models"
Cohesion: 0.60
Nodes (4): ApiErrorResponse, ApiResponse, HealthResponse, PaginatedResponse

### Community 45 - "AI Analysis Models"
Cohesion: 0.50
Nodes (3): AnalyzeImageResponse, AnalyzeImageResult, DetectedWasteCategory

### Community 46 - "Location Data Models"
Cohesion: 0.50
Nodes (3): CollectionLocation, CreateCollectionLocationInput, UpdateCollectionLocationInput

### Community 47 - "Place Selection Logic"
Cohesion: 0.50
Nodes (3): GooglePlaceSelection, PlaceAutocompleteResponse, PlacePrediction

## Knowledge Gaps
- **201 isolated node(s):** `app`, `port`, `authCookieSameSite`, `databaseUrl`, `adapter` (+196 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `CustomerNewPickupPage` connect `Pickup Request UI` to `Pickup Creation Wizard`, `Pickup Detail View`, `Pickup Data Parsing`?**
  _High betweenness centrality (0.166) - this node is a cross-community bridge._
- **Why does `removeImages()` connect `Pickup Data Parsing` to `Pickup Request UI`?**
  _High betweenness centrality (0.123) - this node is a cross-community bridge._
- **Why does `AuthService` connect `Authentication Logic` to `Core Services`, `Notification Management`, `Waste Category API`, `Data Models and Types`, `Auth and AI Middleware`, `Routing and Guards`?**
  _High betweenness centrality (0.088) - this node is a cross-community bridge._
- **What connects `app`, `port`, `authCookieSameSite` to the rest of the system?**
  _201 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Pickup Request UI` be split into smaller, more focused modules?**
  _Cohesion score 0.06531986531986532 - nodes in this community are weakly interconnected._
- **Should `Core Services` be split into smaller, more focused modules?**
  _Cohesion score 0.058693244739756366 - nodes in this community are weakly interconnected._
- **Should `Authentication Logic` be split into smaller, more focused modules?**
  _Cohesion score 0.09302325581395349 - nodes in this community are weakly interconnected._