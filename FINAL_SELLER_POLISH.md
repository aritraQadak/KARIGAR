# Final seller cleanup

## Result
- Scoped seller tokens: saffron #F28C28, light base #F8F4EC, dark base #111315; warm/light and charcoal/dark cards, readable text and focus outlines. Saffron marks primary actions/navigation; green remains on success/trust indicators.
- Intro uses a fixed viewport overlay and centered object-fit: cover (cropping rather than distortion). Desktop asset: 1920x1080; mobile: 1080x1920, selected at <=639px. Both existing assets remain unchanged. Skip removed; muted playback, once-per-session behavior, 500ms fade and failure/10s fallback remain.
- Seller products are loaded once through shared SellerContext/useSellerProducts from authenticated GET /api/products. Successful publishing refreshes this shared list. Sidebar, dashboard and Products consume it. No pagination currently exists.
- Orders counts use the existing shared Orders context, including localStorage/demo data; no new order backend was introduced. Default data has All 6, Processing 1, Shipped 1, Delivered 3, Cancelled 1. Counts follow actual context entries.
- Messages navigation, seller and legacy routes, inquiry notification and Message Patron actions removed. Unreachable underlying Messages source/context retained; no backend messaging infrastructure removed.
- Five existing customer cards preserve names, ratings and order counts, with distinct sample product/review text and an explicit demo label. No invented purchase dates.
- Verification retains artisan trust/history and has no Add Product CTA.
- One shared source src/constants/craftCategories.js supplies all 13 categories. Add Product selects a category (no All crafts); marketplace filters retain All crafts plus the same 13 options. New listing API validates categories; draft payload and legacy display/filter normalization use the same source.
- Prisma category remains String. No schema changes, database migration or stored-record rewrite in this pass. Existing unknown historical labels remain intact; new unsupported inputs are rejected.

## Legacy mappings
Handloom/textiles -> Handloom & Textiles; pottery/pottery-clay/clay/pottery & ceramics -> Pottery & Clay; metal/metal craft/dhokra -> Metal & Dhokra; painting/folk painting -> Painting & Folk Art; jewellery/jewelry -> Jewellery & Accessories; wood/woodcraft/bamboo & cane -> Wood, Bamboo & Cane; natural fibre/natural fiber/basketry -> Basketry & Natural Fibres; stone/sculpture -> Stone & Sculpture; toys -> Toys & Dolls; leather -> Leather Craft; paper -> Paper & Eco Crafts; decor/home decor -> Home & Living. Matching trims whitespace and ignores case. Exact alias keys are exported as LEGACY_CRAFT_CATEGORIES.

## Files changed in this pass
- src/styles/sellerTheme.css; src/index.css; src/layouts/SellerLayout.jsx
- src/components/SellerSidebar.jsx; SellerHeader.jsx; SellerProfileDropdown.jsx; StatCard.jsx; ProductTable.jsx; OrderTable.jsx; OrderDetailsModal.jsx; LoginEntry.jsx
- src/components/add-product/ProductDetailsStep.jsx; ProductMediaStep.jsx; ProductPhotoUpload.jsx; ProductVideoUpload.jsx; ProductVoiceInput.jsx; CameraCapture.jsx; MediaPreview.jsx; ProcessVideoCapture.jsx; VerificationStep.jsx; ReviewPublishStep.jsx
- src/pages/seller/AddProduct.jsx; Dashboard.jsx; Products.jsx; Orders.jsx; Customers.jsx; Verification.jsx; Earnings.jsx; Profile.jsx; Settings.jsx
- src/context/SellerContext.jsx; src/hooks/useSellerProducts.js
- src/constants/craftCategories.js; src/constants/craftCategories.test.js
- src/data/customerReviews.js; src/data/sellerData.js; src/data/statesCrafts.js
- src/pages/Login.jsx; src/pages/buyer/Home.jsx; Browse.jsx; StateExplore.jsx; src/App.jsx
- src/utils/productApi.js; src/utils/productDraft.js; src/utils/addProductRender.test.js
- server/productHandler.js (category validation only)
- FINAL_SELLER_POLISH.md
Other pre-existing working tree changes are not changes made by this pass. .env, .venv, AI pipeline and Trust Score calculations were not modified.

## Checks
- 14 product draft/publish/API tests passed, including isolated SQLite persistence and seller scoping.
- 2 category normalization/API tests passed.
- Add Product server-render sanity test passed, including all 13 options and absence of All crafts in seller category UI.
- Production build passed (existing large-chunk advisory).
- Focused oxlint: no errors; existing unused-import/context warnings remain.
- Vite URL and FastAPI /health return HTTP 200. Node API restarted on port 5000.
- Visual behavior is for manual verification; no claim of a completed browser walkthrough.

## Running preview and manual checks
Vite printed: http://127.0.0.1:5173/
Seller: http://127.0.0.1:5173/seller/dashboard
Marketplace: http://127.0.0.1:5173/marketplace
Collections: http://127.0.0.1:5173/collections
FastAPI: http://127.0.0.1:8000/docs

1. Reload the page. In a fresh browser session visit /login; confirm full-viewport desktop/mobile intro, no Skip, then login transition.
2. Login as seller; compare light/dark theme and mobile navigation across Dashboard, Products, Orders and Add Product.
3. Compare product/sidebar/dashboard counts; compare Orders totals and all four status tabs (including Cancelled).
4. Confirm Messages is absent and Customers show labeled sample reviews without messaging buttons.
5. Verify Trust Center has history but no product creation/upload action.
6. Confirm Add Product has 13 categories; marketplace has All crafts plus those 13. Filter a legacy Pottery product using Pottery & Clay.
7. Existing Add Product verification/publishing behavior is preserved; no new features are included.
