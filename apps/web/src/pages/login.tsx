import { useNavigate } from "react-router";
import { LoginForm } from "@/components/auth/login-form";
import { toast } from "@/components/ui/toast";
import { type SignInDto, useAuth } from "@/hooks/use-auth";
import { getErrorMessage } from "@/lib/api-client";

export function LoginPage() {
  const { login, isLoggingIn } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (values: SignInDto) => {
    try {
      await login(values);
      navigate("/");
    } catch (err) {
      toast.add({
        type: "error",
        title: "Login failed",
        description: getErrorMessage(err),
      });
      console.error("Login failed:", err);
    }
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm onSubmit={handleLogin} isLoggingIn={isLoggingIn} />
      </div>
    </div>
  );
}

export default LoginPage;
