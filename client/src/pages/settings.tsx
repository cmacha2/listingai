import { useAuth } from "@/lib/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Link as LinkIcon, Unlink, User, Mail, Shield } from "lucide-react";

export default function Settings() {
  const { user, isLoggedIn, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  if (!isLoggedIn || !user) {
    window.location.href = "/login";
    return null;
  }

  const disconnectEbayMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/ebay/disconnect");
      return response.json();
    },
    onSuccess: () => {
      if (user) {
        queryClient.setQueryData(["/api/auth/me"], {
          user: { ...user, isEbayConnected: false }
        });
      }
      toast({
        title: "Success!",
        description: "eBay account disconnected successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to disconnect eBay account",
        variant: "destructive",
      });
    },
  });

  const connectEbayMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/ebay/connect");
      return response.json();
    },
    onSuccess: () => {
      if (user) {
        queryClient.setQueryData(["/api/auth/me"], {
          user: { ...user, isEbayConnected: true }
        });
      }
      toast({
        title: "Success!",
        description: "eBay account connected successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to connect eBay account",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-8">
          <div className="max-w-4xl">
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
              <p className="text-gray-600">Manage your account and integrations</p>
            </div>

            <div className="space-y-6">
              {/* Account Information */}
              <Card className="card-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="mr-2 h-5 w-5" />
                    Account Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                      <div className="bg-gray-50 px-3 py-2 rounded-md text-gray-900">
                        {user.name}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <div className="bg-gray-50 px-3 py-2 rounded-md text-gray-900">
                        {user.email}
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Button variant="outline" className="mr-3">
                      Edit Profile
                    </Button>
                    <Button variant="outline">
                      Change Password
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* eBay Integration */}
              <Card className="card-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <LinkIcon className="mr-2 h-5 w-5" />
                    eBay Integration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">eBay Account</h3>
                      <p className="text-sm text-gray-600">
                        {user.isEbayConnected 
                          ? "Your eBay seller account is connected and ready to use."
                          : "Connect your eBay seller account to publish listings directly."
                        }
                      </p>
                    </div>
                    
                    {user.isEbayConnected ? (
                      <Button
                        variant="destructive"
                        onClick={() => disconnectEbayMutation.mutate()}
                        disabled={disconnectEbayMutation.isPending}
                      >
                        {disconnectEbayMutation.isPending ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Disconnecting...
                          </>
                        ) : (
                          <>
                            <Unlink className="mr-2 h-4 w-4" />
                            Disconnect
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => connectEbayMutation.mutate()}
                        disabled={connectEbayMutation.isPending}
                        className="bg-accent hover:bg-green-600"
                      >
                        {connectEbayMutation.isPending ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Connecting...
                          </>
                        ) : (
                          <>
                            <LinkIcon className="mr-2 h-4 w-4" />
                            Connect eBay
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  
                  {user.isEbayConnected && (
                    <>
                      <Separator className="my-4" />
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                            <LinkIcon className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-green-900">eBay Connected</h4>
                            <p className="text-sm text-green-700">
                              You can now publish listings directly to your eBay store.
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Subscription & Billing */}
              <Card className="card-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="mr-2 h-5 w-5" />
                    Subscription & Billing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">Current Plan</h3>
                        <p className="text-sm text-gray-600">Starter (Free)</p>
                      </div>
                      <Button variant="outline">
                        Upgrade Plan
                      </Button>
                    </div>
                    
                    <Separator />
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">5</div>
                        <div className="text-sm text-gray-600">Listings per month</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">0</div>
                        <div className="text-sm text-gray-600">Used this month</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">5</div>
                        <div className="text-sm text-gray-600">Remaining</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Card className="card-shadow border-red-200">
                <CardHeader>
                  <CardTitle className="text-red-700">Danger Zone</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">Sign Out</h3>
                        <p className="text-sm text-gray-600">Sign out of your account on this device.</p>
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={() => logout()}
                      >
                        Sign Out
                      </Button>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-red-700">Delete Account</h3>
                        <p className="text-sm text-gray-600">
                          Permanently delete your account and all data. This action cannot be undone.
                        </p>
                      </div>
                      <Button 
                        variant="destructive"
                        onClick={() => {
                          toast({
                            title: "Coming Soon",
                            description: "Account deletion will be available soon",
                          });
                        }}
                      >
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
