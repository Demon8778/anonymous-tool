/**
 * Utility functions for managing smooth dialog transitions and URL state
 */

export interface TransitionConfig {
  duration: number;
  easing: string;
  delay?: number;
}

export const DEFAULT_TRANSITION: TransitionConfig = {
  duration: 300,
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  delay: 0,
};

export const DIALOG_TRANSITIONS = {
  open: {
    duration: 300,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    delay: 0,
  },
  close: {
    duration: 250,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    delay: 0,
  },
  switch: {
    duration: 200,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    delay: 100,
  },
} as const;

/**
 * Creates a smooth transition between dialog states
 */
export function createDialogTransition(
  fromAction: () => void,
  toAction: () => void,
  config: TransitionConfig = DIALOG_TRANSITIONS.switch
): Promise<void> {
  return new Promise((resolve) => {
    // Execute the from action (e.g., close current dialog)
    fromAction();
    
    // Wait for the transition to complete, then execute the to action
    setTimeout(() => {
      toAction();
      resolve();
    }, config.duration + (config.delay || 0));
  });
}

/**
 * Manages URL state for dialog transitions
 */
export class DialogUrlManager {
  private static instance: DialogUrlManager;
  private currentUrl: string = '';
  private isUpdating: boolean = false;

  static getInstance(): DialogUrlManager {
    if (!DialogUrlManager.instance) {
      DialogUrlManager.instance = new DialogUrlManager();
    }
    return DialogUrlManager.instance;
  }

  /**
   * Updates URL with dialog state, preserving search parameters
   */
  updateUrl(params: {
    query?: string;
    page?: number;
    gifId?: string;
    shareId?: string;
  }): void {
    if (this.isUpdating) return;
    
    this.isUpdating = true;
    
    const url = new URL(window.location.href);
    
    // Clear existing dialog params
    url.searchParams.delete('gif');
    url.searchParams.delete('shared');
    
    // Set search params
    if (params.query) {
      url.searchParams.set('q', params.query);
    }
    
    if (params.page && params.page > 1) {
      url.searchParams.set('page', params.page.toString());
    } else {
      url.searchParams.delete('page');
    }
    
    // Set dialog params
    if (params.gifId) {
      url.searchParams.set('gif', params.gifId);
    }
    
    if (params.shareId) {
      url.searchParams.set('shared', params.shareId);
    }
    
    const newUrl = url.toString();
    if (newUrl !== this.currentUrl) {
      this.currentUrl = newUrl;
      window.history.replaceState({}, '', newUrl);
    }
    
    // Reset updating flag after a short delay
    setTimeout(() => {
      this.isUpdating = false;
    }, 50);
  }

  /**
   * Gets current URL parameters
   */
  getCurrentParams(): {
    query: string | null;
    page: number;
    gifId: string | null;
    shareId: string | null;
  } {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      query: urlParams.get('q'),
      page: parseInt(urlParams.get('page') || '1', 10),
      gifId: urlParams.get('gif'),
      shareId: urlParams.get('shared'),
    };
  }

  /**
   * Checks if URL has changed since last update
   */
  hasUrlChanged(): boolean {
    return window.location.href !== this.currentUrl;
  }

  /**
   * Syncs current URL with internal state
   */
  syncUrl(): void {
    this.currentUrl = window.location.href;
  }
}

/**
 * Creates a smooth GIF selection transition
 */
export function createGifSelectionTransition(
  gifElement: HTMLElement | null,
  onComplete: () => void
): void {
  if (!gifElement) {
    onComplete();
    return;
  }

  // Add selection highlight effect
  gifElement.style.transform = 'scale(1.05)';
  gifElement.style.transition = 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)';
  
  // Add a subtle glow effect
  gifElement.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.3)';
  
  setTimeout(() => {
    // Reset the transform but keep the selection state
    gifElement.style.transform = 'scale(1)';
    
    setTimeout(() => {
      onComplete();
    }, 100);
  }, 200);
}

/**
 * Handles browser navigation events for dialog states
 */
export function handleBrowserNavigation(
  currentDialogState: any,
  onStateChange: (newState: any) => void
): void {
  const params = DialogUrlManager.getInstance().getCurrentParams();
  
  // Determine what dialog should be open based on URL
  let targetState: any = {
    gifEditor: { isOpen: false, data: null },
    sharing: { isOpen: false, data: null },
    sharedViewer: { isOpen: false, data: null },
  };

  if (params.shareId) {
    targetState.sharedViewer = {
      isOpen: true,
      data: { shareId: params.shareId },
    };
  } else if (params.gifId) {
    targetState.gifEditor = {
      isOpen: true,
      data: { id: params.gifId },
    };
  }

  // Only update if state actually changed
  const hasChanged = 
    currentDialogState.gifEditor.isOpen !== targetState.gifEditor.isOpen ||
    currentDialogState.sharedViewer.isOpen !== targetState.sharedViewer.isOpen ||
    (currentDialogState.gifEditor.data?.id !== params.gifId) ||
    (currentDialogState.sharedViewer.data?.shareId !== params.shareId);

  if (hasChanged) {
    onStateChange(targetState);
  }
}