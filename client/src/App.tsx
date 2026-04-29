import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Home from "@/pages/Home";
import RSVP from "@/pages/RSVP";
import Invitation from "@/pages/Invitation";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/NotFound";
import CodeGate from "@/components/CodeGate";

function Router() {
  return (
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
