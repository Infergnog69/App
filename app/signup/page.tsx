// The sign up page, at /signup.
import AuthForm from "@/components/AuthForm";
import { signUp } from "@/app/auth/actions";

export default async function SignupPage({ searchParams }: PageProps<"/signup">) {
  const { error } = await searchParams;
  return (
    <AuthForm
      title="Đăng ký"
      submitLabel="Tạo tài khoản"
      action={signUp}
      error={typeof error === "string" ? error : undefined}
      switchText="Đã có tài khoản?"
      switchHref="/login"
      switchLabel="Đăng nhập"
    />
  );
}
