import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import VehiclesPage from "@/pages/vehicles-page";
import PaymentPage from "@/pages/payment-page";
import TransactionsPage from "@/pages/transactions-page";
import StationsPage from "@/pages/stations-page";
import StationDashboard from "@/pages/station/dashboard";
import StationTransactions from "@/pages/station/transactions";
import StationReports from "@/pages/station/reports";
import { ProtectedRoute } from "./lib/protected-route";
import AppSwitcher from "./components/app-switcher";
import { useEffect, useState } from "react";
import { WebSocketProvider } from "./contexts/websocket-provider";

function Router() {
  const [location] = useLocation();
  const [appType, setAppType] = useState<"customer" | "station">("customer");

  // Detect which app to display based on URL
  useEffect(() => {
    if (location.startsWith("/station")) {
      setAppType("station");
    } else {
      setAppType("customer");
    }
  }, [location]);

  return (
    <>
      <AppSwitcher appType={appType} />
      <Switch>
        {/* Customer App Routes */}
        <ProtectedRoute path="/" component={HomePage} />
        <ProtectedRoute path="/vehicles" component={VehiclesPage} />
        <ProtectedRoute path="/payment" component={PaymentPage} />
        <ProtectedRoute path="/transactions" component={TransactionsPage} />
        <ProtectedRoute path="/stations" component={StationsPage} />
        
        {/* Station App Routes */}
        <ProtectedRoute path="/station" component={StationDashboard} />
        <ProtectedRoute path="/station/transactions" component={StationTransactions} />
        <ProtectedRoute path="/station/reports" component={StationReports} />
        
        {/* Auth Route */}
        <Route path="/auth" component={AuthPage} />
        
        {/* Fallback to 404 */}
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <TooltipProvider>
      <WebSocketProvider>
        <Toaster />
        <Router />
      </WebSocketProvider>
    </TooltipProvider>
  );
}

export default App;
