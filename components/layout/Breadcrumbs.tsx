"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Breadcrumbs() {
  const pathname = usePathname();
  // Very basic breadcrumb derivation for phase 1
  const paths = pathname.split('/').filter(Boolean);
  
  if (paths.length === 0) return null;

  return (
    <nav className="flex items-center text-[13px] text-[var(--tf-text-muted)] font-medium">
      <Link href="/dashboard" className="hover:text-[var(--tf-primary)] transition-colors">
        Dashboard
      </Link>
      
      {paths.map((path, index) => {
        // Skip dashboard if it's the only one
        if (path === 'dashboard' && index === 0) return null;
        
        const href = `/${paths.slice(0, index + 1).join('/')}`;
        const isLast = index === paths.length - 1;
        const formattedPath = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');

        return (
          <div key={path} className="flex items-center">
            <ChevronRight className="mx-1 h-4 w-4" />
            {isLast ? (
              <span className="text-[var(--tf-text-primary)]">{formattedPath}</span>
            ) : (
              <Link href={href} className="hover:text-[var(--tf-primary)] transition-colors">
                {formattedPath}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
