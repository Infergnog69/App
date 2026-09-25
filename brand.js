window.NEWD_CONFIG = Object.freeze({
  version: "0.2.1-test",
  storageKey: "newd-mvp-test-v2-1",

  brand: {
    name: "newd",
    slogan: "MỚI VỚI BẠN.",
    headline: "Đồ cũ, cảm hứng mới.",
    description:
      "Nền tảng thời trang secondhand nơi mỗi món đồ tìm thấy một chủ nhân mới.",
  },

  locale: "vi-VN",
  currency: "VND",
  currencySymbol: "đ",
  defaultLocation: "TP. Hồ Chí Minh",
  shippingPreview: 30000,

  theme: {
    coral: "#F47D6B",
    coralDark: "#E45F4E",
    butter: "#FFF1B6",
    sky: "#DDE9F7",
    sage: "#E6F2E4",
    warmWhite: "#FAF7F2",
    charcoal: "#2E2E2E",
    muted: "#7A746D",
    line: "#E7DED3",
    surface: "#FFFFFF",
  },

  categories: [
    { id: "all", label: "Tất cả", icon: "sparkles", colour: "#FFF5D1" },
    { id: "women", label: "Nữ", icon: "dress", colour: "#FFF1B6" },
    { id: "men", label: "Nam", icon: "shirt", colour: "#DDE9F7" },
    { id: "accessories", label: "Phụ kiện", icon: "glasses", colour: "#FAD8CF" },
    { id: "shoes", label: "Giày dép", icon: "shoe", colour: "#E6F2E4" },
    { id: "designer", label: "Designer", icon: "bag", colour: "#ECE8E2" },
    { id: "vintage", label: "Vintage", icon: "bag", colour: "#F5E9D6" },
    { id: "kids", label: "Trẻ con", icon: "dress", colour: "#FBE1D8" }
  ],

  homeCategoryIds: ["all", "women", "men", "accessories", "shoes"],
  searchBrowseCategoryIds: ["women", "men", "shoes", "accessories", "designer", "vintage", "kids"],

  sizes: ["XS", "S", "M", "L", "XL", "Freesize", "36", "37", "38", "39", "40", "41"],
  conditions: ["Mới còn tag", "Like new", "Rất tốt", "Tốt", "Đã qua sử dụng"],
  locations: ["TP. Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Cần Thơ", "Hải Phòng"],
});
