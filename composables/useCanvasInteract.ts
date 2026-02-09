import type { CertificateContentForm, SafeZone } from '#achievement/config/types.ts';
import type { OnDrag, OnDragEnd, OnResize, OnResizeEnd } from 'vue3-moveable';
import { nextTick } from 'vue';

interface UseCanvasInteractOptions {
  contents: Ref<CertificateContentForm[]>;
  safeZone: Ref<SafeZone>;
  selectedContentKey: Ref<string | null>;
}

export function useCanvasInteract(options: UseCanvasInteractOptions) {
  const { contents, safeZone, selectedContentKey } = options;

  const moveableRef = ref<InstanceType<typeof import('vue3-moveable').default> | null>(null);
  const targetRef = ref<HTMLElement | null>(null);

  function getMargins() {
    return {
      left: safeZone.value?.left || 0,
      top: safeZone.value?.top || 0,
    };
  }

  function handleSelectContent(e: Event, key: string) {
    selectedContentKey.value = key;

    nextTick(() => {
      const el = document.getElementById(key);
      targetRef.value = el;
    });
  }

  function handleClickOutsideContent() {
    selectedContentKey.value = null;
    targetRef.value = null;
  }

  function onDrag(event: OnDrag) {
    const { target, left, top } = event;
    if (target instanceof HTMLElement) {
      target.style.left = `${left}px`;
      target.style.top = `${top}px`;
    }
  }

  function onDragEnd(event: OnDragEnd) {
    const { target } = event;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const contentIndex = contents.value.findIndex(c => c.element_id === selectedContentKey.value);
    if (contentIndex === -1) {
      return;
    }

    const { left: safeLeft, top: safeTop } = getMargins();

    const finalLeft = Number.parseFloat(target.style.left || '0');
    const finalTop = Number.parseFloat(target.style.top || '0');

    contents.value[contentIndex].metadata.horizontal = Math.round(finalLeft - safeLeft);
    contents.value[contentIndex].metadata.vertical = Math.round(finalTop - safeTop);
  }

  function onResize(event: OnResize) {
    const { target, width, height, drag } = event;
    if (target instanceof HTMLElement) {
      target.style.width = `${width}px`;
      target.style.height = `${height}px`;
      target.style.left = `${drag.left}px`;
      target.style.top = `${drag.top}px`;
    }
  }

  function onResizeEnd(event: OnResizeEnd) {
    const { target } = event;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const contentIndex = contents.value.findIndex(c => c.element_id === selectedContentKey.value);
    if (contentIndex === -1) {
      return;
    }

    const { left: safeLeft, top: safeTop } = getMargins();

    const finalWidth = Number.parseFloat(target.style.width);
    const finalHeight = Number.parseFloat(target.style.height);
    const finalLeft = Number.parseFloat(target.style.left);
    const finalTop = Number.parseFloat(target.style.top);

    const content = contents.value[contentIndex];
    const metadata = content.metadata as any;

    const shouldSwitchWidthToFix = metadata.width_mode !== 'fix';
    const shouldSwitchHeightToFix = metadata.height_mode !== 'fix';

    contents.value[contentIndex].metadata.width = Math.round(finalWidth);
    contents.value[contentIndex].metadata.height = Math.round(finalHeight);
    contents.value[contentIndex].metadata.horizontal = Math.round(finalLeft - safeLeft);
    contents.value[contentIndex].metadata.vertical = Math.round(finalTop - safeTop);

    if (shouldSwitchWidthToFix) {
      (contents.value[contentIndex].metadata as any).width_mode = 'fix';
    }
    if (shouldSwitchHeightToFix) {
      (contents.value[contentIndex].metadata as any).height_mode = 'fix';
    }
  }

  watch(
    () => contents.value,
    () => {
      nextTick(() => {
        moveableRef.value?.updateRect();
      });
    },
    { deep: true },
  );

  watch(
    () => selectedContentKey.value,
    (newKey) => {
      nextTick(() => {
        if (newKey) {
          const el = document.getElementById(newKey);
          targetRef.value = el;
        }
        else {
          targetRef.value = null;
        }
      });
    },
  );

  return {
    moveableRef,
    targetRef,

    handleSelectContent,
    handleClickOutsideContent,
    onDrag,
    onDragEnd,
    onResize,
    onResizeEnd,
  };
}
