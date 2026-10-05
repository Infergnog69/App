// "Chỉnh sửa hồ sơ" (/profile/edit): name, username, city and a short bio.
// All of this is public, so we never ask for phone numbers or addresses here.
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, getUserId } from "@/lib/data";
import { LOCATIONS } from "@/lib/listings";
import { updateProfile } from "@/app/actions/profile";

export default async function EditProfilePage({ searchParams }: PageProps<"/profile/edit">) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const userId = await getUserId(supabase);
  if (!userId) redirect("/login");
  const profile = await getProfile(supabase, userId);

  return (
    <section className="screen active">
      <form action={updateProfile} className="sell-form">
        <section className="form-section">
          <div className="form-section-title">
            <span className="form-step">1</span>
            <div>
              <h2>Hồ sơ công khai</h2>
              <p>Mọi người trên newd đều xem được thông tin này. Email của bạn không bao giờ hiển thị.</p>
            </div>
          </div>
          <label className="form-field">
            <span>Tên hiển thị *</span>
            <input name="displayName" required maxLength={50} defaultValue={profile?.display_name ?? ""} />
          </label>
          <label className="form-field">
            <span>Tên người dùng</span>
            <input name="username" maxLength={31} placeholder="vd: minhcloset" defaultValue={profile?.username ?? ""} />
          </label>
          <label className="form-field">
            <span>Khu vực</span>
            <select name="location" defaultValue={profile?.location ?? ""}>
              <option value="">Không hiển thị</option>
              {LOCATIONS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span>Giới thiệu</span>
            <textarea name="bio" maxLength={300} rows={3} placeholder="Dọn tủ chậm, chọn đồ kỹ..." defaultValue={profile?.bio ?? ""} />
          </label>
        </section>
        {typeof error === "string" && <div className="form-error" role="alert">{error}</div>}
        <button className="primary-button sell-submit" type="submit">Lưu hồ sơ</button>
      </form>
    </section>
  );
}
