# Graph Report - WasteGrab focused deep graph  (2026-06-02)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 780 nodes · 1117 edges · 57 communities (44 shown, 13 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `94bc31eb`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Pickup Wizard UI|Pickup Wizard UI]]
- [[_COMMUNITY_Core Services Layer|Core Services Layer]]
- [[_COMMUNITY_Authentication Logic|Authentication Logic]]
- [[_COMMUNITY_Notification Management|Notification Management]]
- [[_COMMUNITY_Address Management|Address Management]]
- [[_COMMUNITY_Pickup Data Models|Pickup Data Models]]
- [[_COMMUNITY_Admin Dashboard Components|Admin Dashboard Components]]
- [[_COMMUNITY_Customer Profile View|Customer Profile View]]
- [[_COMMUNITY_User Profile Management|User Profile Management]]
- [[_COMMUNITY_Voucher Administration UI|Voucher Administration UI]]
- [[_COMMUNITY_Pickup Request Logic|Pickup Request Logic]]
- [[_COMMUNITY_Admin Test Mocks|Admin Test Mocks]]
- [[_COMMUNITY_Pickup Creation Wizard|Pickup Creation Wizard]]
- [[_COMMUNITY_Voucher Transaction Logic|Voucher Transaction Logic]]
- [[_COMMUNITY_Build Configuration|Build Configuration]]
- [[_COMMUNITY_Auth UI Components|Auth UI Components]]
- [[_COMMUNITY_Admin Pickup Management|Admin Pickup Management]]
- [[_COMMUNITY_Home Dashboard UI|Home Dashboard UI]]
- [[_COMMUNITY_Location Search Service|Location Search Service]]
- [[_COMMUNITY_Collector Location Management|Collector Location Management]]
- [[_COMMUNITY_Pickup Integration Tests|Pickup Integration Tests]]
- [[_COMMUNITY_TypeScript Configuration|TypeScript Configuration]]
- [[_COMMUNITY_Auth Data Models|Auth Data Models]]
- [[_COMMUNITY_Waste Category Management|Waste Category Management]]
- [[_COMMUNITY_Waste Category Logic|Waste Category Logic]]
- [[_COMMUNITY_Security and AI Utils|Security and AI Utils]]
- [[_COMMUNITY_Admin Notification UI|Admin Notification UI]]
- [[_COMMUNITY_Backend Routing and Schema|Backend Routing and Schema]]
- [[_COMMUNITY_Voucher API Logic|Voucher API Logic]]
- [[_COMMUNITY_Routing and Guards|Routing and Guards]]
- [[_COMMUNITY_User and Location API|User and Location API]]
- [[_COMMUNITY_Voucher Routing Logic|Voucher Routing Logic]]
- [[_COMMUNITY_Notification Data Models|Notification Data Models]]
- [[_COMMUNITY_Package Metadata|Package Metadata]]
- [[_COMMUNITY_Library Build Config|Library Build Config]]
- [[_COMMUNITY_Admin Notification Routes|Admin Notification Routes]]
- [[_COMMUNITY_Project Metadata|Project Metadata]]
- [[_COMMUNITY_API Response Models|API Response Models]]
- [[_COMMUNITY_User Settings UI|User Settings UI]]
- [[_COMMUNITY_Admin Operation Tests|Admin Operation Tests]]
- [[_COMMUNITY_Customer Operation Tests|Customer Operation Tests]]
- [[_COMMUNITY_AI Analysis Models|AI Analysis Models]]
- [[_COMMUNITY_Location Data Models|Location Data Models]]
- [[_COMMUNITY_Place Autocomplete Models|Place Autocomplete Models]]
- [[_COMMUNITY_Admin Page Component|Admin Page Component]]
- [[_COMMUNITY_Collector Pickup View|Collector Pickup View]]
- [[_COMMUNITY_Playwright Config|Playwright Config]]
- [[_COMMUNITY_Collector Earnings UI|Collector Earnings UI]]
- [[_COMMUNITY_Rewards Page UI|Rewards Page UI]]
- [[_COMMUNITY_Customer Dashboard UI|Customer Dashboard UI]]
- [[_COMMUNITY_Shared Types Library|Shared Types Library]]

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
- `requireAdmin()` --calls--> `getCurrentUserFromRequest()`  [EXTRACTED]
  apps/backend/src/routes/admin/location.routes.ts → apps/backend/src/services/auth.service.ts
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

## Communities (57 total, 13 thin omitted)

### Community 1 - "Core Services Layer"
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
Nodes (25): addressRouter, AddressService, deleteAddress(), getAddressById(), listAddress(), setDefaultAddress(), toAddressResponse(), Address (+17 more)

### Community 5 - "Pickup Data Models"
Cohesion: 0.09
Nodes (10): customerPickups, Pickup, PickupCollector, PickupStatus, pickupStatusColors, pickupStatusLabels, PickupTimelineEvent, PickupTimelineStatus (+2 more)

### Community 6 - "Admin Dashboard Components"
Cohesion: 0.09
Nodes (14): Admin Dashboard, getErrorMessage(), VoucherTab, Authentication Page, Collectors Management, RedeemVoucherError, Customer Vouchers, New Pickup Request (+6 more)

### Community 7 - "Customer Profile View"
Cohesion: 0.10
Nodes (3): CustomerPage, DashboardStat, CustomerPickupDetailPage

### Community 8 - "User Profile Management"
Cohesion: 0.09
Nodes (4): AddressItem, AddressModalMode, ProfilePage, ModalMode

### Community 9 - "Voucher Administration UI"
Cohesion: 0.12
Nodes (7): getErrorMessage(), VoucherTab, AdminVouchersPage, toDate(), toEndOfDayIso(), toStartOfDayIso(), VoucherModalMode

### Community 10 - "Pickup Request Logic"
Cohesion: 0.15
Nodes (21): isRecord(), normalizeOptionalText(), normalizeText(), parseItemsValue(), parseOptionalJson(), parsePositiveNumber(), parseRequestedItems(), PickupRequestUpload (+13 more)

### Community 11 - "Admin Test Mocks"
Cohesion: 0.10
Nodes (8): admin, existingLocation, LocationRecord, AdminUser, existingUser, existingVoucher, Voucher, UserModalMode

### Community 12 - "Pickup Creation Wizard"
Cohesion: 0.10
Nodes (19): AiAutoSnapshot, AiSuggestion, AnalysisSummary, NewPickupForm, PreviewImage, StepMeta, WizardStep, CreatePickupRequestInput (+11 more)

### Community 13 - "Voucher Transaction Logic"
Cohesion: 0.10
Nodes (15): AdminPointLedgerLog, AdminVoucherRedemptionLog, CreateVoucherInput, CustomerVoucherCatalogItem, CustomerVoucherListResponse, CustomerVoucherRedemption, PointLedger, PointLedgerStatus (+7 more)

### Community 14 - "Build Configuration"
Cohesion: 0.10
Nodes (20): executor, options, outputs, name, assets, bundle, command, declaration (+12 more)

### Community 15 - "Auth UI Components"
Cohesion: 0.11
Nodes (4): AuthMode, AuthPage, LoginFormGroup, RegisterFormGroup

### Community 17 - "Home Dashboard UI"
Cohesion: 0.12
Nodes (11): DashboardStat, DetectedItem, Feature, FooterGroup, HomePage, NavLink, Pickup, Stat (+3 more)

### Community 18 - "Location Search Service"
Cohesion: 0.21
Nodes (11): AddressComponents, assertGoogleStatus(), autocompletePlaces(), buildAddressLine(), getComponents(), getGoogleMapsApiKey(), getPlaceDetails(), GoogleAutocompleteResponse (+3 more)

### Community 19 - "Collector Location Management"
Cohesion: 0.18
Nodes (3): CollectorPage, AdminCollectorsPage, LocationModalMode

### Community 20 - "Pickup Integration Tests"
Cohesion: 0.22
Nodes (9): addresses, categories, customer, imageFile(), MockApiOptions, mockPickupApi(), pickupRequest, TestPickupRequest (+1 more)

### Community 21 - "TypeScript Configuration"
Cohesion: 0.14
Nodes (13): compilerOptions, forceConsistentCasingInFileNames, importHelpers, module, noFallthroughCasesInSwitch, noImplicitOverride, noImplicitReturns, noPropertyAccessFromIndexSignature (+5 more)

### Community 22 - "Auth Data Models"
Cohesion: 0.14
Nodes (13): AuthResponse, ChangePasswordResponse, CompleteCustomerOnboardingResponse, CreateUserInput, ForgotPasswordInput, ForgotPasswordResponse, LoginInput, ResetPasswordInput (+5 more)

### Community 24 - "Waste Category Logic"
Cohesion: 0.17
Nodes (5): requireAdmin(), admin, plasticCategory, CreateWasteCategoryInput, UpdateWasteCategoryInput

### Community 25 - "Security and AI Utils"
Cohesion: 0.21
Nodes (8): requireAuthenticatedUser(), RoboflowPrediction, RoboflowResponse, router, upload, getCookieValue(), getCurrentUserFromRequest(), verifySessionToken()

### Community 26 - "Admin Notification UI"
Cohesion: 0.21
Nodes (3): NotificationModalMode, toEndOfDayIso(), AdminNotificationLog

### Community 27 - "Backend Routing and Schema"
Cohesion: 0.24
Nodes (8): pickupRouter, requireAdmin(), stringifyDecimal(), wasteCategoryRouter, adapter, databaseUrl, prisma, AdminPickupRequest

### Community 28 - "Voucher API Logic"
Cohesion: 0.20
Nodes (3): normalizeNonNegativeInteger(), normalizeNullableNonNegativeInteger(), requireAdmin()

### Community 29 - "Routing and Guards"
Cohesion: 0.24
Nodes (7): ROUTE_PATHS, routePath(), RoutePathSegment, LazyPage, RouteConfig, routes, guestGuard()

### Community 30 - "User and Location API"
Cohesion: 0.27
Nodes (5): requireAdmin(), requireAdmin(), userRouter, getBody(), isObject()

### Community 31 - "Voucher Routing Logic"
Cohesion: 0.25
Nodes (3): toCustomerRedemptionResponse(), toVoucherResponse(), voucherRouter

### Community 32 - "Notification Data Models"
Cohesion: 0.22
Nodes (8): ListAdminNotificationLogsResponse, NotificationRecipientRole, NotificationResponse, NotificationTargetRole, PushSubscriptionInput, SendAdminNotificationInput, SendAdminNotificationResponse, UserRole

### Community 33 - "Package Metadata"
Cohesion: 0.25
Nodes (8): exports, import, main, name, private, type, types, version

### Community 34 - "Library Build Config"
Cohesion: 0.25
Nodes (7): compilerOptions, declaration, outDir, types, exclude, extends, include

### Community 35 - "Admin Notification Routes"
Cohesion: 0.38
Nodes (5): adminNotificationRouter, normalizeOptionalDate(), normalizeOptionalText(), normalizeText(), requireAdmin()

### Community 36 - "Project Metadata"
Cohesion: 0.33
Nodes (6): name, nx, projectType, tags, private, version

### Community 37 - "API Response Models"
Cohesion: 0.60
Nodes (4): ApiErrorResponse, ApiResponse, HealthResponse, PaginatedResponse

### Community 42 - "AI Analysis Models"
Cohesion: 0.50
Nodes (3): AnalyzeImageResponse, AnalyzeImageResult, DetectedWasteCategory

### Community 43 - "Location Data Models"
Cohesion: 0.50
Nodes (3): CollectionLocation, CreateCollectionLocationInput, UpdateCollectionLocationInput

### Community 44 - "Place Autocomplete Models"
Cohesion: 0.50
Nodes (3): GooglePlaceSelection, PlaceAutocompleteResponse, PlacePrediction

## Knowledge Gaps
- **200 isolated node(s):** `app`, `port`, `authCookieSameSite`, `databaseUrl`, `adapter` (+195 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `CustomerNewPickupPage` connect `Pickup Wizard UI` to `Pickup Request Logic`, `Pickup Creation Wizard`, `Customer Profile View`?**
  _High betweenness centrality (0.167) - this node is a cross-community bridge._
- **Why does `removeImages()` connect `Pickup Request Logic` to `Pickup Wizard UI`?**
  _High betweenness centrality (0.123) - this node is a cross-community bridge._
- **Why does `AuthService` connect `Authentication Logic` to `Core Services Layer`, `Notification Management`, `Auth Data Models`, `Security and AI Utils`, `Backend Routing and Schema`, `Routing and Guards`?**
  _High betweenness centrality (0.089) - this node is a cross-community bridge._
- **What connects `app`, `port`, `authCookieSameSite` to the rest of the system?**
  _200 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Pickup Wizard UI` be split into smaller, more focused modules?**
  _Cohesion score 0.06531986531986532 - nodes in this community are weakly interconnected._
- **Should `Core Services Layer` be split into smaller, more focused modules?**
  _Cohesion score 0.058693244739756366 - nodes in this community are weakly interconnected._
- **Should `Authentication Logic` be split into smaller, more focused modules?**
  _Cohesion score 0.09302325581395349 - nodes in this community are weakly interconnected._