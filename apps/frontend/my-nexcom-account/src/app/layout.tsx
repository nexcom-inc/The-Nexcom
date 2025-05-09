import { AuthContextProvider } from '../context/auth.context';
import './global.css';

export const metadata = {
  title: 'Welcome to my-nexcom-account',
  description: 'Generated by create-nx-workspace',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthContextProvider>
        {children}
        </AuthContextProvider>
      </body>
    </html>
  );
}
