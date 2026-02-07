import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/lib/i18n";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Hotels from "@/pages/Hotels";
import HotelDetails from "@/pages/HotelDetails";
import Gallery from "@/pages/Gallery";
import Contact from "@/pages/Contact";
import Careers from "@/pages/Careers";
import About from "@/pages/About";
import CMSDashboard from "@/pages/admin/CMSDashboard";
import CMSPages from "@/pages/admin/CMSPages";
import CMSHotels from "@/pages/admin/CMSHotels";
import CMSSettings from "@/pages/admin/CMSSettings";
import Login from "@/pages/admin/Login";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/hotels" component={Hotels} />
      <Route path="/gallery" component={Gallery} />
      <Route path="/contact" component={Contact} />
      <Route path="/careers" component={Careers} />
      <Route path="/about" component={About} />

      {/* Admin Routes */}
      <Route path="/controlpanal" component={Login} />
      <Route path="/controlpanal/dashboard" component={CMSDashboard} />
      <Route path="/controlpanal/pages" component={CMSPages} />
      <Route path="/controlpanal/hotels" component={CMSHotels} />
      <Route path="/controlpanal/settings" component={CMSSettings} />
      
      {/* Dynamic hotel page routing with sections */}
      <Route path="/:hotelId" component={HotelDetails} />
      <Route path="/:hotelId/:section" component={HotelDetails} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <I18nProvider>
          <Toaster />
          <Router />
        </I18nProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
