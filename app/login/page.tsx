// The log in page, at /login.
import AuthForm from "@/components/AuthForm";
import { logIn } from "@/app/auth/actions";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  // searchParams holds anything after "?" in the address, e.g. ?error=...
  const { error, message } = await searchParams;
  return (
    <AuthForm
      heading="Chào mừng trở lại"
      intro="Đăng nhập để mua, bán và nhắn tin trên newd."
      submitLabel="Đăng nhập"
      action={logIn}
      error={typeof error === "string" ? error : undefined}
      message={typeof message === "string" ? message : undefined}
      switchText="Chưa có tài khoản?"
      switchHref="/signup"
      switchLabel="Đăng ký"
    />
  );
}
