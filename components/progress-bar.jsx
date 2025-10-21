"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import NProgress from "nprogress";


// Customize NProgress
NProgress.configure({ showSpinner: false, trickleSpeed: 200 });

export default function ProgressBar() {
  const pathname = usePathname();

  useEffect(() => {
    NProgress.start();
    NProgress.set(0.3);

    // Finish after a short delay to simulate loading
    const timer = setTimeout(() => NProgress.done(), 500);

    return () => {
      clearTimeout(timer);
      NProgress.done();
    };
  }, [pathname]);

  return null;
}
