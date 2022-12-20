import React, { useEffect } from 'react';
import { AreaProvider } from 'react-area';
import { QueryClientProvider, useQuery } from 'react-query';
import {
  HashRouter as Router,
  Routes,
  Route,
  useLocation,
  Link,
  Outlet,
  Navigate,
} from 'react-router-dom';
import { GetStarted } from 'src/ui/pages/GetStarted';
import { Intro } from 'src/ui/pages/Intro';
import { Overview } from 'src/ui/pages/Overview';
import { RouteResolver } from 'src/ui/pages/RouteResolver';
import { RequestAccounts } from 'src/ui/pages/RequestAccounts';
import { SendTransaction } from 'src/ui/pages/SendTransaction';
import { SignMessage } from 'src/ui/pages/SignMessage';
import { Login } from '../pages/Login';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { accountPublicRPCPort, walletPort } from '../shared/channels';
import { CreateAccount } from '../pages/CreateAccount';
import { getPageTemplateType } from '../shared/getPageTemplateName';
import { closeOtherWindows } from '../shared/closeOtherWindows';
import { URLBar } from '../components/URLBar';
import { SwitchEthereumChain } from '../pages/SwitchEthereumChain';
import { DesignTheme } from '../components/DesignTheme';
import { FillView } from '../components/FillView';
import { ViewError } from '../components/ViewError';
import { ViewArea } from '../components/ViewArea';
import { Settings } from '../pages/Settings';
import { Networks } from '../pages/Networks';
import { BackupWallet } from '../pages/BackupWallet';
import { ManageWallets } from '../pages/ManageWallets';
import { WalletSelect } from '../pages/WalletSelect';
import { NotFoundPage } from '../components/NotFoundPage';
import { UIText } from '../ui-kit/UIText';
import { defaultUIContextValue, UIContext } from '../components/UIContext';
import { ConnectedSites } from '../pages/ConnectedSites';
import { InactivityDetector } from '../components/Session/InactivityDetector';
import { SessionResetHandler } from '../components/Session/SessionResetHandler';
import { ViewSuspense } from '../components/ViewSuspense';
import { VersionUpgrade } from '../components/VersionUpgrade';
import { queryClient } from '../shared/requests/queryClient';
import { ForgotPassword } from '../pages/ForgotPassword';
import { BugReportButton } from '../components/BugReportButton';
import { Receive } from '../pages/Receive';
import { KeyboardShortcut } from '../components/KeyboardShortcut';

function View() {
  const location = useLocation();
  return (
    <div>
      <div>Path: {location.pathname}</div>
      <div>window pathname: {window.location.pathname}</div>
      <div>window hash: {window.location.hash}</div>
      <div style={{ wordBreak: 'break-all' }}>
        window href: {window.location.href}
      </div>
      <div>
        <Link to="/hello">go to hello</Link>
      </div>
      <div>
        <Link to="/hello?param=one&hello=two">go to hello with params</Link>
      </div>
      <div>
        <Link to="/requestAccounts?param=one&hello=two">
          go to requestAccounts
        </Link>
      </div>
      outlet:
      <Outlet />
    </div>
  );
}

const useAuthState = () => {
  const { data, isFetching } = useQuery(
    'authState',
    async () => {
      const [isAuthenticated, existingUser, wallet] = await Promise.all([
        accountPublicRPCPort.request('isAuthenticated'),
        accountPublicRPCPort.request('getExistingUser'),
        walletPort.request('uiGetCurrentWallet'),
      ]);
      return {
        isAuthenticated,
        existingUser,
        wallet,
      };
    },
    { useErrorBoundary: true, retry: false, refetchOnWindowFocus: false }
  );
  const { isAuthenticated, existingUser, wallet } = data || {};
  // const { data: isAuthenticated, ...isAuthenticatedQuery } = useQuery(
  //   'isAuthenticated',
  //   () => accountPublicRPCPort.request('isAuthenticated'),
  //   { useErrorBoundary: true, retry: false }
  // );
  // const { data: existingUser, ...getExistingUserQuery } = useQuery(
  //   'getExistingUser',
  //   () => accountPublicRPCPort.request('getExistingUser'),
  //   { useErrorBoundary: true, retry: false }
  // );
  // const { data: wallet, ...currentWalletQuery } = useQuery(
  //   'wallet/getCurrentWallet',
  //   () => walletPort.request('getCurrentWallet'),
  //   { useErrorBoundary: true, retry: false }
  // );
  // const isLoading =
  //   isAuthenticatedQuery.isFetching ||
  //   getExistingUserQuery.isFetching ||
  //   currentWalletQuery.isLoading;
  return {
    isAuthenticated: Boolean(isAuthenticated && wallet),
    existingUser,
    isLoading: isFetching,
  };
};

function SomeKindOfResolver({
  noUser,
  notAuthenticated,
  authenticated,
}: {
  noUser: JSX.Element;
  notAuthenticated: JSX.Element;
  authenticated: JSX.Element;
}) {
  const { isLoading, isAuthenticated, existingUser } = useAuthState();
  if (isLoading) {
    return null;
  }
  if (!existingUser) {
    return noUser;
  }
  if (!isAuthenticated) {
    return notAuthenticated;
  }
  return authenticated;
}

function RequireAuth({ children }: { children: JSX.Element }) {
  const location = useLocation();
  const { isLoading, isAuthenticated, existingUser } = useAuthState();

  if (isLoading) {
    return null;
  }

  if (!existingUser) {
    return <Navigate to="/" replace={true} />;
  } else if (!isAuthenticated) {
    return (
      <Navigate
        to={`/login?next=${encodeURIComponent(
          `${location.pathname}${location.search}`
        )}`}
        replace={true}
      />
    );
  }

  return children;
}

const templateType = getPageTemplateType();

function Views() {
  return (
    <RouteResolver>
      <ViewArea>
        <URLBar />
        <Routes>
          <Route
            path="/"
            element={
              <SomeKindOfResolver
                noUser={<Navigate to="/intro" replace={true} />}
                notAuthenticated={<Navigate to="/login" replace={true} />}
                authenticated={<Navigate to="/overview" replace={true} />}
              />
            }
          />
          <Route path="/intro" element={<Intro />} />
          <Route path="/create-account" element={<CreateAccount />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/get-started/*" element={<GetStarted />} />
          <Route path="/hello" element={<View />} />
          <Route path="/receive" element={<Receive />} />
          <Route
            path="/overview/*"
            element={
              <RequireAuth>
                <Overview />
              </RequireAuth>
            }
          />
          <Route
            path="/settings/*"
            element={
              <RequireAuth>
                <Settings />
              </RequireAuth>
            }
          />
          <Route
            path="/networks"
            element={
              <RequireAuth>
                <Networks />
              </RequireAuth>
            }
          />
          <Route
            path="/backup-wallet/*"
            element={
              <RequireAuth>
                <BackupWallet />
              </RequireAuth>
            }
          />
          <Route
            path="/requestAccounts"
            element={
              <RequireAuth>
                <RequestAccounts />
              </RequireAuth>
            }
          />
          <Route
            path="/sendTransaction"
            element={
              <RequireAuth>
                <SendTransaction />
              </RequireAuth>
            }
          />
          <Route
            path="/signMessage"
            element={
              <RequireAuth>
                <SignMessage />
              </RequireAuth>
            }
          />
          <Route
            path="/switchEthereumChain"
            element={
              <RequireAuth>
                <SwitchEthereumChain />
              </RequireAuth>
            }
          />
          <Route
            path="/wallets/*"
            element={
              <RequireAuth>
                <ManageWallets />
              </RequireAuth>
            }
          />
          <Route
            path="/wallet-select"
            element={
              <RequireAuth>
                <WalletSelect />
              </RequireAuth>
            }
          />
          <Route
            path="/connected-sites/*"
            element={
              <RequireAuth>
                <ConnectedSites />
              </RequireAuth>
            }
          />
          <Route
            path="/not-implemented"
            element={
              <FillView>
                <UIText
                  kind="subtitle/l_reg"
                  color="var(--neutral-500)"
                  style={{ padding: 20, textAlign: 'center' }}
                >
                  This View is not Implemented
                </UIText>
              </FillView>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </ViewArea>
    </RouteResolver>
  );
}

function CloseOtherWindows() {
  useEffect(() => {
    if (templateType === 'popup') {
      // window.location.hash = '#/get-started/import'
      closeOtherWindows();
    }
  }, []);
  return null;
}

export function App() {
  return (
    <AreaProvider>
      <UIContext.Provider value={defaultUIContextValue}>
        <QueryClientProvider client={queryClient}>
          <Router>
            <ErrorBoundary
              renderError={(error) => (
                <FillView>
                  <ViewError error={error} />
                </FillView>
              )}
            >
              <InactivityDetector />
              <SessionResetHandler />
              <DesignTheme templateType={templateType || 'popup'} />
              <KeyboardShortcut
                combination="ctrl+alt+0"
                onKeyDown={() => {
                  // Helper for development and debugging :)
                  window.open(window.location.href, '_blank');
                }}
              />
              <VersionUpgrade>
                <CloseOtherWindows />
                <ViewSuspense>
                  <Views />
                </ViewSuspense>
              </VersionUpgrade>
            </ErrorBoundary>
            <BugReportButton />
          </Router>
        </QueryClientProvider>
      </UIContext.Provider>
    </AreaProvider>
  );
}
