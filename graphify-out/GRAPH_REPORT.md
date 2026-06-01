# Graph Report - backend + frontend services + shared types  (2026-06-01)

## Corpus Check
- Corpus is ~17,657 words - fits in a single context window. You may not need a graph.

## Summary
- 393 nodes · 624 edges · 32 communities (19 shown, 13 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_prisma ts|prisma ts]]
- [[_COMMUNITY_auth service ts|auth service ts]]
- [[_COMMUNITY_location payload ts|location payload ts]]
- [[_COMMUNITY_pickup routes ts|pickup routes ts]]
- [[_COMMUNITY_notification service ts|notification service ts]]
- [[_COMMUNITY_places service ts|places service ts]]
- [[_COMMUNITY_transaction ts|transaction ts]]
- [[_COMMUNITY_AuthService|AuthService]]
- [[_COMMUNITY_config ts|config ts]]
- [[_COMMUNITY_user ts|user ts]]
- [[_COMMUNITY_pickup ts|pickup ts]]
- [[_COMMUNITY_voucher routes ts|voucher routes ts]]
- [[_COMMUNITY_NotificationService|NotificationService]]
- [[_COMMUNITY_notification ts|notification ts]]
- [[_COMMUNITY_AddressService|AddressService]]
- [[_COMMUNITY_AdminVoucherService|AdminVoucherService]]
- [[_COMMUNITY_LocationService|LocationService]]
- [[_COMMUNITY_PickupRequestService|PickupRequestService]]
- [[_COMMUNITY_UserService|UserService]]
- [[_COMMUNITY_WasteCategoryService|WasteCategoryService]]
- [[_COMMUNITY_index ts|index ts]]
- [[_COMMUNITY_CustomerVoucherService|CustomerVoucherService]]
- [[_COMMUNITY_ThemeService|ThemeService]]
- [[_COMMUNITY_AdminNotificationService|AdminNotificationService]]
- [[_COMMUNITY_PlaceSearchService|PlaceSearchService]]
- [[_COMMUNITY_address ts|address ts]]
- [[_COMMUNITY_ai analysis ts|ai analysis ts]]
- [[_COMMUNITY_location ts|location ts]]
- [[_COMMUNITY_place ts|place ts]]
- [[_COMMUNITY_waste category ts|waste category ts]]
- [[_COMMUNITY_AdminPickupService|AdminPickupService]]

## God Nodes (most connected - your core abstractions)
1. `getCurrentUserFromRequest()` - 26 edges
2. `prisma` - 16 edges
3. `AuthService` - 14 edges
4. `getBody()` - 12 edges
5. `config` - 11 edges
6. `NotificationService` - 11 edges
7. `registerUser()` - 9 edges
8. `toUserResponse()` - 9 edges
9. `loginUser()` - 7 edges
10. `resetPassword()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `requireAdmin()` --calls--> `getCurrentUserFromRequest()`  [EXTRACTED]
  apps/backend/src/routes/admin/location.routes.ts → apps/backend/src/services/auth.service.ts
- `requireAdmin()` --calls--> `getCurrentUserFromRequest()`  [EXTRACTED]
  apps/backend/src/routes/admin/notification.routes.ts → apps/backend/src/services/auth.service.ts
- `requireAdmin()` --calls--> `getCurrentUserFromRequest()`  [EXTRACTED]
  apps/backend/src/routes/admin/pickup.routes.ts → apps/backend/src/services/auth.service.ts
- `requireAdmin()` --calls--> `getCurrentUserFromRequest()`  [EXTRACTED]
  apps/backend/src/routes/admin/user.routes.ts → apps/backend/src/services/auth.service.ts
- `requireAdmin()` --calls--> `getCurrentUserFromRequest()`  [EXTRACTED]
  apps/backend/src/routes/admin/voucher.routes.ts → apps/backend/src/services/auth.service.ts

## Import Cycles
- None detected.

## Communities (32 total, 13 thin omitted)

### Community 0 - "prisma ts"
Cohesion: 0.05
Nodes (32): locationRouter, requireAdmin(), adminNotificationRouter, normalizeOptionalDate(), normalizeOptionalText(), normalizeText(), requireAdmin(), pickupRouter (+24 more)

### Community 1 - "auth service ts"
Cohesion: 0.15
Nodes (28): authRouter, avatarUpload, AuthSession, changePassword(), clearAuthCookie(), completeCustomerOnboarding(), createAuthCookie(), createPasswordResetToken() (+20 more)

### Community 2 - "location payload ts"
Cohesion: 0.17
Nodes (24): addressRouter, addressRouter, createAddress(), deleteAddress(), getAddressById(), listAddress(), setDefaultAddress(), toAddressResponse() (+16 more)

### Community 3 - "pickup routes ts"
Cohesion: 0.15
Nodes (21): isRecord(), normalizeOptionalText(), normalizeText(), parseItemsValue(), parseOptionalJson(), parsePositiveNumber(), parseRequestedItems(), PickupRequestUpload (+13 more)

### Community 4 - "notification service ts"
Cohesion: 0.16
Nodes (19): notificationRouter, createNotification(), createNotifications(), deleteAllNotifications(), deleteNotification(), hashEndpoint(), isWebPushConfigured, listNotifications() (+11 more)

### Community 5 - "places service ts"
Cohesion: 0.17
Nodes (13): requireAuthenticatedUser(), placesRouter, AddressComponents, assertGoogleStatus(), autocompletePlaces(), buildAddressLine(), getComponents(), getGoogleMapsApiKey() (+5 more)

### Community 6 - "transaction ts"
Cohesion: 0.11
Nodes (18): AdminPointLedgerLog, AdminVoucherRedemptionLog, CreateVoucherInput, CustomerVoucherCatalogItem, CustomerVoucherListResponse, CustomerVoucherRedemption, CustomerVoucherRedemptionsResponse, PointLedger (+10 more)

### Community 8 - "config ts"
Cohesion: 0.23
Nodes (8): errorHandler(), isObject(), isPrismaNotFoundError(), notFoundHandler(), app, authCookieSameSite, config, port

### Community 9 - "user ts"
Cohesion: 0.13
Nodes (14): AuthResponse, ChangePasswordInput, ChangePasswordResponse, CompleteCustomerOnboardingResponse, CreateUserInput, ForgotPasswordInput, ForgotPasswordResponse, LoginInput (+6 more)

### Community 10 - "pickup ts"
Cohesion: 0.14
Nodes (13): AdminPickupRequest, CreatePickupRequestInput, CreatePickupRequestResponse, GetPickupRequestResponse, ImageType, ListAdminPickupRequestsResponse, ListPickupRequestsResponse, PickupImage (+5 more)

### Community 11 - "voucher routes ts"
Cohesion: 0.18
Nodes (4): normalizeNonNegativeInteger(), normalizeNullableNonNegativeInteger(), requireAdmin(), voucherRouter

### Community 13 - "notification ts"
Cohesion: 0.17
Nodes (11): AdminNotificationLog, ListAdminNotificationLogsResponse, ListNotificationsResponse, Notification, NotificationRecipientRole, NotificationResponse, NotificationTargetRole, PushSubscriptionInput (+3 more)

### Community 20 - "index ts"
Cohesion: 0.60
Nodes (4): ApiErrorResponse, ApiResponse, HealthResponse, PaginatedResponse

### Community 25 - "address ts"
Cohesion: 0.50
Nodes (3): Address, CreateAddressInput, UpdateAddressInput

### Community 26 - "ai analysis ts"
Cohesion: 0.50
Nodes (3): AnalyzeImageResponse, AnalyzeImageResult, DetectedWasteCategory

### Community 27 - "location ts"
Cohesion: 0.50
Nodes (3): CollectionLocation, CreateCollectionLocationInput, UpdateCollectionLocationInput

### Community 28 - "place ts"
Cohesion: 0.50
Nodes (3): GooglePlaceSelection, PlaceAutocompleteResponse, PlacePrediction

### Community 29 - "waste category ts"
Cohesion: 0.50
Nodes (3): CreateWasteCategoryInput, UpdateWasteCategoryInput, WasteCategory

## Knowledge Gaps
- **110 isolated node(s):** `app`, `port`, `authCookieSameSite`, `databaseUrl`, `adapter` (+105 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getCurrentUserFromRequest()` connect `auth service ts` to `prisma ts`, `location payload ts`, `pickup routes ts`, `notification service ts`, `places service ts`, `voucher routes ts`?**
  _High betweenness centrality (0.070) - this node is a cross-community bridge._
- **Why does `prisma` connect `prisma ts` to `auth service ts`, `location payload ts`, `pickup routes ts`, `notification service ts`, `config ts`, `voucher routes ts`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Why does `config` connect `config ts` to `prisma ts`, `auth service ts`, `pickup routes ts`, `notification service ts`, `places service ts`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **What connects `app`, `port`, `authCookieSameSite` to the rest of the system?**
  _110 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `prisma ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0514216575922565 - nodes in this community are weakly interconnected._
- **Should `auth service ts` be split into smaller, more focused modules?**
  _Cohesion score 0.14772727272727273 - nodes in this community are weakly interconnected._
- **Should `pickup routes ts` be split into smaller, more focused modules?**
  _Cohesion score 0.14855072463768115 - nodes in this community are weakly interconnected._