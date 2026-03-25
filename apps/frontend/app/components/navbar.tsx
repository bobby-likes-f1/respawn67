import { useState } from "react";
import { Link, useLocation } from "react-router";
import { Plus, User, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

export function Navbar() {
  const location = useLocation();
  const isLandingPage = location.pathname === "/";
  const [searchBarLight, setSearchBarLight] = useState(false);

  const navLinks = isLandingPage
    ? [
        { title: "Features", href: "/#features" },
        { title: "Reviews", href: "/#reviews" },
        { title: "Games", href: "/games" },
        { title: "About", href: "/about" },
      ]
    : [
        { title: "Games", href: "/games" },
        { title: "Backlog", href: "/backlog" },
        { title: "Lists", href: "/lists" },
        { title: "Community", href: "/community" },
      ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <img src="/logo.png" alt="Respawn67" className="h-8 w-8" />
            <span className="text-xl font-pixel tracking-tighter">
              RESPAWN67
            </span>
          </Link>

          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              {navLinks.map((link) => (
                <NavigationMenuItem key={link.href}>
                  <NavigationMenuLink
                    asChild
                    className={navigationMenuTriggerStyle()}
                  >
                    <Link to={link.href}>{link.title}</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="flex items-center gap-4">
          {isLandingPage ? (
            <>
              <Button variant="ghost" asChild className="hidden sm:inline-flex">
                <Link to="/login">Log In</Link>
              </Button>
              <Button
                asChild
                className="bg-gradient-to-r from-azure-600 to-azure-500 hover:from-azure-500 hover:to-azure-400 border border-azure-400/50 shadow-[0_0_15px_rgba(26,133,255,0.4)] text-white"
              >
                <Link to="/signup">Create Account</Link>
              </Button>
            </>
          ) : (
            <>
              <Button
                size="sm"
                className="hidden sm:flex gap-2 font-bold bg-gradient-to-r from-azure-600 to-azure-500 hover:from-azure-500 hover:to-azure-400 border border-azure-400/50 shadow-[0_0_15px_rgba(26,133,255,0.4)] text-white"
              >
                <Plus className="h-4 w-4" />
                LOG GAME
              </Button>

              <div 
                className={`hidden sm:flex items-center px-3 py-1.5 rounded-full border cursor-pointer transition-all ${
                  searchBarLight 
                    ? 'bg-white border-border/50 hover:border-gray-300' 
                    : 'bg-slate-800 border-border/50 hover:border-azure-400/50'
                }`}
              >
                <Search className={`h-4 w-4 mr-2 ${searchBarLight ? 'text-gray-400' : 'text-muted-foreground'}`} />
                <Input
                  type="text"
                  placeholder="Search games..."
                  onFocus={() => setSearchBarLight(true)}
                  onBlur={() => setSearchBarLight(false)}
                  className={`border-0 bg-transparent text-sm focus-visible:outline-none focus-visible:ring-0 ${
                    searchBarLight 
                      ? 'text-black placeholder:text-gray-400' 
                      : 'text-foreground placeholder:text-muted-foreground'
                  }`}
                />
              </div>

              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuLink
                      asChild
                      className={navigationMenuTriggerStyle()}
                    >
                      <Link
                        to="/account"
                        className="flex items-center gap-2 leading-none"
                      >
                        <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center border">
                          <User className="h-3 w-3" />
                        </div>
                        <span className="hidden sm:inline">Username</span>
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </>
          )}

          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
