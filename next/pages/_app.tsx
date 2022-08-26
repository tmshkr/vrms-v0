import "../styles/globals.scss";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import { Dashboard } from "components/Dashboard";
import Cookies from "js-cookie";

// Use of the <SessionProvider> is mandatory to allow components that call
// `useSession()` anywhere in your application to access the `session` object.
export default function App({ Component, pageProps }: AppProps) {
  const cookies = Cookies.get();
  if (cookies) {
    const { redirect_to } = cookies;
    if (redirect_to) {
      window.location.replace(redirect_to);
    }
  }

  return (
    <SessionProvider session={pageProps.session} refetchInterval={0}>
      <Dashboard>
        <Component {...pageProps} />
      </Dashboard>
    </SessionProvider>
  );
}
