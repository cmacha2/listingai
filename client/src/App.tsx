import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route, Switch } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import LoginPage from "@/pages/login";
import SignupPage from "@/pages/signup";
import DashboardPage from "@/pages/dashboard";
import CreatePage from "@/pages/create";
import ListingsPage from "@/pages/listings";
import EditorPage from "@/pages/editor";
import SettingsPage from "@/pages/settings";
import CustomizationPage from "@/pages/customization";
import EbayIntegrationPage from "@/pages/ebay-integration";
import ListingDetailsPage from "@/pages/listing-details";
import LandingPage from "@/pages/landing";
import BlogPostPage from "@/pages/blog-post";
import BlogPage from "@/pages/blog";
import SimpleGeneratorPage from "@/pages/simple-generator";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/signup" component={SignupPage} />
        <Route path="/dashboard" component={DashboardPage} />
        <Route path="/create" component={CreatePage} />
        <Route path="/settings" component={SettingsPage} />
        <Route path="/customization" component={CustomizationPage} />
        <Route path="/ebay-integration" component={EbayIntegrationPage} />
        <Route path="/listings" component={ListingsPage} />
        <Route path="/listing/:id" component={ListingDetailsPage} />
        <Route path="/editor/:listingId" component={EditorPage} />
        <Route path="/blog" component={BlogPage} />
        <Route path="/blog/:slug" component={BlogPostPage} />
        <Route path="/simple-generator" component={SimpleGeneratorPage} />
        <Route>
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
              <p className="text-gray-600">Page not found</p>
            </div>
          </div>
        </Route>
      </Switch>
      <Toaster />
      <SonnerToaster />
    </QueryClientProvider>
  );
}

export default App;
