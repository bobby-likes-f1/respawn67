import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Plus, Menu, UserRound, LogOut, LogIn, UserPlus, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clearSession, getInitials, getStoredUser, type AuthUser } from "@/lib/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isLandingPage = location.pathname === "/";
  const [sessionUser, setSessionUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setSessionUser(getStoredUser());
  }, [location.pathname]);

  function handleLogout() {
    clearSession();
    setSessionUser(null);
    navigate("/");
  }

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
              {sessionUser ? (
                <>
                  <Button
                    size="sm"
                    className="hidden sm:flex gap-2 font-bold bg-gradient-to-r from-azure-600 to-azure-500 hover:from-azure-500 hover:to-azure-400 border border-azure-400/50 shadow-[0_0_15px_rgba(26,133,255,0.4)] text-white"
                  >
                    <Plus className="h-4 w-4" />
                    LOG GAME
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="hidden sm:inline-flex items-center gap-2 px-2">
                        <div className="h-8 w-8 rounded-full bg-abyss-900 text-azure-100 flex items-center justify-center border border-abyss-700 text-xs font-bold">
                          {getInitials(sessionUser.username)}
                        </div>
                        <span className="max-w-28 truncate text-sm">{sessionUser.username}</span>
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel className="space-y-0.5">
                        <p className="text-sm font-semibold">{sessionUser.username}</p>
                        <p className="text-xs text-muted-foreground font-normal truncate">{sessionUser.email}</p>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onSelect={() => navigate("/account")}>
                        <UserRound className="h-4 w-4" />
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => navigate("/backlog")}>
                        <Plus className="h-4 w-4" />
                        Backlog
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive" onSelect={handleLogout}>
                        <LogOut className="h-4 w-4" />
                        Log Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="hidden sm:inline-flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center border">
                          <UserRound className="h-4 w-4" />
                        </div>
                        <span>Account</span>
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onSelect={() => navigate("/login")}>
                        <LogIn className="h-4 w-4" />
                        Log In
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => navigate("/signup")}>
                        <UserPlus className="h-4 w-4" />
                        Create Account
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
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
