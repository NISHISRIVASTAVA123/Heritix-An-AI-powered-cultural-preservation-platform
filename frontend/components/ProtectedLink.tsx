"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { ComponentProps } from "react";

type ProtectedLinkProps = ComponentProps<typeof Link>;

export default function ProtectedLink({
  href,
  children,
  ...props
}: ProtectedLinkProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const target = typeof href === "string" ? href : href.toString();
  const authHref =
    isLoaded && !isSignedIn
      ? `/sign-in?redirect_url=${encodeURIComponent(target)}`
      : href;

  return (
    <Link href={authHref} {...props}>
      {children}
    </Link>
  );
}
