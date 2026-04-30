import { lazy, Suspense } from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Home from "@/pages/Home";
import CodeGate from "@/components/CodeGate";

const RSVP = lazy(() => import("@/pages/RSVP"));
const Invitation = lazy(() => import("@/pages/Invitation"));
const Admin = lazy(() => import("@/pages/Admin"));
const NotFound = lazy(() => import("@/pages/NotFound"));

function PageFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Switch>
        <Route path="/">
          <CodeGate>
            <Home />
          </CodeGate>
        </Route>
        <Route path="/rsvp" component={RSVP} />
        <Route path="/invitation/:token" component={Invitation} />
        <Route path="/admin" component={Admin} />
        <Route path="/accueil" component={Admin} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}
