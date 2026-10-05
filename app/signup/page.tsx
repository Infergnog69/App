// The sign up page, at /signup.
import AuthForm from "@/components/AuthForm";
import { signUp } from "@/app/auth/actions";

export default async function SignupPage({ searchParams }: PageProps<"/signup">) {
  const { error } = await searchParams;
  return (
    <AuthForm
      heading="Tạo tài khoản"
      intro="Tên hiển thị sẽ hiện trên hồ sơ của bạn. Email luôn được giữ kín."
      submitLabel="Tạo tài khoản"
      action={signUp}
      askName
      error={typeof error === "string" ? error : undefined}
      switchText="Đã có tài khoản?"
      switchHref="/login"
      switchLabel="Đăng nhập"
    />
  );
}
