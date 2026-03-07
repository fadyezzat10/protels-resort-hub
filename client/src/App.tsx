import { Switch, Route, useLocation } from "wouter";
import { useEffect, Component, type ReactNode, type ErrorInfo, lazy, Suspense } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/lib/i18n";
import { EditModeProvider } from "@/lib/editMode";
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
import CMSHead from "@/components/CMSHead";
import ThemeProvider from "@/components/ThemeProvider";

const Gallery = lazy(() => import("@/pages/Gallery"));
const Contact = lazy(() => import("@/pages/Contact"));
const Careers = lazy(() => import("@/pages/Careers"));
const About = lazy(() => import("@/pages/About"));
const Blog = lazy(() => import("@/pages/Blog"));
const BlogArticle = lazy(() => import("@/pages/BlogArticle"));
const CompanyProfile = lazy(() => import("@/pages/CompanyProfile"));
const BuilderPage = lazy(() => import("@/pages/BuilderPage"));

const Dashboard = lazy(() => import("@/pages/admin/Dashboard"));
const UsersPage = lazy(() => import("@/pages/admin/Users"));
const NewsletterPage = lazy(() => import("@/pages/admin/Newsletter"));
const Login = lazy(() => import("@/pages/admin/Login"));

const CMSLogin = lazy(() => import("@/pages/cms/CMSLogin"));
const CMSDashboard = lazy(() => import("@/pages/cms/CMSDashboard"));
const CMSPages = lazy(() => import("@/pages/cms/CMSPages"));
const CMSHotels = lazy(() => import("@/pages/cms/CMSHotels"));
const CMSMedia = lazy(() => import("@/pages/cms/CMSMedia"));
const CMSSeo = lazy(() => import("@/pages/cms/CMSSeo"));
const CMSSettings = lazy(() => import("@/pages/cms/CMSSettings"));
const CMSBlog = lazy(() => import("@/pages/cms/CMSBlog"));
const CMSCompanyProfile = lazy(() => import("@/pages/cms/CMSCompanyProfile"));
const CMSBuilder = lazy(() => import("@/pages/cms/CMSBuilder"));
const VisualEditor = lazy(() => import("@/pages/cms/VisualEditor"));
const CMSTheme = lazy(() => import("./pages/cms/CMSTheme"));
const CMSUsers = lazy(() => import("./pages/cms/CMSUsers"));
const CMSAIAssistant = lazy(() => import("./pages/cms/CMSAIAssistant"));
const CMSChatbot = lazy(() => import("./pages/cms/CMSChatbot"));
const CMSImageOptimization = lazy(() => import("./pages/cms/CMSImageOptimization"));

const AdminToolbar = lazy(() => import("@/components/AdminToolbar"));
const FloatingEditToolbar = lazy(() => import("@/components/FloatingEditToolbar"));
const BookingAssistant = lazy(() => import("@/components/BookingAssistant"));
const CMSAssistant = lazy(() => import("@/components/CMSAssistant"));

function LazyFallback() {
  return (
    <div style={{ minHeight: "50vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "32px", height: "32px", border: "3px solid #e5e7eb", borderTop: "3px solid #c9a96e", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<LazyFallback />}>
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

        <Route path="/admin" component={Login} />
        <Route path="/admin/dashboard" component={Dashboard} />
        <Route path="/admin/users" component={UsersPage} />
        <Route path="/admin/newsletter" component={NewsletterPage} />

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
        <Route path="/controlpanal/chatbot" component={CMSChatbot} />
        <Route path="/controlpanal/image-optimization" component={CMSImageOptimization} />
        <Route path="/controlpanal/ai-assistant" component={CMSAIAssistant} />
        
        <Route path="/hotels/:hotelId" component={HotelDetails} />
        <Route path="/hotels/:hotelId/:section" component={HotelDetails} />
        <Route path="/:hotelId" component={HotelDetails} />
        <Route path="/:hotelId/:section" component={HotelDetails} />
        
        <Route component={NotFound} />
      </Switch>
    </Suspense>
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
  return (
    <Suspense fallback={null}>
      <BookingAssistant />
    </Suspense>
  );
}

function CMSAssistantWrapper() {
  const [location] = useLocation();
  const isCMS = location.startsWith("/controlpanal") && location !== "/controlpanal" && !location.includes("/ai-assistant");
  if (!isCMS) return null;
  return (
    <Suspense fallback={null}>
      <CMSAssistant mode="floating" />
    </Suspense>
  );
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
              <Suspense fallback={null}>
                <AdminToolbar />
                <FloatingEditToolbar />
              </Suspense>
              <ChatbotWrapper />
              <CMSAssistantWrapper />
              </ThemeProvider>
            </EditModeProvider>
          </I18nProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </GlobalErrorBoundary>
  );
}

export default App;
