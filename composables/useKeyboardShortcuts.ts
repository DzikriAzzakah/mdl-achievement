import { useCertificateCanvas } from '#achievement/composables/useCertificateCanvas';
import { onBeforeUnmount, onMounted } from 'vue';

export function useKeyboardShortcuts() {
  const canvas = useCertificateCanvas();

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
    if (!canvas.selectedContentKey.value) {
      return;
    }

    // Find selected content
    const selectedContent = canvas.contents.value.find(
      c => c.element_id === canvas.selectedContentKey.value,
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

      const index = canvas.contents.value.findIndex(
        c => c.element_id === canvas.selectedContentKey.value,
      );
      if (index !== -1) {
        canvas.deleteContent(index);
      }
      return;
    }

    // Handle Arrow keys - move content
    if (key === 'ArrowUp') {
      if (isLocked) {
        return;
      }
      event.preventDefault();

      const index = canvas.contents.value.findIndex(
        c => c.element_id === canvas.selectedContentKey.value,
      );
      if (index !== -1) {
        canvas.contents.value[index].metadata.vertical -= moveAmount;
      }
      return;
    }

    if (key === 'ArrowDown') {
      if (isLocked) {
        return;
      }
      event.preventDefault();

      const index = canvas.contents.value.findIndex(
        c => c.element_id === canvas.selectedContentKey.value,
      );
      if (index !== -1) {
        canvas.contents.value[index].metadata.vertical += moveAmount;
      }
      return;
    }

    if (key === 'ArrowLeft') {
      if (isLocked) {
        return;
      }
      event.preventDefault();

      const index = canvas.contents.value.findIndex(
        c => c.element_id === canvas.selectedContentKey.value,
      );
      if (index !== -1) {
        canvas.contents.value[index].metadata.horizontal -= moveAmount;
      }
      return;
    }

    if (key === 'ArrowRight') {
      if (isLocked) {
        return;
      }
      event.preventDefault();

      const index = canvas.contents.value.findIndex(
        c => c.element_id === canvas.selectedContentKey.value,
      );
      if (index !== -1) {
        canvas.contents.value[index].metadata.horizontal += moveAmount;
      }
      return;
    }

    // Handle Ctrl+D - duplicate content
    if (isCtrl && key.toLowerCase() === 'd') {
      event.preventDefault();
      canvas.duplicateContent(canvas.selectedContentKey.value);
      return;
    }

    // Handle Ctrl+[ - send backward
    if (isCtrl && key === '[') {
      event.preventDefault();
      canvas.reorderLayers(canvas.selectedContentKey.value, 'backward');
      return;
    }

    // Handle Ctrl+] - bring forward
    if (isCtrl && key === ']') {
      event.preventDefault();
      canvas.reorderLayers(canvas.selectedContentKey.value, 'forward');
      return;
    }

    // Handle Escape - deselect
    if (key === 'Escape') {
      canvas.selectedContentKey.value = null;
      return;
    }

    // Handle Ctrl+A - multi-select (placeholder)
    if (isCtrl && key.toLowerCase() === 'a') {
      event.preventDefault();
      console.warn('[App] Multi-select not yet implemented');
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
