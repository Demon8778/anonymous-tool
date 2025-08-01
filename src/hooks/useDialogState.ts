import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { DialogManager, DialogState, GifWithContext } from '@/lib/types/dialog';
import { ProcessedGif } from '@/lib/types/gif';
import { DialogUrlManager, createDialogTransition, DIALOG_TRANSITIONS } from '@/lib/utils/dialogTransitions';

interface DialogStateHook {
  dialogs: DialogManager;
  openGifEditor: (gif: GifWithContext) => void;
  openSharing: (processedGif: ProcessedGif) => void;
  openSharedViewer: (shareId: string) => void;
  closeDialog: (dialogType: keyof DialogManager) => void;
  closeAllDialogs: () => void;
  isAnyDialogOpen: boolean;
  updateUrlForCurrentState: () => void;
}

export const useDialogState = (): DialogStateHook => {
  const router = useRouter();
  const isInitialMount = useRef(true);
  const urlManager = useRef(DialogUrlManager.getInstance());
  
  const [dialogs, setDialogs] = useState<DialogManager>({
    gifEditor: {
      isOpen: false,
      data: null,
      onClose: () => {},
    },
    sharing: {
      isOpen: false,
      data: null,
      onClose: () => {},
    },
    sharedViewer: {
      isOpen: false,
      data: null,
      onClose: () => {},
    },
  });

  // Update URL for current dialog state
  const updateUrlForCurrentState = useCallback(() => {
    const currentParams = urlManager.current.getCurrentParams();
    
    urlManager.current.updateUrl({
      query: currentParams.query || undefined,
      page: currentParams.page > 1 ? currentParams.page : undefined,
      gifId: dialogs.gifEditor.isOpen && dialogs.gifEditor.data?.id ? dialogs.gifEditor.data.id : undefined,
      shareId: dialogs.sharedViewer.isOpen && dialogs.sharedViewer.data?.shareId ? dialogs.sharedViewer.data.shareId : undefined,
    });
  }, [dialogs]);

  // Close dialog function
  const closeDialog = useCallback((dialogType: keyof DialogManager) => {
    setDialogs(prev => ({
      ...prev,
      [dialogType]: {
        ...prev[dialogType],
        isOpen: false,
        data: null,
      },
    }));

    // Update URL to remove dialog parameters
    setTimeout(() => updateUrlForCurrentState(), 0);
  }, [updateUrlForCurrentState]);

  // Close all dialogs
  const closeAllDialogs = useCallback(() => {
    setDialogs(prev => ({
      gifEditor: { ...prev.gifEditor, isOpen: false, data: null },
      sharing: { ...prev.sharing, isOpen: false, data: null },
      sharedViewer: { ...prev.sharedViewer, isOpen: false, data: null },
    }));

    // Update URL to clear dialog parameters
    setTimeout(() => updateUrlForCurrentState(), 0);
  }, [updateUrlForCurrentState]);

  // Open GIF editor dialog
  const openGifEditor = useCallback((gif: GifWithContext) => {
    setDialogs(prev => ({
      ...prev,
      // Close other dialogs
      sharing: { ...prev.sharing, isOpen: false, data: null },
      sharedViewer: { ...prev.sharedViewer, isOpen: false, data: null },
      // Open GIF editor
      gifEditor: {
        isOpen: true,
        data: gif,
        onClose: () => closeDialog('gifEditor'),
      },
    }));

    // Update URL with gif parameter
    setTimeout(() => updateUrlForCurrentState(), 0);
  }, [closeDialog, updateUrlForCurrentState]);

  // Open sharing dialog
  const openSharing = useCallback((processedGif: ProcessedGif) => {
    setDialogs(prev => ({
      ...prev,
      sharing: {
        isOpen: true,
        data: processedGif,
        onClose: () => closeDialog('sharing'),
      },
    }));

    // Sharing dialog doesn't need URL updates as it's transient
  }, [closeDialog]);

  // Open shared viewer dialog
  const openSharedViewer = useCallback((shareId: string) => {
    setDialogs(prev => ({
      ...prev,
      // Close other dialogs
      gifEditor: { ...prev.gifEditor, isOpen: false, data: null },
      sharing: { ...prev.sharing, isOpen: false, data: null },
      // Open shared viewer
      sharedViewer: {
        isOpen: true,
        data: { shareId },
        onClose: () => closeDialog('sharedViewer'),
      },
    }));

    // Update URL with shared parameter
    setTimeout(() => updateUrlForCurrentState(), 0);
  }, [closeDialog, updateUrlForCurrentState]);

  // Check if any dialog is open
  const isAnyDialogOpen = dialogs.gifEditor.isOpen || 
                         dialogs.sharing.isOpen || 
                         dialogs.sharedViewer.isOpen;

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      // Check if URL actually changed to prevent infinite loops
      if (!urlManager.current.hasUrlChanged()) {
        return;
      }
      
      urlManager.current.syncUrl();
      const params = urlManager.current.getCurrentParams();

      // Close all dialogs if no relevant parameters
      if (!params.gifId && !params.shareId) {
        setDialogs(prev => ({
          gifEditor: { ...prev.gifEditor, isOpen: false, data: null },
          sharing: { ...prev.sharing, isOpen: false, data: null },
          sharedViewer: { ...prev.sharedViewer, isOpen: false, data: null },
        }));
        return;
      }

      // Handle shared GIF parameter
      if (params.shareId && (!dialogs.sharedViewer.isOpen || dialogs.sharedViewer.data?.shareId !== params.shareId)) {
        setDialogs(prev => ({
          gifEditor: { ...prev.gifEditor, isOpen: false, data: null },
          sharing: { ...prev.sharing, isOpen: false, data: null },
          sharedViewer: {
            isOpen: true,
            data: { shareId: params.shareId },
            onClose: () => closeDialog('sharedViewer'),
          },
        }));
        return;
      }

      // Handle GIF editor parameter
      if (params.gifId && (!dialogs.gifEditor.isOpen || dialogs.gifEditor.data?.id !== params.gifId)) {
        // Create a mock GIF for the editor (in real app, fetch by ID)
        const mockGif: GifWithContext = {
          id: params.gifId,
          title: 'Selected GIF',
          url: `https://media.giphy.com/media/${params.gifId}/giphy.gif`,
          preview: `https://media.giphy.com/media/${params.gifId}/200.gif`,
          width: 480,
          height: 270,
          duration: 2000,
          frameCount: 20,
          source: 'giphy',
          selectedAt: new Date(),
          searchQuery: params.query || undefined,
        };

        setDialogs(prev => ({
          sharing: { ...prev.sharing, isOpen: false, data: null },
          sharedViewer: { ...prev.sharedViewer, isOpen: false, data: null },
          gifEditor: {
            isOpen: true,
            data: mockGif,
            onClose: () => closeDialog('gifEditor'),
          },
        }));
        return;
      }
    };

    // Only add listener after initial mount to avoid conflicts
    if (!isInitialMount.current) {
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    } else {
      isInitialMount.current = false;
    }
  }, [dialogs, closeDialog]);

  // Update URL when dialog state changes
  useEffect(() => {
    if (!isInitialMount.current) {
      updateUrlForCurrentState();
    }
  }, [dialogs.gifEditor.isOpen, dialogs.sharedViewer.isOpen, updateUrlForCurrentState]);

  return {
    dialogs,
    openGifEditor,
    openSharing,
    openSharedViewer,
    closeDialog,
    closeAllDialogs,
    isAnyDialogOpen,
    updateUrlForCurrentState,
  };
};

