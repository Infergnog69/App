// One form used by both the sign up and log in pages, in the prototype's card style.
import Link from "next/link";

type Props = {
  heading: string;
  intro: string;
  submitLabel: string;
  action: (formData: FormData) => Promise<void>;
  askName?: boolean; // sign up also asks for a display name
  error?: string;
  message?: string;
  switchText: string;
  switchHref: string;
  switchLabel: string;
};

export default function AuthForm(props: Props) {
  return (
    <section className="screen active">
      <form action={props.action} className="sell-form">
        {props.message && <div className="form-notice">{props.message}</div>}

        <section className="form-section">
          <div className="form-section-title">
            <div>
              <h2>{props.heading}</h2>
              <p>{props.intro}</p>
            </div>
          </div>

          {props.askName && (
            <label className="form-field">
              <span>Tên hiển thị</span>
              <input name="displayName" maxLength={50} placeholder="Ví dụ: Minh Anh" autoComplete="nickname" />
            </label>
          )}
          <label className="form-field">
            <span>Email</span>
            <input name="email" type="email" required autoComplete="email" />
          </label>
          <label className="form-field">
            <span>Mật khẩu</span>
            <input name="password" type="password" required minLength={8} autoComplete={props.askName ? "new-password" : "current-password"} />
          </label>
        </section>

        {props.error && <div className="form-error" role="alert">{props.error}</div>}

        <button type="submit" className="primary-button sell-submit">
          {props.submitLabel}
        </button>

        <p className="auth-switch">
          {props.switchText} <Link href={props.switchHref}>{props.switchLabel}</Link>
        </p>
      </form>
    </section>
  );
}
