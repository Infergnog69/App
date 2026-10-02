(() => {
  "use strict";

  const config = window.NEWD_CONFIG;
  const seed = window.NEWD_DATA;
  if (!config || !seed) throw new Error("newd could not load its configuration or demo data.");

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const ui = {
    appHeader: $("#appHeader"),
    bottomNav: $("#bottomNav"),
    brandButton: $("#brandButton"),
    brandName: $("#brandName"),
    brandSlogan: $("#brandSlogan"),
    headerSearchButton: $("#headerSearchButton"),
    headerTitle: $("#headerTitle"),
    headerFavoriteButton: $("#headerFavoriteButton"),
    inboxNavBadge: $("#inboxNavBadge"),
    homeCategoryRail: $("#homeCategoryRail"),
    homeFeed: $("#homeFeed"),
    searchInput: $("#searchInput"),
    clearSearch: $("#clearSearch"),
    searchBrowseCards: $("#searchBrowseCards"),
    searchSuggestionPanel: $("#searchSuggestionPanel"),
    searchResultMeta: $("#searchResultMeta"),
    searchResultCount: $("#searchResultCount"),
    searchFeed: $("#searchFeed"),
    searchEmpty: $("#searchEmpty"),
    sortSelect: $("#sortSelect"),
    searchCategoryChips: $("#searchCategoryChips"),
    openFilterButton: $("#openFilterButton"),
    filterModal: $("#filterModal"),
    filterSizeChips: $("#filterSizeChips"),
    filterConditionChips: $("#filterConditionChips"),
    filterPrice: $("#filterPrice"),
    filterPriceOutput: $("#filterPriceOutput"),
    applyFilterButton: $("#applyFilterButton"),
    sellForm: $("#sellForm"),
    photoInput: $("#photoInput"),
    photoPreviewGrid: $("#photoPreviewGrid"),
    sellTitle: $("#sellTitle"),
    sellTitleCount: $("#sellTitleCount"),
    sellCategory: $("#sellCategory"),
    sellSize: $("#sellSize"),
    sellBrand: $("#sellBrand"),
    sellCondition: $("#sellCondition"),
    sellDescription: $("#sellDescription"),
    sellDescriptionCount: $("#sellDescriptionCount"),
    sellPrice: $("#sellPrice"),
    sellFormError: $("#sellFormError"),
    conversationList: $("#conversationList"),
    inboxListView: $("#inboxListView"),
    messagesPanel: $("#messagesPanel"),
    notificationsPanel: $("#notificationsPanel"),
    notificationList: $("#notificationList"),
    messageTabCount: $("#messageTabCount"),
    notificationTabCount: $("#notificationTabCount"),
    chatView: $("#chatView"),
    chatBackButton: $("#chatBackButton"),
    chatPersonAvatar: $("#chatPersonAvatar"),
    chatPersonName: $("#chatPersonName"),
    chatPersonStatus: $("#chatPersonStatus"),
    chatListingStrip: $("#chatListingStrip"),
    chatMessages: $("#chatMessages"),
    chatForm: $("#chatForm"),
    chatInput: $("#chatInput"),
    profileAvatar: $("#profileAvatar"),
    profileName: $("#profileName"),
    profileUsername: $("#profileUsername"),
    profileLocation: $("#profileLocation"),
    profileBio: $("#profileBio"),
    profileRating: $("#profileRating"),
    profileSold: $("#profileSold"),
    profileFollowers: $("#profileFollowers"),
    sellingCount: $("#sellingCount"),
    savedCount: $("#savedCount"),
    profileGrid: $("#profileGrid"),
    profileEmpty: $("#profileEmpty"),
    profileEmptyCopy: $("#profileEmptyCopy"),
    profileEmptyButton: $("#profileEmptyButton"),
    listingModal: $("#listingModal"),
    detailImage: $("#detailImage"),
    detailFavorite: $("#detailFavorite"),
    detailBrand: $("#detailBrand"),
    detailTitle: $("#detailTitle"),
    detailPrice: $("#detailPrice"),
    detailSize: $("#detailSize"),
    detailCondition: $("#detailCondition"),
    detailCategory: $("#detailCategory"),
    detailLocation: $("#detailLocation"),
    detailDescription: $("#detailDescription"),
    detailTags: $("#detailTags"),
    detailSellerCard: $("#detailSellerCard"),
    detailSellerAvatar: $("#detailSellerAvatar"),
    detailSellerName: $("#detailSellerName"),
    detailSellerType: $("#detailSellerType"),
    detailSellerRating: $("#detailSellerRating"),
    messageSellerButton: $("#messageSellerButton"),
    buyNowButton: $("#buyNowButton"),
    checkoutModal: $("#checkoutModal"),
    checkoutSummary: $("#checkoutSummary"),
    confirmDemoOrder: $("#confirmDemoOrder"),
    onboarding: $("#onboarding"),
    startDemoButton: $("#startDemoButton"),
    skipOnboardingButton: $("#skipOnboardingButton"),
    toast: $("#toast"),
  };

  const validScreens = new Set(["home", "search", "sell", "inbox", "profile"]);
  const categoryMap = new Map(config.categories.map((item) => [item.id, item]));
  const homeCategories = config.homeCategoryIds.map((id) => categoryMap.get(id)).filter(Boolean);
  const browseCategories = config.searchBrowseCategoryIds.map((id) => categoryMap.get(id)).filter(Boolean);
  let toastTimer = null;
  let sellPhotos = [];
  let replyTimer = null;

  function clone(value) { return JSON.parse(JSON.stringify(value)); }

  function createStarterListings() {
    const now = Date.now();
    return [
      {
        id: "u-starter-1",
        title: "Áo sơ mi xanh kem",
        price: 180000,
        category: "women",
        subcategory: "Sơ mi",
        brand: "Uniqlo",
        size: "M",
        condition: "Rất tốt",
        location: seed.currentUser.location,
        seller: {
          id: seed.currentUser.id,
          name: seed.currentUser.displayName,
          avatar: seed.currentUser.avatar,
          rating: seed.currentUser.rating,
          type: "Tủ đồ cá nhân",
        },
        image: "assets/item-07.svg",
        images: ["assets/item-07.svg"],
        likes: 14,
        createdAt: now - 1000 * 60 * 60 * 9,
        description: "Sơ mi xanh kem form rộng nhẹ, mặc khoảng ba lần. Không lỗi, phù hợp đi học hoặc đi làm.",
        tags: ["sơ mi", "tối giản", "dễ phối"],
      },
      {
        id: "u-starter-2",
        title: "Túi tote canvas",
        price: 100000,
        category: "accessories",
        subcategory: "Túi tote",
        brand: "No brand",
        size: "Freesize",
        condition: "Tốt",
        location: seed.currentUser.location,
        seller: {
          id: seed.currentUser.id,
          name: seed.currentUser.displayName,
          avatar: seed.currentUser.avatar,
          rating: seed.currentUser.rating,
          type: "Tủ đồ cá nhân",
        },
        image: "assets/item-12.svg",
        images: ["assets/item-12.svg"],
        likes: 8,
        createdAt: now - 1000 * 60 * 60 * 31,
        description: "Túi tote canvas dày, có dấu sử dụng nhẹ ở quai. Đựng vừa laptop 13 inch.",
        tags: ["tote", "canvas", "đi học"],
      },
    ];
  }

  function initialState() {
    return {
      activeScreen: "home",
      homeCategory: "all",
      searchCategory: "all",
      searchQuery: "",
      searchSize: null,
      searchCondition: null,
      searchMaxPrice: 1000000,
      searchSort: "recommended",
      favorites: ["n1", "n4"],
      userListings: createStarterListings(),
      conversations: clone(seed.conversations),
      profileTab: "selling",
      activityTab: "messages",

      selectedListingId: null,
      activeConversationId: null,

      notifications: [
        {
          id: "noti-1",
          type: "liked_your_item",
          title: "Có người thích món của bạn",
          message: "Linh và 4 người khác đã thích Áo sơ mi xanh kem.",
          listingId: "u-starter-1",
          actorAvatar: "L",
          createdAt: Date.now() - 1000 * 60 * 8,
          read: false
        },
        {
          id: "noti-2",
          type: "new_follower",
          title: "Có người theo dõi bạn",
          message: "Mây Archive vừa bắt đầu theo dõi bạn.",
          actorAvatar: "MÂ",
          createdAt: Date.now() - 1000 * 60 * 35,
          read: false
        },
        {
          id: "noti-3",
          type: "price_drop",
          title: "Món bạn thích đã giảm giá",
          message: "Cardigan len hồng giảm từ 280.000đ xuống 220.000đ.",
          listingId: "n1",
          createdAt: Date.now() - 1000 * 60 * 60 * 2,
          read: false
        },
        {
          id: "noti-4",
          type: "favorite_sold",
          title: "Món bạn thích đã được bán",
          message: "Đầm maxi vàng nhạt vừa được một người khác mua.",
          listingId: "n4",
          createdAt: Date.now() - 1000 * 60 * 60 * 5,
          read: true
        },
        {
          id: "noti-5",
          type: "followed_seller_new_items",
          title: "Người bạn theo dõi vừa đăng đồ mới",
          message: "Mây Archive vừa đăng thêm 5 món mới.",
          actorAvatar: "MÂ",
          createdAt: Date.now() - 1000 * 60 * 60 * 8,
          read: true
        },
        {
          id: "noti-6",
          type: "offer_received",
          title: "Bạn nhận được một offer",
          message: "Một người mua đề nghị 140.000đ cho Áo sơ mi xanh kem.",
          listingId: "u-starter-1",
          createdAt: Date.now() - 1000 * 60 * 60 * 12,
          read: true
        },
        {
          id: "noti-7",
          type: "offer_accepted",
          title: "Offer của bạn đã được chấp nhận",
          message: "Người bán đồng ý bán Giày loafer đen với giá 380.000đ.",
          listingId: "n6",
          createdAt: Date.now() - 1000 * 60 * 60 * 20,
          read: true
        },
        {
          id: "noti-8",
          type: "offer_rejected",
          title: "Offer của bạn đã bị từ chối",
          message: "Người bán chưa đồng ý mức giá cho Túi da vai màu nâu.",
          listingId: "n2",
          createdAt: Date.now() - 1000 * 60 * 60 * 28,
          read: true
        },
        {
          id: "noti-9",
          type: "counter_offer",
          title: "Người bán gửi counter-offer",
          message: "Người bán đề nghị mức giá mới 250.000đ cho Áo khoác denim.",
          listingId: "n3",
          createdAt: Date.now() - 1000 * 60 * 60 * 32,
          read: true
        }
      ],
      onboardingSeen: false,
      demoOrders: [],
    };
  }

  function loadState() {
    const fallback = initialState();
    try {
      const raw = localStorage.getItem(config.storageKey);
      if (!raw) return fallback;
      const saved = JSON.parse(raw);
      return {
        ...fallback,
        ...saved,
        notifications: Array.isArray(saved.notifications)
        ? saved.notifications
        : fallback.notifications,
        favorites: Array.isArray(saved.favorites) ? saved.favorites : fallback.favorites,
        userListings: Array.isArray(saved.userListings) ? saved.userListings : fallback.userListings,
        conversations: Array.isArray(saved.conversations) ? saved.conversations : fallback.conversations,
        demoOrders: Array.isArray(saved.demoOrders) ? saved.demoOrders : [],
      };
    } catch (error) {
      console.warn("Could not restore newd demo state:", error);
      return fallback;
    }
  }

  let state = loadState();

  function persist() {
    try { localStorage.setItem(config.storageKey, JSON.stringify(state)); }
    catch (error) { console.warn("Could not save newd demo state:", error); }
  }

  function applyBrand() {
    const root = document.documentElement;
    const theme = config.theme;
    root.style.setProperty("--coral", theme.coral);
    root.style.setProperty("--coral-dark", theme.coralDark);
    root.style.setProperty("--butter", theme.butter);
    root.style.setProperty("--sky", theme.sky);
    root.style.setProperty("--sage", theme.sage);
    root.style.setProperty("--warm-white", theme.warmWhite);
    root.style.setProperty("--charcoal", theme.charcoal);
    root.style.setProperty("--muted", theme.muted);
    root.style.setProperty("--line", theme.line);
    root.style.setProperty("--surface", theme.surface);
    ui.brandName.textContent = config.brand.name;
    ui.brandSlogan.textContent = config.brand.slogan;
    document.title = `${config.brand.name} — ${config.brand.slogan.replace(/\.$/, "")}`;
  }

  function escapeHTML(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function formatMoney(value) {
    return `${new Intl.NumberFormat(config.locale).format(Number(value) || 0)}${config.currencySymbol}`;
  }

  function formatRelativeTime(timestamp) {
    const seconds = Math.max(0, Math.floor((Date.now() - Number(timestamp)) / 1000));
    if (seconds < 60) return "Vừa xong";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} phút`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} ngày`;
    return new Intl.DateTimeFormat(config.locale, { day: "2-digit", month: "2-digit" }).format(new Date(timestamp));
  }

  function formatClock(timestamp) {
    return new Intl.DateTimeFormat(config.locale, { hour: "2-digit", minute: "2-digit" }).format(new Date(timestamp));
  }

  function icon(name, className = "") {
    const safeName = String(name).replace(/[^a-z0-9-]/gi, "");
    const safeClass = className ? ` class="${escapeHTML(className)}"` : "";
    return `<svg${safeClass} aria-hidden="true"><use href="#i-${safeName}"></use></svg>`;
  }

  function categoryLabel(categoryId) {
    return categoryMap.get(categoryId)?.label || categoryId || "Khác";
  }

  function allListings() {
    return [...state.userListings, ...seed.listings];
  }

  function getListing(listingId) {
    return allListings().find((listing) => listing.id === listingId) || null;
  }

  function isFavorite(listingId) {
    return state.favorites.includes(listingId);
  }

  function favoriteCountValue(listing) {
    return Number(listing.likes || 0) + (isFavorite(listing.id) ? 1 : 0);
  }

  function toggleFavorite(listingId) {
    if (!getListing(listingId)) return;
    if (isFavorite(listingId)) {
      state.favorites = state.favorites.filter((id) => id !== listingId);
      showToast("Đã bỏ khỏi mục yêu thích.");
    } else {
      state.favorites = [...state.favorites, listingId];
      showToast("Đã thêm vào mục yêu thích.");
    }
    persist();
    renderAllActiveViews();
  }

  function updateHeader() {
  const screen = state.activeScreen;

  ui.appHeader.classList.remove(
    "mode-home",
    "mode-title",
    "mode-sell"
  );

  // Mặc định ẩn toàn bộ thành phần tùy biến
  ui.brandButton.hidden = false;
  ui.headerSearchButton.hidden = true;
  ui.headerTitle.hidden = true;
  ui.headerFavoriteButton.hidden = true;

  // TRANG CHỦ:
  // Logo + search bar + trái tim
  if (screen === "home") {
    ui.appHeader.classList.add("mode-home");

    ui.headerSearchButton.hidden = false;
    ui.headerFavoriteButton.hidden = false;
  }

  // TÌM KIẾM:
  // Tiêu đề + trái tim
  if (screen === "search") {
    ui.appHeader.classList.add("mode-title");

    ui.headerTitle.hidden = false;
    ui.headerTitle.textContent = "Tìm kiếm";

    ui.headerFavoriteButton.hidden = false;
  }

  // HỘP THƯ:
  // Chỉ hiện tiêu đề, không có trái tim và không có chuông
  if (screen === "inbox") {
    ui.appHeader.classList.add("mode-title");

    ui.headerTitle.hidden = false;
    ui.headerTitle.textContent = "Hộp thư";
  }

  // CÁ NHÂN:
  // Chỉ hiện tiêu đề
  if (screen === "profile") {
    ui.appHeader.classList.add("mode-title");

    ui.headerTitle.hidden = false;
    ui.headerTitle.textContent = "Cá nhân";
  }

  // ĐĂNG BÁN:
  // Chỉ hiện tiêu đề, ẩn cả logo và icon
  if (screen === "sell") {
    ui.appHeader.classList.add("mode-sell");

    ui.brandButton.hidden = true;

    ui.headerTitle.hidden = false;
    ui.headerTitle.textContent = "Đăng bán";
  }
}
  function renderHomeCategories() {
    ui.homeCategoryRail.innerHTML = homeCategories
      .map((category) => `
        <button class="category-pill ${state.homeCategory === category.id ? "active" : ""}" type="button" data-home-category="${escapeHTML(category.id)}">
          ${escapeHTML(category.label)}
        </button>
      `)
      .join("");
  }

  function listingCard(listing) {
    const title = escapeHTML(listing.title);
    const imageSrc = escapeHTML(listing.image || listing.images?.[0] || "assets/item-01.svg");
    const favoriteClass = isFavorite(listing.id) ? "active" : "";
    return `
      <article class="listing-card compact-card">
        <div class="listing-image-wrap compact-image-wrap">
          <button class="listing-image-button" type="button" data-listing-id="${escapeHTML(listing.id)}" aria-label="Xem ${title}">
            <img class="listing-image" src="${imageSrc}" alt="${title}" />
          </button>

          <button class="image-favorite-button ${favoriteClass}" type="button" data-favorite-id="${escapeHTML(listing.id)}" aria-label="${favoriteClass ? "Bỏ yêu thích" : "Yêu thích"} ${title}">
            ${icon("heart")}
            <span>${favoriteCountValue(listing)}</span>
          </button>
        </div>
        <button class="listing-card-button listing-copy-button" type="button" data-listing-id="${escapeHTML(listing.id)}">
          <span class="listing-copy">
            <span class="listing-title">${title}</span>
            <span class="listing-bottom-row">
              <strong class="listing-price">${formatMoney(listing.price)}</strong>
            </span>
          </span>
        </button>
      </article>
    `;
  }

  function renderHome() {
    renderHomeCategories();
    let listings = allListings();
    if (state.homeCategory !== "all") listings = listings.filter((listing) => listing.category === state.homeCategory);
    listings.sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
    ui.homeFeed.innerHTML = listings.map(listingCard).join("");
  }

  function searchResults() {
    const query = state.searchQuery.trim().toLocaleLowerCase(config.locale);
    let listings = allListings().filter((listing) => {
      const haystack = [
        listing.title,
        listing.brand,
        listing.subcategory,
        listing.seller?.name,
        listing.description,
        ...(listing.tags || []),
      ].join(" ").toLocaleLowerCase(config.locale);

      const queryMatches = !query || haystack.includes(query);
      const categoryMatches = state.searchCategory === "all" || listing.category === state.searchCategory;
      const sizeMatches = !state.searchSize || listing.size === state.searchSize;
      const conditionMatches = !state.searchCondition || listing.condition === state.searchCondition;
      const priceMatches = Number(listing.price) <= Number(state.searchMaxPrice);
      return queryMatches && categoryMatches && sizeMatches && conditionMatches && priceMatches;
    });

    switch (state.searchSort) {
      case "newest": listings.sort((a, b) => Number(b.createdAt) - Number(a.createdAt)); break;
      case "priceLow": listings.sort((a, b) => Number(a.price) - Number(b.price)); break;
      case "priceHigh": listings.sort((a, b) => Number(b.price) - Number(a.price)); break;
      default:
        listings.sort((a, b) => {
          const aScore = Number(a.likes || 0) + (isFavorite(a.id) ? 20 : 0);
          const bScore = Number(b.likes || 0) + (isFavorite(b.id) ? 20 : 0);
          return bScore - aScore;
        });
    }
    return listings;
  }

  function suggestionItems() {
    const query = state.searchQuery.trim().toLocaleLowerCase(config.locale);
    if (!query) return [];
    const sourceItems = [];
    allListings().forEach((listing) => {
      sourceItems.push({ label: listing.title, kind: listing.seller?.name || categoryLabel(listing.category), category: listing.category });
      if (listing.brand) sourceItems.push({ label: listing.brand, kind: "Thương hiệu", category: listing.category });
      if (listing.subcategory) sourceItems.push({ label: listing.subcategory, kind: categoryLabel(listing.category), category: listing.category });
      (listing.tags || []).forEach((tag) => sourceItems.push({ label: tag, kind: categoryLabel(listing.category), category: listing.category }));
    });

    const seen = new Set();
    const filtered = [];
    for (const item of sourceItems) {
      const label = item.label.trim();
      if (!label) continue;
      const normalized = label.toLocaleLowerCase(config.locale);
      if (!normalized.includes(query) || seen.has(normalized)) continue;
      seen.add(normalized);
      const count = allListings().filter((listing) => [listing.title, listing.brand, listing.subcategory, ...(listing.tags || [])]
        .join(" ").toLocaleLowerCase(config.locale).includes(normalized)).length;
      filtered.push({ ...item, count });
      if (filtered.length >= 8) break;
    }
    return filtered;
  }

  function renderSearchBrowseCards() {
    ui.searchBrowseCards.innerHTML = browseCategories
      .map((category) => `
        <button class="browse-card" type="button" data-browse-category="${escapeHTML(category.id)}">
          <span class="browse-card-title">${escapeHTML(category.label)}</span>
          <span class="browse-card-icon">${icon(category.icon)}</span>
        </button>
      `)
      .join("");
  }

  function renderSearchSuggestions() {
    const query = state.searchQuery.trim();
    const suggestions = suggestionItems();

    if (!query) {
      ui.searchSuggestionPanel.hidden = true;
      ui.searchSuggestionPanel.innerHTML = "";
      return;
    }

    ui.searchSuggestionPanel.hidden = false;
    ui.searchSuggestionPanel.innerHTML = suggestions.length
      ? suggestions.map((item) => `
          <button class="suggestion-row" type="button" data-suggestion-query="${escapeHTML(item.label)}">
            <span class="suggestion-copy">
              <strong>${escapeHTML(item.label)}</strong>
              <span>${escapeHTML(item.kind)} · ${item.count} món</span>
            </span>
            <span class="suggestion-arrow">${icon("chevron")}</span>
          </button>
        `).join("")
      : `<div class="suggestion-empty">Tiếp tục nhập để tìm món đồ, thương hiệu hoặc danh mục phù hợp.</div>`;
  }

  function renderSearch() {
    renderSearchBrowseCards();
    ui.searchInput.value = state.searchQuery;
    ui.clearSearch.hidden = !state.searchQuery;
    ui.sortSelect.value = state.searchSort;
    renderSearchSuggestions();

    const results = searchResults();
    const showingResults = Boolean(state.searchQuery.trim()) || state.searchCategory !== "all" || state.searchSize || state.searchCondition || Number(state.searchMaxPrice) < 1000000;

    ui.searchBrowseCards.hidden = showingResults;
    ui.searchResultMeta.hidden = !showingResults;
    ui.searchResultCount.textContent = String(results.length);
    ui.searchFeed.innerHTML = results.map(listingCard).join("");
    ui.searchFeed.hidden = !showingResults || results.length === 0;
    ui.searchEmpty.hidden = !(showingResults && results.length === 0);
  }

  function renderFilterControls() {
    ui.filterSizeChips.innerHTML = config.sizes
      .map((size) => `<button class="choice-chip ${state.searchSize === size ? "active" : ""}" type="button" data-filter-size="${escapeHTML(size)}">${escapeHTML(size)}</button>`)
      .join("");

    ui.filterConditionChips.innerHTML = config.conditions
      .map((condition) => `<button class="choice-chip ${state.searchCondition === condition ? "active" : ""}" type="button" data-filter-condition="${escapeHTML(condition)}">${escapeHTML(condition)}</button>`)
      .join("");

    ui.filterPrice.value = String(state.searchMaxPrice);
    ui.filterPriceOutput.textContent = formatMoney(state.searchMaxPrice);
  }

  function populateSellSelects() {
    ui.sellCategory.innerHTML = `
      <option value="">Chọn danh mục</option>
      ${config.categories.filter((category) => category.id !== "all").map((category) => `<option value="${escapeHTML(category.id)}">${escapeHTML(category.label)}</option>`).join("")}
    `;
    ui.sellSize.innerHTML = `
      <option value="">Chọn kích thước</option>
      ${config.sizes.map((size) => `<option value="${escapeHTML(size)}">${escapeHTML(size)}</option>`).join("")}
    `;
    ui.sellCondition.innerHTML = `
      <option value="">Chọn tình trạng</option>
      ${config.conditions.map((condition) => `<option value="${escapeHTML(condition)}">${escapeHTML(condition)}</option>`).join("")}
    `;
  }

  function renderPhotoPreviews() {
    ui.photoPreviewGrid.innerHTML = sellPhotos
      .map((src, index) => `
        <div class="photo-preview-item">
          <img src="${src}" alt="Ảnh món đồ ${index + 1}" />
          <button type="button" data-remove-photo="${index}" aria-label="Xoá ảnh ${index + 1}">${icon("close")}</button>
        </div>
      `)
      .join("");
  }
  function notificationIcon(type) {
    switch (type) {
      case "liked_your_item":
        return "heart";

      case "new_follower":
        return "user";

      case "price_drop":
        return "bag";

      case "favorite_sold":
        return "check";

      case "followed_seller_new_items":
        return "sparkles";

      case "offer_received":
      case "offer_accepted":
      case "offer_rejected":
      case "counter_offer":
        return "bag";

      default:
        return "bell";
    }
  }
  function renderActivityTabs() {
  $$("[data-activity-tab]").forEach((button) => {
    button.classList.toggle(
      "active",
      button.dataset.activityTab === state.activityTab
    );
  });

  ui.messagesPanel.hidden = state.activityTab !== "messages";
  ui.notificationsPanel.hidden =
    state.activityTab !== "notifications";

  const unreadMessages = state.conversations.reduce(
    (total, conversation) =>
      total + Number(conversation.unread || 0),
    0
  );

  const unreadNotifications = state.notifications.filter(
    (notification) => !notification.read
  ).length;

  ui.messageTabCount.textContent = unreadMessages
    ? String(unreadMessages)
    : "";

  ui.notificationTabCount.textContent = unreadNotifications
    ? String(unreadNotifications)
    : "";

  ui.messageTabCount.hidden = unreadMessages === 0;
  ui.notificationTabCount.hidden =
    unreadNotifications === 0;
}

function renderNotifications() {
  const ordered = [...state.notifications].sort(
    (a, b) => Number(b.createdAt) - Number(a.createdAt)
  );

  ui.notificationList.innerHTML = ordered
    .map((notification) => {
      const listing = notification.listingId
        ? getListing(notification.listingId)
        : null;

      const thumbnail = listing?.image
        ? `
          <img
            class="notification-thumbnail"
            src="${escapeHTML(listing.image)}"
            alt="${escapeHTML(listing.title)}"
          />
        `
        : notification.actorAvatar
          ? `
            <span class="avatar notification-avatar">
              ${escapeHTML(notification.actorAvatar)}
            </span>
          `
          : `
            <span class="notification-type-icon">
              ${icon(notificationIcon(notification.type))}
            </span>
          `;

      return `
        <button
          class="notification-item ${
            notification.read ? "" : "unread"
          }"
          type="button"
          data-notification-id="${escapeHTML(notification.id)}"
        >
          ${thumbnail}

          <span class="notification-copy">
            <strong>
              ${escapeHTML(notification.title)}
            </strong>

            <span>
              ${escapeHTML(notification.message)}
            </span>

            <time>
              ${formatRelativeTime(notification.createdAt)}
            </time>
          </span>

          ${
            notification.read
              ? ""
              : `<span class="notification-unread-dot"></span>`
          }
        </button>
      `;
    })
    .join("");
  renderActivityTabs();
  renderNotifications();

  }
  function renderInbox() {
    const unread = state.conversations.reduce((sum, conversation) => sum + Number(conversation.unread || 0), 0);
    ui.inboxNavBadge.textContent = String(unread);
    ui.inboxNavBadge.hidden = unread === 0;

    const ordered = [...state.conversations].sort((a, b) => {
      const aLast = a.messages?.at(-1)?.at || 0;
      const bLast = b.messages?.at(-1)?.at || 0;
      return Number(bLast) - Number(aLast);
    });

    ui.conversationList.innerHTML = ordered
      .map((conversation) => {
        const last = conversation.messages?.at(-1);
        return `
          <button class="conversation-item" type="button" data-conversation-id="${escapeHTML(conversation.id)}">
            <span class="avatar">${escapeHTML(conversation.person.avatar)}</span>
            <span class="conversation-copy">
              <strong>${escapeHTML(conversation.person.name)}</strong>
              <span>${escapeHTML(last?.text || "Bắt đầu cuộc trò chuyện")}</span>
            </span>
            <span class="conversation-meta">
              <time>${last ? formatRelativeTime(last.at) : ""}</time>
              ${conversation.unread ? `<span class="unread-pill">${Number(conversation.unread)}</span>` : ""}
            </span>
          </button>
        `;
      })
      .join("");
  }

  function openConversation(conversationId) {
    const conversation = state.conversations.find((item) => item.id === conversationId);
    if (!conversation) return;
    state.activeConversationId = conversation.id;
    conversation.unread = 0;
    persist();
    renderInbox();
    renderChat();
    ui.inboxListView.hidden = true;
    ui.chatView.hidden = false;
    window.requestAnimationFrame(() => {
      ui.chatMessages.scrollTop = ui.chatMessages.scrollHeight;
      ui.chatInput.focus({ preventScroll: true });
    });
  }

  function closeConversation() {
    state.activeConversationId = null;
    ui.chatView.hidden = true;
    ui.inboxListView.hidden = false;
    persist();
  }

  function renderChat() {
    const conversation = state.conversations.find((item) => item.id === state.activeConversationId);
    if (!conversation) return;
    const listing = getListing(conversation.listingId);
    ui.chatPersonAvatar.textContent = conversation.person.avatar;
    ui.chatPersonName.textContent = conversation.person.name;
    ui.chatPersonStatus.textContent = conversation.person.online ? "Đang hoạt động" : "Thường trả lời trong vài giờ";

    if (listing) {
      ui.chatListingStrip.dataset.listingId = listing.id;
      ui.chatListingStrip.innerHTML = `
        <img src="${escapeHTML(listing.image)}" alt="${escapeHTML(listing.title)}" />
        <span class="chat-listing-copy">
          <strong>${escapeHTML(listing.title)}</strong>
          <span>${formatMoney(listing.price)}</span>
        </span>
        ${icon("chevron")}
      `;
      ui.chatListingStrip.hidden = false;
    } else {
      ui.chatListingStrip.hidden = true;
    }

    ui.chatMessages.innerHTML = (conversation.messages || []).map((message) => `
      <div class="message-bubble ${message.from === "me" ? "me" : "them"}">
        ${escapeHTML(message.text)}
        <time>${formatClock(message.at)}</time>
      </div>
    `).join("");
  }

  function renderProfile() {
    const user = seed.currentUser;
    ui.profileAvatar.textContent = user.avatar;
    ui.profileName.textContent = user.displayName;
    ui.profileUsername.textContent = `@${user.username}`;
    ui.profileLocation.textContent = user.location;
    ui.profileBio.textContent = user.bio;
    ui.profileRating.textContent = String(user.rating);
    ui.profileSold.textContent = String(user.soldCount);
    ui.profileFollowers.textContent = String(user.followers);
    ui.sellingCount.textContent = String(state.userListings.length);
    ui.savedCount.textContent = String(state.favorites.length);

    $$('[data-profile-tab]').forEach((button) => {
      button.classList.toggle("active", button.dataset.profileTab === state.profileTab);
    });

    const listings = state.profileTab === "selling"
      ? [...state.userListings].sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
      : allListings().filter((listing) => isFavorite(listing.id));

    ui.profileGrid.innerHTML = listings.map(listingCard).join("");
    ui.profileGrid.hidden = listings.length === 0;
    ui.profileEmpty.hidden = listings.length !== 0;
    ui.profileEmptyCopy.textContent = state.profileTab === "selling"
      ? "Các món bạn đăng sẽ xuất hiện ở đây."
      : "Nhấn biểu tượng trái tim để lưu món đồ bạn thích.";
    ui.profileEmptyButton.textContent = state.profileTab === "selling" ? "Đăng món đầu tiên" : "Khám phá món đồ";
  }

  function renderListingDetail(listing) {
    if (!listing) return;
    ui.detailImage.src = listing.image || listing.images?.[0] || "assets/item-01.svg";
    ui.detailImage.alt = listing.title;
    ui.detailFavorite.classList.toggle("active", isFavorite(listing.id));
    ui.detailFavorite.setAttribute("aria-label", isFavorite(listing.id) ? "Bỏ yêu thích" : "Yêu thích");
    ui.detailBrand.textContent = listing.brand || "Không rõ thương hiệu";
    ui.detailTitle.textContent = listing.title;
    ui.detailPrice.textContent = formatMoney(listing.price);
    ui.detailSize.textContent = listing.size || "—";
    ui.detailCondition.textContent = listing.condition || "—";
    ui.detailCategory.textContent = listing.subcategory || categoryLabel(listing.category);
    ui.detailLocation.textContent = listing.location || config.defaultLocation;
    ui.detailDescription.textContent = listing.description || "Người bán chưa thêm mô tả.";
    ui.detailTags.innerHTML = (listing.tags || []).map((tag) => `<span class="tag">#${escapeHTML(tag)}</span>`).join("");
    ui.detailSellerAvatar.textContent = listing.seller?.avatar || "N";
    ui.detailSellerName.textContent = listing.seller?.name || "Người bán newd";
    ui.detailSellerType.textContent = listing.seller?.type || "Tủ đồ cá nhân";
    ui.detailSellerRating.textContent = String(listing.seller?.rating || "Mới");
    const ownListing = listing.seller?.id === seed.currentUser.id;
    ui.messageSellerButton.disabled = ownListing;
    ui.messageSellerButton.textContent = ownListing ? "Món đồ của bạn" : "Nhắn tin";
    ui.buyNowButton.disabled = ownListing;
    ui.buyNowButton.textContent = ownListing ? "Chỉnh sửa" : "Mua ngay";
  }

  function openListing(listingId) {
    const listing = getListing(listingId);
    if (!listing) return;
    state.selectedListingId = listing.id;
    renderListingDetail(listing);
    ui.listingModal.hidden = false;
    ui.listingModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    persist();
  }

  function closeListing() {
    ui.listingModal.hidden = true;
    ui.listingModal.setAttribute("aria-hidden", "true");
    state.selectedListingId = null;
    document.body.style.overflow = "";
    persist();
  }

  function openFilter() {
    renderFilterControls();
    ui.filterModal.hidden = false;
    ui.filterModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeFilter() {
    ui.filterModal.hidden = true;
    ui.filterModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function openCheckout() {
    const listing = getListing(state.selectedListingId);
    if (!listing) return;
    const shipping = Number(config.shippingPreview);
    const total = Number(listing.price) + shipping;
    ui.checkoutSummary.innerHTML = `
      <div class="checkout-line"><span>${escapeHTML(listing.title)}</span><strong>${formatMoney(listing.price)}</strong></div>
      <div class="checkout-line"><span>Phí giao hàng dự kiến</span><strong>${formatMoney(shipping)}</strong></div>
      <div class="checkout-line total"><span>Tổng cộng</span><strong>${formatMoney(total)}</strong></div>
    `;
    ui.checkoutModal.hidden = false;
    ui.checkoutModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeCheckout() {
    ui.checkoutModal.hidden = true;
    ui.checkoutModal.setAttribute("aria-hidden", "true");
    if (ui.listingModal.hidden) document.body.style.overflow = "";
  }

  function navigate(screen) {
    if (!validScreens.has(screen)) return;
    state.activeScreen = screen;
    $$(".screen").forEach((section) => { section.classList.toggle("active", section.dataset.screen === screen); });
    $$(".nav-button").forEach((button) => { button.classList.toggle("active", button.dataset.nav === screen); });
    if (screen !== "inbox") closeConversation();
    if (screen === "home") renderHome();
    if (screen === "search") renderSearch();
    if (screen === "inbox") renderInbox();
    if (screen === "profile") renderProfile();
    updateHeader();
    window.scrollTo({ top: 0, behavior: "instant" });
    persist();
  }

  function showToast(message) {
    window.clearTimeout(toastTimer);
    ui.toast.textContent = message;
    ui.toast.hidden = false;
    toastTimer = window.setTimeout(() => { ui.toast.hidden = true; }, 2600);
  }

  function showOnboardingIfNeeded() {
    ui.onboarding.hidden = Boolean(state.onboardingSeen);
  }

  function completeOnboarding() {
    state.onboardingSeen = true;
    ui.onboarding.hidden = true;
    persist();
  }

  function clearFilters() {
    state.searchQuery = "";
    state.searchCategory = "all";
    state.searchSize = null;
    state.searchCondition = null;
    state.searchMaxPrice = 1000000;
    state.searchSort = "recommended";
    persist();
    renderSearch();
    closeFilter();
  }

  function resetSellForm() {
    ui.sellForm.reset();
    sellPhotos = [];
    renderPhotoPreviews();
    ui.sellTitleCount.textContent = "0";
    ui.sellDescriptionCount.textContent = "0";
    ui.sellFormError.hidden = true;
  }

  async function resizeImage(file) {
    if (!file.type.startsWith("image/")) throw new Error("Tệp không phải là ảnh.");
    const source = await fileToDataURL(file);
    return new Promise((resolve) => {
      const image = new Image();
      image.onload = () => {
        const maxDimension = 1100;
        const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      image.onerror = () => resolve(source);
      image.src = source;
    });
  }

  function fileToDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Không đọc được ảnh."));
      reader.readAsDataURL(file);
    });
  }

  async function handlePhotoSelection(files) {
    const selected = [...files].slice(0, 3);
    if (!selected.length) return;
    try {
      const resized = [];
      for (const file of selected) resized.push(await resizeImage(file));
      sellPhotos = resized;
      renderPhotoPreviews();
      showToast(`Đã thêm ${sellPhotos.length} ảnh.`);
    } catch (error) {
      showToast(error.message || "Không thể đọc ảnh này.");
    } finally {
      ui.photoInput.value = "";
    }
  }

  function submitListing(event) {
    event.preventDefault();
    const title = ui.sellTitle.value.trim();
    const category = ui.sellCategory.value;
    const size = ui.sellSize.value;
    const condition = ui.sellCondition.value;
    const price = Number(ui.sellPrice.value);

    const errors = [];
    if (!title) errors.push("Nhập tiêu đề món đồ.");
    if (!category) errors.push("Chọn danh mục.");
    if (!size) errors.push("Chọn kích thước.");
    if (!condition) errors.push("Chọn tình trạng.");
    if (!Number.isFinite(price) || price < 10000) errors.push("Giá bán tối thiểu là 10.000đ.");

    if (errors.length) {
      ui.sellFormError.textContent = errors.join(" ");
      ui.sellFormError.hidden = false;
      ui.sellFormError.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const categoryInfo = categoryMap.get(category);
    const images = sellPhotos.length ? [...sellPhotos] : ["assets/item-01.svg"];
    const listing = {
      id: `u-${Date.now()}`,
      title,
      price,
      category,
      subcategory: categoryInfo?.label || "Khác",
      brand: ui.sellBrand.value.trim() || "Không rõ thương hiệu",
      size,
      condition,
      location: seed.currentUser.location,
      seller: {
        id: seed.currentUser.id,
        name: seed.currentUser.displayName,
        avatar: seed.currentUser.avatar,
        rating: seed.currentUser.rating,
        type: "Tủ đồ cá nhân",
      },
      image: images[0],
      images,
      likes: 0,
      createdAt: Date.now(),
      description: ui.sellDescription.value.trim() || "Người bán chưa thêm mô tả.",
      tags: [categoryInfo?.label?.toLocaleLowerCase(config.locale) || "secondhand", size.toLocaleLowerCase(config.locale)],
    };

    state.userListings = [listing, ...state.userListings];
    state.homeCategory = "all";
    state.profileTab = "selling";
    persist();
    resetSellForm();
    renderHome();
    renderProfile();
    navigate("home");
    showToast("Đăng bán thành công trong bản thử nghiệm.");
    window.setTimeout(() => openListing(listing.id), 250);
  }

  function ensureConversationForListing(listing) {
    let conversation = state.conversations.find((item) => item.listingId === listing.id);
    if (conversation) return conversation;
    conversation = {
      id: `c-${Date.now()}`,
      listingId: listing.id,
      person: {
        id: listing.seller?.id || `seller-${Date.now()}`,
        name: listing.seller?.name || "Người bán",
        avatar: listing.seller?.avatar || "N",
        online: true,
      },
      unread: 0,
      messages: [{
        id: `m-${Date.now()}`,
        from: "them",
        text: `Chào bạn, ${listing.title.toLocaleLowerCase(config.locale)} vẫn còn nhé.`,
        at: Date.now(),
      }],
    };
    state.conversations = [conversation, ...state.conversations];
    persist();
    return conversation;
  }

  function messageSelectedSeller() {
    const listing = getListing(state.selectedListingId);
    if (!listing) return;
    if (listing.seller?.id === seed.currentUser.id) {
      showToast("Đây là món đồ của bạn.");
      return;
    }
    const conversation = ensureConversationForListing(listing);
    closeListing();
    navigate("inbox");
    openConversation(conversation.id);
  }

  function sendChatMessage(event) {
    event.preventDefault();
    const text = ui.chatInput.value.trim();
    if (!text) return;
    const conversation = state.conversations.find((item) => item.id === state.activeConversationId);
    if (!conversation) return;

    conversation.messages.push({ id: `m-${Date.now()}`, from: "me", text, at: Date.now() });
    ui.chatInput.value = "";
    persist();
    renderChat();
    window.requestAnimationFrame(() => { ui.chatMessages.scrollTop = ui.chatMessages.scrollHeight; });

    window.clearTimeout(replyTimer);
    replyTimer = window.setTimeout(() => {
      const stillExists = state.conversations.find((item) => item.id === conversation.id);
      if (!stillExists) return;
      const replies = [
        "Được nha, mình kiểm tra rồi nhắn bạn ngay ✨",
        "Món này vẫn còn nhé. Bạn cần mình đo thêm phần nào không?",
        "Mình có thể gửi hàng trong ngày mai nha.",
      ];
      stillExists.messages.push({
        id: `m-${Date.now()}-reply`,
        from: "them",
        text: replies[Math.floor(Math.random() * replies.length)],
        at: Date.now(),
      });
      if (state.activeConversationId !== conversation.id) stillExists.unread = Number(stillExists.unread || 0) + 1;
      persist();
      renderInbox();
      if (state.activeConversationId === conversation.id) {
        renderChat();
        window.requestAnimationFrame(() => { ui.chatMessages.scrollTop = ui.chatMessages.scrollHeight; });
      }
    }, 900);
  }

  async function shareSelectedListing() {
    const listing = getListing(state.selectedListingId);
    if (!listing) return;
    const shareData = { title: `${listing.title} trên newd`, text: `${listing.title} — ${formatMoney(listing.price)} trên newd.` };
    try {
      if (navigator.share) await navigator.share(shareData);
      else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareData.text);
        showToast("Đã sao chép thông tin món đồ.");
      } else showToast(shareData.text);
    } catch (error) {
      if (error?.name !== "AbortError") showToast("Chưa thể chia sẻ lúc này.");
    }
  }

  async function shareProfile() {
    const text = `Xem tủ đồ @${seed.currentUser.username} trên newd.`;
    try {
      if (navigator.share) await navigator.share({ title: "Tủ đồ newd", text });
      else if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        showToast("Đã sao chép thông tin hồ sơ.");
      } else showToast(text);
    } catch (error) {
      if (error?.name !== "AbortError") showToast("Chưa thể chia sẻ lúc này.");
    }
  }

  function confirmDemoOrder() {
    const listing = getListing(state.selectedListingId);
    if (!listing) return;
    state.demoOrders = [{
      id: `o-${Date.now()}`,
      listingId: listing.id,
      createdAt: Date.now(),
      total: Number(listing.price) + Number(config.shippingPreview),
    }, ...state.demoOrders];
    persist();
    closeCheckout();
    closeListing();
    showToast("Đã tạo đơn thử nghiệm. Không có tiền thật được xử lý.");
  }

  function goToSaved() {
    state.profileTab = "saved";
    navigate("profile");
    renderProfile();
  }

  function renderAllActiveViews() {
    renderHome();
    renderSearch();
    renderProfile();
    renderInbox();
    if (state.selectedListingId && !ui.listingModal.hidden) renderListingDetail(getListing(state.selectedListingId));
  }

  function handleAction(action) {
    switch (action) {
      case "go-saved":
        goToSaved();
        break;
      case "notifications":
        state.notifications = 0;
        ui.notificationBadge.hidden = true;
        persist();
        showToast("Bạn đã xem hết thông báo thử nghiệm.");
        break;
      case "close-listing":
        closeListing();
        break;
      case "share-listing":
        shareSelectedListing();
        break;
      case "more-listing":
        showToast("Báo cáo và tuỳ chọn sẽ được thêm ở phiên bản sau.");
        break;
      case "close-filter":
        closeFilter();
        break;
      case "clear-filters":
        clearFilters();
        break;
      case "close-checkout":
        closeCheckout();
        break;
      case "edit-profile":
        showToast("Màn hình chỉnh sửa hồ sơ chưa có trong bản thử nghiệm này.");
        break;
      case "share-profile":
        shareProfile();
        break;
      case "profile-more":
        showToast(`newd ${config.version} — bản thử nghiệm trên thiết bị của bạn.`);
        break;
      case "reset-demo":
        localStorage.removeItem(config.storageKey);
        window.location.reload();
        break;
      default:
        break;
    }
  }

  function bindEvents() {
    document.addEventListener("click", (event) => {
      const nav = event.target.closest("[data-nav]");
      if (nav) {
        navigate(nav.dataset.nav);
        return;
      }

      const action = event.target.closest("[data-action]");
      if (action) {
        handleAction(action.dataset.action);
        return;
      }

      const favorite = event.target.closest("[data-favorite-id]");
      if (favorite) {
        toggleFavorite(favorite.dataset.favoriteId);
        return;
      }

      const listing = event.target.closest("[data-listing-id]");
      if (listing) {
        openListing(listing.dataset.listingId);
        return;
      }

      const homeCategory = event.target.closest("[data-home-category]");
      if (homeCategory) {
        state.homeCategory = homeCategory.dataset.homeCategory;
        persist();
        renderHome();
        return;
      }

      const browseCategory = event.target.closest("[data-browse-category]");
      if (browseCategory) {
        state.searchCategory = browseCategory.dataset.browseCategory;
        state.searchQuery = "";
        persist();
        renderSearch();
        return;
      }

      const suggestion = event.target.closest("[data-suggestion-query]");
      if (suggestion) {
        state.searchQuery = suggestion.dataset.suggestionQuery;
        persist();
        renderSearch();
        ui.searchInput.focus();
        return;
      }

      const filterSize = event.target.closest("[data-filter-size]");
      if (filterSize) {
        const value = filterSize.dataset.filterSize;
        state.searchSize = state.searchSize === value ? null : value;
        persist();
        renderFilterControls();
        return;
      }

      const filterCondition = event.target.closest("[data-filter-condition]");
      if (filterCondition) {
        const value = filterCondition.dataset.filterCondition;
        state.searchCondition = state.searchCondition === value ? null : value;
        persist();
        renderFilterControls();
        return;
      }
      const activityTab = event.target.closest(
        "[data-activity-tab]"
      );
      if (activityTab) {
        state.activityTab = activityTab.dataset.activityTab;

        persist();
        renderActivityTabs();

        return;
      }
      const conversation = event.target.closest("[data-conversation-id]");
      if (conversation) {
        openConversation(conversation.dataset.conversationId);
        return;
      }
      const notificationButton = event.target.closest(
        "[data-notification-id]"
      );

      if (notificationButton) {
        const notification = state.notifications.find(
          (item) =>
            item.id === notificationButton.dataset.notificationId
        );

        if (!notification) return;

        notification.read = true;

        persist();
        renderNotifications();
        renderActivityTabs();

        if (
          notification.listingId &&
          getListing(notification.listingId)
        ) {
          openListing(notification.listingId);
        } else {
          showToast(notification.title);
        }

        return;
      }
      const profileTab = event.target.closest("[data-profile-tab]");
      if (profileTab) {
        state.profileTab = profileTab.dataset.profileTab;
        persist();
        renderProfile();
        return;
      }

      const removePhoto = event.target.closest("[data-remove-photo]");
      if (removePhoto) {
        sellPhotos.splice(Number(removePhoto.dataset.removePhoto), 1);
        renderPhotoPreviews();
      }
    });

    if (ui.openFilterButton) ui.openFilterButton.addEventListener("click", openFilter);
    ui.applyFilterButton.addEventListener("click", () => {
      persist();
      renderSearch();
      closeFilter();
    });
    ui.filterPrice.addEventListener("input", () => {
      state.searchMaxPrice = Number(ui.filterPrice.value);
      ui.filterPriceOutput.textContent = formatMoney(state.searchMaxPrice);
    });

    ui.searchInput.addEventListener("input", () => {
      state.searchQuery = ui.searchInput.value;
      if (state.searchQuery.trim()) state.searchCategory = "all";
      persist();
      renderSearch();
    });
    ui.clearSearch.addEventListener("click", () => {
      state.searchQuery = "";
      state.searchCategory = "all";
      persist();
      renderSearch();
      ui.searchInput.focus();
    });
    ui.sortSelect.addEventListener("change", () => {
      state.searchSort = ui.sortSelect.value;
      persist();
      renderSearch();
    });

    ui.photoInput.addEventListener("change", () => handlePhotoSelection(ui.photoInput.files));
    ui.sellTitle.addEventListener("input", () => { ui.sellTitleCount.textContent = String(ui.sellTitle.value.length); });
    ui.sellDescription.addEventListener("input", () => { ui.sellDescriptionCount.textContent = String(ui.sellDescription.value.length); });
    ui.sellForm.addEventListener("submit", submitListing);

    ui.chatBackButton.addEventListener("click", closeConversation);
    ui.chatForm.addEventListener("submit", sendChatMessage);
    ui.chatListingStrip.addEventListener("click", () => {
      if (ui.chatListingStrip.dataset.listingId) openListing(ui.chatListingStrip.dataset.listingId);
    });

    ui.detailFavorite.addEventListener("click", () => {
      if (state.selectedListingId) toggleFavorite(state.selectedListingId);
    });
    ui.messageSellerButton.addEventListener("click", messageSelectedSeller);
    ui.buyNowButton.addEventListener("click", () => {
      const listing = getListing(state.selectedListingId);
      if (listing?.seller?.id === seed.currentUser.id) showToast("Chỉnh sửa tin đăng sẽ được thêm ở phiên bản sau.");
      else openCheckout();
    });
    ui.detailSellerCard.addEventListener("click", () => {
      const listing = getListing(state.selectedListingId);
      if (listing) showToast(`Tủ đồ của ${listing.seller?.name || "người bán"} sẽ được mở ở phiên bản sau.`);
    });
    ui.confirmDemoOrder.addEventListener("click", confirmDemoOrder);

    ui.profileEmptyButton.addEventListener("click", () => {
      navigate(state.profileTab === "selling" ? "sell" : "home");
    });

    ui.startDemoButton.addEventListener("click", completeOnboarding);
    ui.skipOnboardingButton.addEventListener("click", completeOnboarding);

    window.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      if (!ui.checkoutModal.hidden) closeCheckout();
      else if (!ui.filterModal.hidden) closeFilter();
      else if (!ui.listingModal.hidden) closeListing();
      else if (!ui.chatView.hidden) closeConversation();
    });
  }

  function init() {
    applyBrand();
    populateSellSelects();
    renderFilterControls();
    bindEvents();
    renderHome();
    renderSearch();
    renderInbox();
    renderProfile();
    updateHeader();
    navigate(validScreens.has(state.activeScreen) ? state.activeScreen : "home");
    showOnboardingIfNeeded();
  }

  init();
})();
