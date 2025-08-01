import {
  DialogAnimationConfig,
  DialogResponsiveConfig,
  DialogAccessibilityConfig,
} from "@/lib/types/dialog";

// Default animation configurations
export const DEFAULT_DIALOG_ANIMATIONS: Record<string, DialogAnimationConfig> =
  {
    gifEditor: {
      enter: {
        duration: 300,
        easing: "cubic-bezier(0.4, 0, 0.2, 1)",
        transform: "scale(0.95) translateY(10px)",
        opacity: 0,
      },
      exit: {
        duration: 200,
        easing: "cubic-bezier(0.4, 0, 0.2, 1)",
        transform: "scale(0.95) translateY(10px)",
        opacity: 0,
      },
    },
    sharing: {
      enter: {
        duration: 250,
        easing: "cubic-bezier(0.4, 0, 0.2, 1)",
        transform: "scale(0.9)",
        opacity: 0,
      },
      exit: {
        duration: 200,
        easing: "cubic-bezier(0.4, 0, 0.2, 1)",
        transform: "scale(0.9)",
        opacity: 0,
      },
    },
    sharedViewer: {
      enter: {
        duration: 300,
        easing: "cubic-bezier(0.4, 0, 0.2, 1)",
        transform: "scale(0.95) translateY(10px)",
        opacity: 0,
      },
      exit: {
        duration: 200,
        easing: "cubic-bezier(0.4, 0, 0.2, 1)",
        transform: "scale(0.95) translateY(10px)",
        opacity: 0,
      },
    },
  };

// Default responsive configurations
export const DEFAULT_DIALOG_RESPONSIVE: Record<string, DialogResponsiveConfig> =
  {
    gifEditor: {
      mobile: {
        fullScreen: true,
        slideDirection: "up",
        borderRadius: "0px",
      },
      desktop: {
        centered: true,
        maxWidth: "1200px",
        maxHeight: "90vh",
        borderRadius: "12px",
      },
    },
    sharing: {
      mobile: {
        fullScreen: true,
        slideDirection: "up",
        borderRadius: "0px",
      },
      desktop: {
        centered: true,
        maxWidth: "500px",
        maxHeight: "600px",
        borderRadius: "12px",
      },
    },
    sharedViewer: {
      mobile: {
        fullScreen: true,
        slideDirection: "up",
        borderRadius: "0px",
      },
      desktop: {
        centered: true,
        maxWidth: "900px",
        maxHeight: "80vh",
        borderRadius: "12px",
      },
    },
  };

// Default accessibility configurations
export const DEFAULT_DIALOG_ACCESSIBILITY: Record<
  string,
  DialogAccessibilityConfig
> = {
  gifEditor: {
    focusTrap: true,
    escapeToClose: true,
    ariaLabel: "GIF Editor Dialog",
    ariaDescribedBy: "gif-editor-description",
    role: "dialog",
  },
  sharing: {
    focusTrap: true,
    escapeToClose: true,
    ariaLabel: "Share GIF Dialog",
    ariaDescribedBy: "sharing-description",
    role: "dialog",
  },
  sharedViewer: {
    focusTrap: true,
    escapeToClose: true,
    ariaLabel: "Shared GIF Viewer Dialog",
    ariaDescribedBy: "shared-viewer-description",
    role: "dialog",
  },
};

// Animation utilities
export const createDialogAnimation = (
  config: DialogAnimationConfig,
  isEntering: boolean
) => {
  const animationConfig = isEntering ? config.enter : config.exit;

  return {
    initial: {
      opacity: animationConfig.opacity,
      transform: animationConfig.transform,
    },
    animate: {
      opacity: isEntering ? 1 : animationConfig.opacity,
      transform: isEntering
        ? "scale(1) translateY(0px)"
        : animationConfig.transform,
    },
    transition: {
      duration: animationConfig.duration / 1000, // Convert to seconds for Framer Motion
      ease: animationConfig.easing,
    },
  };
};

// Responsive utilities
export const getDialogStyles = (
  dialogType: string,
  isMobile: boolean
): React.CSSProperties => {
  const config = DEFAULT_DIALOG_RESPONSIVE[dialogType];
  if (!config) return {};

  if (isMobile) {
    return {
      position: "fixed",
      inset: "0",
      transform: "translateY(0)",
      borderRadius: config.mobile.borderRadius,
      maxHeight: "100vh",
      width: "100%",
      height: "100%",
    };
  }

  return {
    width: "90vw",
    maxWidth: config.desktop.maxWidth,
    maxHeight: config.desktop.maxHeight,
    borderRadius: config.desktop.borderRadius,
    position: "relative",
  };
};

// Accessibility utilities
export const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
  const focusableSelectors = [
    "button:not([disabled])",
    "input:not([disabled])",
    "textarea:not([disabled])",
    "select:not([disabled])",
    "a[href]",
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ].join(", ");

  return Array.from(
    container.querySelectorAll(focusableSelectors)
  ) as HTMLElement[];
};

export const trapFocus = (focusableElements: HTMLElement[]) => {
  if (focusableElements.length === 0) return;

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  // Focus the first element initially
  firstElement.focus();

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== "Tab") return;

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };

  document.addEventListener("keydown", handleTabKey);

  // Return cleanup function
  return () => {
    document.removeEventListener("keydown", handleTabKey);
  };
};

export const restoreFocus = (previousActiveElement: Element | null) => {
  if (previousActiveElement && "focus" in previousActiveElement) {
    (previousActiveElement as HTMLElement).focus();
  }
};

// Dialog overlay utilities
export const createOverlayStyles = (isOpen: boolean) => ({
  position: "fixed" as const,
  inset: 0,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  backdropFilter: "blur(4px)",
  zIndex: 50,
  opacity: isOpen ? 1 : 0,
  transition: "opacity 200ms ease-in-out",
  pointerEvents: isOpen ? "auto" : ("none" as const),
});

// Mobile detection utility
export const isMobileDevice = (): boolean => {
  if (typeof window === "undefined") return false;

  return (
    window.innerWidth < 768 ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )
  );
};

// Dialog positioning utilities
export const getDialogPosition = (
  dialogType: string,
  isMobile: boolean
): React.CSSProperties => {
  if (isMobile) {
    return {
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      transform: "translateY(0)",
    };
  }

  return {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
  };
};

// Keyboard event handlers
export const createKeyboardHandlers = (
  onClose: () => void,
  config: DialogAccessibilityConfig
) => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape" && config.escapeToClose) {
      e.preventDefault();
      onClose();
    }
  };

  return { handleKeyDown };
};

// Dialog content animation variants for Framer Motion
export const dialogVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 10,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: {
      duration: 0.2,
      ease: "easeIn",
    },
  },
};

// Mobile slide variants
export const mobileSlideVariants = {
  hidden: {
    opacity: 0,
    y: "100%",
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    y: "100%",
    transition: {
      duration: 0.2,
      ease: "easeIn",
    },
  },
};
