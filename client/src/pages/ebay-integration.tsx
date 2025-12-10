import { useAuth } from "@/lib/auth";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import EbayIntegrationDashboard from "@/components/ebay-integration-dashboard";
import { ShoppingCart } from "lucide-react";

export default function EbayIntegrationPage() {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    window.location.href = "/login";
    return <div>Redirecting...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <ShoppingCart className="w-8 h-8 mr-3 text-blue-600" />
                eBay Integration
              </h1>
              <p className="text-gray-600 mt-1">
                Connect your eBay marketplace account and manage your international listings
              </p>
            </div>
          </div>

          {/* Integration Dashboard */}
          <EbayIntegrationDashboard />
        </main>
      </div>
    </div>
  );
} 