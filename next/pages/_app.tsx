import "../styles/globals.scss";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import { useSession } from "next-auth/react";
import { Dashboard } from "components/Dashboard";
import Cookies from "js-cookie";

// Use of the <SessionProvider> is mandatory to allow components that call
// `useSession()` anywhere in your application to access the `session` object.
export default function App({
  Component,
  pageProps,
}: AppProps & {
  Component: {
    auth: {
      role?: string;
    };
  };
}) {
  const cookies = Cookies.get();
  if (cookies) {
    const { redirect_to } = cookies;
    if (redirect_to) {
      Cookies.remove("redirect_to");
      window.location.replace(redirect_to);
      return null;
    }
  }

  return (
    <SessionProvider session={pageProps.session} refetchInterval={0}>
      <Dashboard>
        {Component.auth ? (
          <Auth>
            <Component {...pageProps} />
          </Auth>
        ) : (
          <Component {...pageProps} />
        )}
      </Dashboard>
    </SessionProvider>
  );
}

function Auth({ children }) {
  // if `{ required: true }` is supplied, `status` can only be "loading" or "authenticated"
  const { status } = useSession({ required: true });

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return children;
}
