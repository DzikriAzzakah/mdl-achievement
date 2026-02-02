import { useCertificateStore } from '#achievement/stores/certificate';
import { onBeforeUnmount, onMounted } from 'vue';

export function useKeyboardShortcuts() {
  const store = useCertificateStore();

  const handleKeyDown = (event: KeyboardEvent) => {
    // Skip if focus is on input elements
    const activeElement = document.activeElement;
    if (
      activeElement instanceof HTMLInputElement
      || activeElement instanceof HTMLTextAreaElement
      || activeElement?.getAttribute('contenteditable') === 'true'
    ) {
      return;
    }

    // Only process if something is selected
    if (!store.selectedContentKey) {
      return;
    }

    // Find selected content
    const selectedContent = store.contents.find(
      c => c.element_id === store.selectedContentKey,
    );
    if (!selectedContent) {
      return;
    }

    const isLocked = selectedContent.metadata.isLocked === true;
    const key = event.key;
    const isCtrl = event.ctrlKey || event.metaKey;
    const isShift = event.shiftKey;
    const moveAmount = isShift ? 10 : 1;

    // Handle Delete/Backspace - delete selected content
    if (key === 'Delete' || key === 'Backspace') {
      if (isLocked) {
        return;
      }

      const index = store.contents.findIndex(
        c => c.element_id === store.selectedContentKey,
      );
      if (index !== -1) {
        store.deleteContent(index);
      }
      return;
    }

    // Handle Arrow keys - move content
    if (key === 'ArrowUp') {
      if (isLocked) {
        return;
      }
      event.preventDefault();

      const index = store.contents.findIndex(
        c => c.element_id === store.selectedContentKey,
      );
      if (index !== -1) {
        store.contents[index].metadata.vertical -= moveAmount;
      }
      return;
    }

    if (key === 'ArrowDown') {
      if (isLocked) {
        return;
      }
      event.preventDefault();

      const index = store.contents.findIndex(
        c => c.element_id === store.selectedContentKey,
      );
      if (index !== -1) {
        store.contents[index].metadata.vertical += moveAmount;
      }
      return;
    }

    if (key === 'ArrowLeft') {
      if (isLocked) {
        return;
      }
      event.preventDefault();

      const index = store.contents.findIndex(
        c => c.element_id === store.selectedContentKey,
      );
      if (index !== -1) {
        store.contents[index].metadata.horizontal -= moveAmount;
      }
      return;
    }

    if (key === 'ArrowRight') {
      if (isLocked) {
        return;
      }
      event.preventDefault();

      const index = store.contents.findIndex(
        c => c.element_id === store.selectedContentKey,
      );
      if (index !== -1) {
        store.contents[index].metadata.horizontal += moveAmount;
      }
      return;
    }

    // Handle Ctrl+D - duplicate content
    if (isCtrl && key.toLowerCase() === 'd') {
      event.preventDefault();
      store.duplicateContent(store.selectedContentKey);
      return;
    }

    // Handle Ctrl+[ - send backward
    if (isCtrl && key === '[') {
      event.preventDefault();
      store.sendBackward(store.selectedContentKey);
      return;
    }

    // Handle Ctrl+] - bring forward
    if (isCtrl && key === ']') {
      event.preventDefault();
      store.bringForward(store.selectedContentKey);
      return;
    }

    // Handle Escape - deselect
    if (key === 'Escape') {
      store.selectedContentKey = null;
      return;
    }

    // Handle Ctrl+A - multi-select (placeholder)
    if (isCtrl && key.toLowerCase() === 'a') {
      event.preventDefault();
      console.warn('Multi-select not yet implemented');
    }
  };

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeyDown);
  });

  return {
    // Expose handleKeyDown for testing purposes
    handleKeyDown,
  };
}
