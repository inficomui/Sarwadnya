"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, ChevronDown, Phone, LogOut, Loader2, LayoutDashboard, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname, useRouter } from 'next/navigation';
import { ModeToggle } from '@/components/ui/ModeToggle';
import { useSelector, useDispatch } from 'react-redux';
import { useAuth } from '@/hooks/useAuth';
import { useAdminLogoutMutation } from "@/redux/apies/adminApi";
import { RootState } from '@/redux/store';
import LOGO from '@/public/sarwadnya-nav-logo.png';
import { logoutAdmin } from '@/redux/slices/adminSlice';

const Navbar = () => {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  // Treat all pages except root '/' as needing the solid/scrolled navbar style by default
  const isInnerPage = pathname !== '/';
  const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/forgot-password';

  const { user } = useSelector((state: RootState) => state.auth);
  const { adminUser } = useSelector((state: RootState) => state.adminAuth);

  const { logout, isLoggingOut } = useAuth();
  const [adminLogout, { isLoading: isAdminLoggingOut }] = useAdminLogoutMutation();
  const router = useRouter();

  const handleAdminLogout = async () => {
    try {
      await adminLogout().unwrap();
      dispatch(logoutAdmin());
      router.replace("/admin/login");
    } catch (error) {
      console.error("Logout error:", error);
      dispatch(logoutAdmin()); // Dispatch action to clear Redux and LocalStorage
      router.replace("/admin/login");
    }
  };

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  interface NavLink {
    name: string;
    href: string;
    hasDropdown?: boolean;
    dropdownLinks?: { name: string; href: string }[];
  }

  const navLinks: NavLink[] = [
    { name: 'HOME', href: '/' },
    { name: 'ABOUT US', href: pathname === '/' ? '#about' : '/#about', hasDropdown: false },
    {
      name: 'SERVICES', href: pathname === '/' ? '#services' : '/#services', hasDropdown: false, dropdownLinks: [
        { href: "/service-1", name: "Service 1" }
      ]
    },
    { name: 'BLOGS', href: '/blogs' },
    { name: 'NEWS', href: pathname === '/' ? '#news' : '/#news' },
  ];

  const handleLinkClick = (href: string) => {
    setIsOpen(false);
    if (href === '/') {
      handleScrollToTop();
    }
  };

  return (
    <nav className={cn(
      "fixed w-full z-50 transition-all duration-300",
      scrolled || isInnerPage ? "bg-background/80 backdrop-blur-md shadow-sm border-b border-border py-2" : "bg-transparent py-4"
    )}>
      <div className="container mx-auto px-4 md:px-10 flex justify-between items-center">
        <Link
          href="/"
          className="flex items-center gap-2 group"
          onClick={handleScrollToTop}
        >
          <div className={cn(
            "relative transition-all duration-300 overflow-hidden",
            scrolled || isInnerPage
              ? "w-28 h-12 md:w-36 md:h-16 bg-white/95 backdrop-blur-sm rounded-lg shadow-sm"
              : "w-36 h-14 md:w-44 md:h-20 bg-white backdrop-blur-md rounded-xl shadow-md"
          )}>
            <Image
              src={LOGO}
              alt="Shree Sarwadnya All in one Solutions"
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-4 lg:space-x-8">
          {navLinks.map((link) => (
            <div key={link.name} className="relative group/menu">
              <Link
                href={link.href}
                onClick={() => link.href === '/' ? handleScrollToTop() : null}
                className={cn(
                  "text-sm font-medium flex items-center gap-1 transition-colors hover:text-primary",
                  scrolled || isInnerPage ? "dark:text-foreground text-black" : "text-white"
                )}
              >
                {link.name}
                {link.hasDropdown && <ChevronDown size={14} />}
              </Link>
              {/* Dropdown Content */}
              {link.hasDropdown && link.dropdownLinks && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-popover shadow-lg rounded-md border border-border opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all duration-200 transform translate-y-2 group-hover/menu:translate-y-0 text-popover-foreground py-2">
                  {link.dropdownLinks.map((subLink, subIndex) => (
                    <Link
                      key={subIndex}
                      href={subLink.href}
                      className="block px-4 py-2 hover:bg-muted text-sm transition-colors"
                    >
                      {subLink.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div className="flex items-center gap-4">
            <ModeToggle />
            {mounted && adminUser ? (
              <div className="relative group/user-menu">
                <button className={cn(
                  "flex items-center gap-2 font-bold text-sm transition-colors py-2",
                  scrolled || isInnerPage ? "text-foreground" : "text-white"
                )}>
                  <div className="text-right hidden lg:block">
                    <span className="block text-xs text-primary">ADMINISTRATOR</span>
                    <span className="block text-xs opacity-80 max-w-[100px] truncate">{adminUser.email}</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 text-primary">
                    <User size={16} />
                  </div>
                  <ChevronDown size={14} className="opacity-70 group-hover/user-menu:rotate-180 transition-transform" />
                </button>

                {/* Admin Dropdown */}
                <div className="absolute top-full right-0 mt-2 w-64 bg-popover shadow-xl rounded-xl border border-border p-2 opacity-0 invisible group-hover/user-menu:opacity-100 group-hover/user-menu:visible transition-all duration-200 transform translate-y-2 group-hover/user-menu:translate-y-0 z-50">
                  <div className="px-3 py-3 border-b border-border mb-2 bg-muted/30 rounded-t-lg -mx-2 -mt-2">
                    <p className="font-bold text-sm truncate text-popover-foreground">{adminUser.name || "Administrator"}</p>
                    <p className="text-xs text-muted-foreground truncate">{adminUser.email}</p>
                  </div>

                  <Link
                    href="/admin/dashboard"
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-muted text-sm text-popover-foreground transition-colors mb-1 font-medium"
                  >
                    <LayoutDashboard size={16} className="text-primary" />
                    Admin Panel
                  </Link>

                  <div className="h-px bg-border my-1"></div>

                  <button
                    onClick={() => handleAdminLogout()}
                    disabled={isAdminLoggingOut}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-red-500/10 text-red-500 text-sm transition-colors font-medium"
                  >
                    {isAdminLoggingOut ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
                    {isAdminLoggingOut ? "Signing out..." : "Logout"}
                  </button>
                </div>
              </div>
            ) : mounted && user ? (
              <div className="relative group/user-menu">
                <button className={cn(
                  "flex items-center gap-2 font-bold text-sm transition-colors py-2",
                  scrolled || isInnerPage ? "text-foreground" : "text-white"
                )}>
                  <div className="text-right hidden lg:block">
                    <span className="block text-xs font-bold">{user.name || "INVESTOR"}</span>
                    <span className="block text-xs opacity-80 max-w-[100px] truncate">{user.email}</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-linear-to-tr from-primary to-amber-300 flex items-center justify-center text-black font-bold border border-white/20 shadow-lg">
                    {user.name ? user.name.charAt(0).toUpperCase() : <User size={16} />}
                  </div>
                  <ChevronDown size={14} className="opacity-70 group-hover/user-menu:rotate-180 transition-transform" />
                </button>

                {/* User Dropdown */}
                <div className="absolute top-full right-0 mt-2 w-64 bg-popover shadow-xl rounded-xl border border-border p-2 opacity-0 invisible group-hover/user-menu:opacity-100 group-hover/user-menu:visible transition-all duration-200 transform translate-y-2 group-hover/user-menu:translate-y-0 z-50">
                  <div className="px-3 py-3 border-b border-border mb-2 bg-muted/30 rounded-t-lg -mx-2 -mt-2">
                    <p className="font-bold text-sm truncate text-popover-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>

                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-muted text-sm text-popover-foreground transition-colors mb-1 font-medium"
                  >
                    <LayoutDashboard size={16} className="text-primary" />
                    My Dashboard
                  </Link>

                  <div className="h-px bg-border my-1"></div>

                  <button
                    onClick={() => logout()}
                    disabled={isLoggingOut}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-red-500/10 text-red-500 text-sm transition-colors font-medium"
                  >
                    {isLoggingOut ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
                    {isLoggingOut ? "Signing out..." : "Logout"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className={cn(
                    "px-5 py-2 rounded-full font-bold text-sm tracking-wide transition-all duration-300 border",
                    scrolled || isInnerPage
                      ? "border-foreground text-foreground hover:bg-foreground hover:text-background"
                      : "border-white text-white hover:bg-white hover:text-black"
                  )}
                >
                  LOGIN
                </Link>
                <Link
                  href="/signup"
                  className="px-5 py-2 rounded-full font-bold text-sm tracking-wide transition-all duration-300 border bg-primary text-primary-foreground border-primary hover:brightness-110"
                >
                  REGISTER
                </Link>
              </div>
            )}
            <Link
              href="/contact"
              className="bg-primary text-primary-foreground px-6 py-2 rounded-full font-bold text-sm tracking-wide hover:brightness-110 transition-all shadow-lg border border-transparent"
            >
              CONTACT
            </Link>
          </div>
        </div>

        {/* Mobile Toggle & User Icon */}
        <div className="md:hidden flex items-center gap-4">
          {/* Mobile User Icon (Quick Access) */}
          {!user && !adminUser && (
            <Link href="/login" className={cn("p-2", isOpen || scrolled || isInnerPage ? "text-foreground" : "text-white")}>
              <User size={24} />
            </Link>
          )}

          <button
            onClick={() => setIsOpen(!isOpen)}
            className={cn("p-2", isOpen || scrolled || isInnerPage ? "text-foreground" : "text-white")}
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div >

      {/* Mobile Menu Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-sm z-90 md:hidden transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsOpen(false)}
      />

      {/* Mobile Menu Sidebar */}
      <div className={cn(
        "fixed top-0 right-0 h-dvh w-[85%] max-w-[400px] bg-background border-l border-border z-100 md:hidden transition-transform duration-300 ease-in-out shadow-2xl flex flex-col p-6",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="flex justify-between items-center mb-8">
          <Link href="/" onClick={() => setIsOpen(false)} className="relative block bg-white/95 rounded-xl shadow-sm p-1">
            <div className="relative w-28 h-12">
              <Image
                src={LOGO}
                alt="Shree Sarwadnya All in one Solutions"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 text-foreground hover:bg-muted rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-col space-y-4 overflow-y-auto flex-1 pr-2">
          {navLinks.map((link) => (
            <div key={link.name} className="flex flex-col">
              <Link
                href={link.href}
                className="text-base font-semibold text-foreground border-b border-border/50 pb-3 flex justify-between items-center hover:text-primary transition-colors"
                onClick={() => !link.hasDropdown && handleLinkClick(link.href)}
              >
                {link.name}
                {link.hasDropdown && <ChevronDown size={16} />}
              </Link>
              {link.hasDropdown && link.dropdownLinks && (
                <div className="pl-4 border-l-2 border-border mt-2 space-y-2 mb-2">
                  {link.dropdownLinks.map((subLink, index) => (
                    <Link
                      key={index}
                      href={subLink.href}
                      className="block text-sm text-muted-foreground hover:text-primary transition-colors py-1.5"
                      onClick={() => handleLinkClick(subLink.href)}
                    >
                      {subLink.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Auth Section - Moved below links */}
          <div className="mb-6 space-y-4">
            {adminUser ? (
              <div className="bg-muted/30 p-4 rounded-xl border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 text-primary">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-foreground">Admin</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[150px]">{adminUser.email}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Link
                    href="/admin/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="w-full text-left text-sm font-semibold text-primary flex items-center gap-2 p-2 hover:bg-muted rounded-lg transition-colors"
                  >
                    <LayoutDashboard size={16} />
                    Admin Panel
                  </Link>
                  <button
                    onClick={() => { handleAdminLogout(); setIsOpen(false); }}
                    disabled={isAdminLoggingOut}
                    className={cn(
                      "w-full text-left text-sm font-semibold text-red-500 flex items-center gap-2 p-2 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors",
                      isAdminLoggingOut && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {isAdminLoggingOut ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
                    {isAdminLoggingOut ? "EXITING..." : "Logout"}
                  </button>
                </div>
              </div>
            ) : user ? (
              <div className="bg-muted/30 p-4 rounded-xl border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-linear-to-tr from-primary to-amber-300 flex items-center justify-center text-black font-bold border border-white/20 shadow-lg">
                    {user.name ? user.name.charAt(0).toUpperCase() : <User size={20} />}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[150px]">{user.email}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Link
                    href="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="w-full text-left text-sm font-semibold text-primary flex items-center gap-2 p-2 hover:bg-muted rounded-lg transition-colors"
                  >
                    <LayoutDashboard size={16} />
                    My Dashboard
                  </Link>
                  <button
                    onClick={() => { logout(); setIsOpen(false); }}
                    disabled={isLoggingOut}
                    className={cn(
                      "w-full text-left text-sm font-semibold text-red-500 flex items-center gap-2 p-2 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors",
                      isLoggingOut && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {isLoggingOut ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
                    {isLoggingOut ? "EXITING..." : "Logout"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/login"
                  className="flex items-center justify-center w-full py-3 rounded-xl font-bold text-sm tracking-wide border border-foreground text-foreground hover:bg-foreground hover:text-background transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  LOGIN
                </Link>
                <Link
                  href="/signup"
                  className="flex items-center justify-center w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold text-sm tracking-wide shadow-lg hover:brightness-110 transition-all"
                  onClick={() => setIsOpen(false)}
                >
                  REGISTER
                </Link>
              </div>
            )}
          </div>
          <div className="mt-auto pt-6 space-y-4">
            <Link
              href="/contact"
              className="flex items-center justify-center w-full bg-muted text-foreground border border-border py-3 rounded-xl font-bold text-sm tracking-wide hover:bg-muted/80 transition-all"
              onClick={() => setIsOpen(false)}
            >
              CONTACT US
            </Link>
            <div className="flex justify-center pt-2">
              <ModeToggle />
            </div>
          </div>
        </div>
      </div>
    </nav >
  );
};

// Simple Icon component for Logo
function BriefcaseIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M16 20h4a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-2" />
      <path d="M4 20h16" />
      <path d="M4 20H2a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2" />
      <path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M8 8h8" />
      <line x1="12" y1="12" x2="12" y2="12.01" />
      <path d="M12 16v-4" />
      <path d="M9 16l3 3 3-3" /> {/* Making it look like a chart/graph growing */}
    </svg>
  )
}

export default Navbar;