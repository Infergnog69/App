// One form used by both the sign up and log in pages, so they look the same.
import Link from "next/link";
import styles from "./AuthForm.module.css";

type Props = {
  title: string;
  submitLabel: string;
  action: (formData: FormData) => Promise<void>;
  error?: string;
  message?: string;
  switchText: string;
  switchHref: string;
  switchLabel: string;
};

export default function AuthForm(props: Props) {
  return (
    <main className={styles.page}>
      <h1 className={styles.title}>{props.title}</h1>

      {props.error && <p className={styles.error}>{props.error}</p>}
      {props.message && <p className={styles.message}>{props.message}</p>}

      <form action={props.action} className={styles.form}>
        <label className={styles.label}>
          Email
          <input name="email" type="email" required autoComplete="email" className={styles.input} />
        </label>
        <label className={styles.label}>
          Mật khẩu
          <input
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="current-password"
            className={styles.input}
          />
        </label>
        <button type="submit" className={styles.button}>
          {props.submitLabel}
        </button>
      </form>

      <p className={styles.switch}>
        {props.switchText} <Link href={props.switchHref}>{props.switchLabel}</Link>
      </p>
    </main>
  );
}
