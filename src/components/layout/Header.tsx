import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ShoppingCart, Menu, X, User, LogOut, Disc3, Shield, Library } from "lucide-react";
import logo from "@/assets/logo.png";
import { BRAND } from "@/lib/constants";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/discover", label: "neoVIBES" },
  { to: "/videos", label: "Videos" },
  { to: "/shorts", label: "Shorts" },
  { to: "/albums", label: "Releases" },
  { to: "/playlists", label: "Playlists" },
  { to: "/posts", label: "Posts" },
  { to: "/catalog", label: "Music Store" },
  { to: "/merch", label: "Merch Store" },
];

export function Header() {
  const cart = useCart();
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 glass">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logo} alt="neoSHADE logo" width={36} height={36} className="h-9 w-9" />
            <span className="font-display text-lg font-bold tracking-wider text-gradient">
              {BRAND.name}
            </span>
          </Link>
          <a
            href={BRAND.site}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center rounded-md border border-neon-cyan/40 bg-card/50 px-3 py-1.5 text-xs font-semibold tracking-wide text-neon-cyan shadow-[var(--shadow-neon)] transition-transform hover:scale-105 lg:inline-flex"
          >
            ← neo-shade.com
          </a>
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/" }}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-primary" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Cart"
          >
            <ShoppingCart className="h-5 w-5" />
            {cart.count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
                {cart.count}
              </span>
            )}
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-primary">
                <User className="h-5 w-5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => navigate({ to: "/library" })}>
                  <Library className="mr-2 h-4 w-4" /> Library
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem onClick={() => navigate({ to: "/admin" })}>
                    <Shield className="mr-2 h-4 w-4" /> Admin
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={async () => {
                    await signOut();
                    navigate({ to: "/" });
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              to="/auth"
              className="hidden rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-neon)] transition-transform hover:scale-105 sm:inline-flex"
            >
              Sign in
            </Link>
          )}

          <button
            className="flex h-10 w-10 items-center justify-center rounded-md text-foreground md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-border/60 bg-card/90 px-4 py-3 md:hidden">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground"
              activeProps={{ className: "text-primary" }}
            >
              <Disc3 className="h-4 w-4" /> {n.label}
            </Link>
          ))}
          <a
            href={BRAND.site}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="mt-2 flex items-center justify-center gap-2 rounded-md border border-neon-cyan/40 bg-card/50 px-4 py-2.5 text-sm font-semibold tracking-wide text-neon-cyan shadow-[var(--shadow-neon)]"
          >
            ← neo-shade.com
          </a>
          {!user && (
            <Link
              to="/auth"
              onClick={() => setOpen(false)}
              className="mt-2 flex justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Sign in
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
