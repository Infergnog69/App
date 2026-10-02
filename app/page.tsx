// The home page. In Next.js, the file app/page.tsx is what you see at "/".
import styles from "./page.module.css";

// The category list from the prototype (prototype/brand.js). For now it's
// written straight into the code; later it will come from the database.
const categories = [
  { label: "Nữ", colour: "#FFF1B6" },
  { label: "Nam", colour: "#DDE9F7" },
  { label: "Phụ kiện", colour: "#FAD8CF" },
  { label: "Giày dép", colour: "#E6F2E4" },
  { label: "Designer", colour: "#ECE8E2" },
  { label: "Vintage", colour: "#F5E9D6" },
  { label: "Trẻ con", colour: "#FBE1D8" },
];

export default function Home() {
  return (
    <main className={styles.page}>
      <header>
        <p className={styles.logo}>newd</p>
        <p className={styles.slogan}>MỚI VỚI BẠN.</p>
      </header>

      <section className={styles.hero}>
        <h1>Đồ cũ, cảm hứng mới.</h1>
        <p>
          Nền tảng thời trang secondhand nơi mỗi món đồ tìm thấy một chủ nhân
          mới.
        </p>
      </section>

      <ul className={styles.categories}>
        {/* .map() turns each item in the list into one bubble on screen */}
        {categories.map((category) => (
          <li
            key={category.label}
            className={styles.category}
            style={{ background: category.colour }}
          >
            {category.label}
          </li>
        ))}
      </ul>

      <p className={styles.note}>Newd v0.3: bản đầu tiên chạy bằng Next.js.</p>
    </main>
  );
}
