import { redirect } from "next/navigation";
import LoginCard from "../../components/login-card";
const LoginPage = async ({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) => {
  const params = await searchParams;
  const redirectParam = params.redirect;
  const serviceName = params.serviceName;

  if (redirectParam === "true" && serviceName) {
    redirect("http://localhost:3001");
  }

  return (
    <div className="h-screen flex items-center justify-center">
      <LoginCard />
    </div>
  );
};

export default LoginPage;
