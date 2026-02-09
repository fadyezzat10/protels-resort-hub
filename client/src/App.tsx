import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/lib/i18n";
import BookingAssistant from "@/components/BookingAssistant";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Hotels from "@/pages/Hotels";
import HotelDetails from "@/pages/HotelDetails";
import Gallery from "@/pages/Gallery";
import Contact from "@/pages/Contact";
import Careers from "@/pages/Careers";
import About from "@/pages/About";
import Dashboard from "@/pages/admin/Dashboard";
import UsersPage from "@/pages/admin/Users";
import NewsletterPage from "@/pages/admin/Newsletter";
import Login from "@/pages/admin/Login";
import CMSLogin from "@/pages/cms/CMSLogin";
import CMSDashboard from "@/pages/cms/CMSDashboard";
import CMSPages from "@/pages/cms/CMSPages";
import CMSHotels from "@/pages/cms/CMSHotels";
import CMSMedia from "@/pages/cms/CMSMedia";
import CMSSeo from "@/pages/cms/CMSSeo";
import CMSSettings from "@/pages/cms/CMSSettings";
import CMSHead from "@/components/CMSHead";

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
      <Route path="/admin" component={Login} />
      <Route path="/admin/dashboard" component={Dashboard} />
      <Route path="/admin/users" component={UsersPage} />
      <Route path="/admin/newsletter" component={NewsletterPage} />

      {/* CMS Routes */}
      <Route path="/controlpanal" component={CMSLogin} />
      <Route path="/controlpanal/dashboard" component={CMSDashboard} />
      <Route path="/controlpanal/pages" component={CMSPages} />
      <Route path="/controlpanal/hotels" component={CMSHotels} />
      <Route path="/controlpanal/media" component={CMSMedia} />
      <Route path="/controlpanal/seo" component={CMSSeo} />
      <Route path="/controlpanal/settings" component={CMSSettings} />
      
      {/* Dynamic hotel page routing with sections */}
      <Route path="/hotels/:hotelId" component={HotelDetails} />
      <Route path="/hotels/:hotelId/:section" component={HotelDetails} />
      <Route path="/:hotelId" component={HotelDetails} />
      <Route path="/:hotelId/:section" component={HotelDetails} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location]);
  return null;
}

function ChatbotWrapper() {
  const [location] = useLocation();
  const isAdminOrCMS = location.startsWith("/admin") || location.startsWith("/controlpanal");
  if (isAdminOrCMS) return null;
  return <BookingAssistant />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <I18nProvider>
          <CMSHead />
          <Toaster />
          <ScrollToTop />
          <Router />
          <ChatbotWrapper />
        </I18nProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
