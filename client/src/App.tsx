import { Switch, Route, useLocation } from "wouter";
import { useEffect, Component, type ReactNode, type ErrorInfo } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/lib/i18n";
import { EditModeProvider } from "@/lib/editMode";
import AdminToolbar from "@/components/AdminToolbar";
import BookingAssistant from "@/components/BookingAssistant";
import NotFound from "@/pages/not-found";

class GlobalErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[GlobalErrorBoundary] Caught error:", error.message, error.stack);
    console.error("[GlobalErrorBoundary] Component stack:", errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #0c1c2c 0%, #1a2d42 100%)", fontFamily: "'Montserrat', sans-serif" }}>
          <div style={{ background: "white", borderRadius: "12px", padding: "48px", maxWidth: "500px", textAlign: "center", boxShadow: "0 25px 50px rgba(0,0,0,0.3)" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <span style={{ fontSize: "28px" }}>!</span>
            </div>
            <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#1a2d42", marginBottom: "12px", fontFamily: "'Cormorant Garamond', serif" }}>
              Something went wrong
            </h1>
            <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "8px", lineHeight: 1.6 }}>
              حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.
            </p>
            <p style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "24px", fontFamily: "monospace", background: "#f9fafb", padding: "8px 12px", borderRadius: "6px", wordBreak: "break-all" }}>
              {this.state.error?.message || "Unknown error"}
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                style={{ padding: "10px 24px", background: "#c9a96e", color: "white", border: "none", borderRadius: "6px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}
              >
                إعادة تحميل الصفحة
              </button>
              <button
                onClick={() => { window.location.href = "/"; }}
                style={{ padding: "10px 24px", background: "#e5e7eb", color: "#374151", border: "none", borderRadius: "6px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}
              >
                الصفحة الرئيسية
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
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
import CMSBlog from "@/pages/cms/CMSBlog";
import CMSCompanyProfile from "@/pages/cms/CMSCompanyProfile";
import CMSBuilder from "@/pages/cms/CMSBuilder";
import VisualEditor from "@/pages/cms/VisualEditor";
import CompanyProfile from "@/pages/CompanyProfile";
import BuilderPage from "@/pages/BuilderPage";
import Blog from "@/pages/Blog";
import BlogArticle from "@/pages/BlogArticle";
import CMSHead from "@/components/CMSHead";
import CMSTheme from "./pages/cms/CMSTheme";
import CMSUsers from "./pages/cms/CMSUsers";
import ThemeProvider from "@/components/ThemeProvider";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/hotels" component={Hotels} />
      <Route path="/gallery" component={Gallery} />
      <Route path="/contact" component={Contact} />
      <Route path="/careers" component={Careers} />
      <Route path="/about" component={About} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:slug" component={BlogArticle} />
      <Route path="/company-profile" component={CompanyProfile} />
      <Route path="/page/:slug" component={BuilderPage} />

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
      <Route path="/controlpanal/theme" component={CMSTheme} />
      <Route path="/controlpanal/blog" component={CMSBlog} />
      <Route path="/controlpanal/company-profile" component={CMSCompanyProfile} />
      <Route path="/controlpanal/builder/:slug" component={CMSBuilder} />
      <Route path="/controlpanal/users" component={CMSUsers} />
      <Route path="/controlpanal/visual-edit/:slug" component={VisualEditor} />
      
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
    <GlobalErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <I18nProvider>
            <EditModeProvider>
              <CMSHead />
              <ThemeProvider>
              <Toaster />
              <ScrollToTop />
              <Router />
              <AdminToolbar />
              <ChatbotWrapper />
              </ThemeProvider>
            </EditModeProvider>
          </I18nProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </GlobalErrorBoundary>
  );
}

export default App;
