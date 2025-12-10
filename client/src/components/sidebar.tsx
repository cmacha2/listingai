import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Plus, 
  Package, 
  Settings, 
  BarChart3, 
  DollarSign,
  ChevronDown,
  ChevronRight,
  Palette,
  Brush,
  ShoppingCart
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const { user } = useAuth();
  const [location] = useLocation();
  const [expandedSections, setExpandedSections] = useState<string[]>(() => {
    const defaultExpanded = ['main'];
    if (user?.selectedMarketplace) {
      defaultExpanded.push('ebay');
    }
    return defaultExpanded;
  });

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: LayoutDashboard,
      section: 'main'
    },
    { 
      name: 'Create Listing', 
      href: '/create', 
      icon: Plus,
      section: 'main'
    },
    { 
      name: 'My Listings', 
      href: '/listings', 
      icon: Package,
      section: 'main'
    },
    { 
      name: 'eBay Integration', 
      href: '/ebay-integration', 
      icon: ShoppingCart,
      section: 'ebay'
    },
    { 
      name: 'Analytics', 
      href: '/analytics', 
      icon: BarChart3,
      section: 'tools'
    },
    { 
      name: 'Pricing Tools', 
      href: '/pricing', 
      icon: DollarSign,
      section: 'tools'
    },
    { 
      name: 'Customization & Branding', 
      href: '/customization', 
      icon: Brush,
      section: 'customization'
    },
    { 
      name: 'Settings', 
      href: '/settings', 
      icon: Settings,
      section: 'account'
    },
  ];

  const sections = {
    main: 'Core Features',
    ebay: 'eBay Tools',
    tools: 'Tools & Analytics', 
    customization: 'Design & Branding',
    account: 'Account'
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return location === '/' || location === '/dashboard';
    }
    return location === href;
  };

  const NavSection = ({ title, items }: { title: string; items: typeof navigation }) => (
    <div className="mb-6">
      <button
        onClick={() => toggleSection(title)}
        className="flex items-center w-full text-left text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 hover:text-gray-300 transition-colors"
      >
        {expandedSections.includes(title) ? (
          <ChevronDown className="w-3 h-3 mr-2" />
        ) : (
          <ChevronRight className="w-3 h-3 mr-2" />
        )}
        {title}
      </button>
      
      {expandedSections.includes(title) && (
        <nav className="space-y-1">
          {items.map((item) => (
            <Link key={item.name} href={item.href}>
              <a
                className={cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive(item.href)
                    ? "bg-blue-100 text-blue-600 border-r-2 border-blue-600"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <item.icon
                  className={cn(
                    "mr-3 flex-shrink-0 h-5 w-5 transition-colors",
                    isActive(item.href)
                      ? "text-blue-600"
                      : "text-gray-400 group-hover:text-gray-500"
                  )}
                />
                {item.name}
              </a>
            </Link>
          ))}
        </nav>
      )}
    </div>
  );

  if (!user) return null;

  return (
    <div className={cn("w-64 bg-white border-r border-gray-200 flex flex-col", className)}>
      <div className="flex-1 flex flex-col pt-8 pb-4 overflow-y-auto">
        <div className="flex-1 px-4 space-y-1">
          {/* User Info */}
          <div className="mb-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Navigation Sections */}
          {Object.entries(sections).map(([sectionKey, sectionTitle]) => {
            const sectionItems = navigation.filter(item => item.section === sectionKey);
            if (sectionItems.length === 0) return null;
            
            return (
              <NavSection 
                key={sectionKey} 
                title={sectionKey} 
                items={sectionItems} 
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
