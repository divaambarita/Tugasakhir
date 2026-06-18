import { useEffect, useState } from "react";

/**
 * NoSSR component to prevent server-side rendering of child components
 * This helps avoid hydration mismatches for dynamic content
 */
const NoSSR = ({ children, fallback = null }) => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return fallback;
  }

  return children;
};

export default NoSSR;
