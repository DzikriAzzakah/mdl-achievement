import type {
  CertificateContentForm,
  CertificateContentPayload,
  SafeZone,
} from '#achievement/config/types.ts';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '#achievement/config/constants.ts';
import { createContent, generateContentKey } from '#achievement/utils/contentFactory';
import { mapContentPayloadToForm } from '#achievement/utils/contentMapper';

const contentIdCounter = ref<number>(0);
const selectedContentKey = ref<string | null>(null);
const deletedContents = ref<CertificateContentForm[]>([]);
const contents = ref<CertificateContentForm[]>([]);

export function useCertificateCanvas() {
  function addContent(type: string): string | null {
    contentIdCounter.value++;
    const key = generateContentKey(type, contentIdCounter.value);
    const newContent = createContent(type, key);

    if (!newContent) {
      console.error(`Unknown content type: ${type}`);
      return null;
    }

    contents.value = [...contents.value, newContent];
    selectedContentKey.value = key;
    return key;
  }

  function updateContentByIndex(index: number, data: CertificateContentForm): void {
    if (index < 0 || index >= contents.value.length) {
      console.error(`Content at index ${index} not found`);
      return;
    }

    const updatedContents = [...contents.value];
    updatedContents[index] = data;
    contents.value = updatedContents;
  }

  function updateContentPosition(elementId: string, horizontal: number, vertical: number): void {
    const index = contents.value.findIndex(c => c.element_id === elementId);
    if (index === -1) {
      return;
    }

    const content = contents.value[index];
    const updatedContents = [...contents.value];
    updatedContents[index] = {
      ...content,
      metadata: {
        ...content.metadata,
        horizontal,
        vertical,
      },
    } as CertificateContentForm;
    contents.value = updatedContents;
  }

  function deleteContent(index: number): void {
    if (index < 0 || index >= contents.value.length) {
      console.error(`Content at index ${index} not found`);
      return;
    }

    const contentToDelete = contents.value[index];
    const deletedElementId = contentToDelete.element_id;

    if (contentToDelete.id) {
      deletedContents.value.push(contentToDelete);
    }

    const updatedContents = [...contents.value];
    updatedContents.splice(index, 1);
    contents.value = updatedContents;

    if (selectedContentKey.value === deletedElementId) {
      selectedContentKey.value = null;
    }
  }

  function toggleContentSelection(elementId: string): void {
    if (selectedContentKey.value === elementId) {
      selectedContentKey.value = null;
    }
    else {
      selectedContentKey.value = elementId;
    }
  }

  function reorderLayers(elementId: string, direction: 'forward' | 'backward' | 'front' | 'back'): void {
    const index = contents.value.findIndex(c => c.element_id === elementId);
    if (index === -1) {
      return;
    }

    const updatedContents = [...contents.value];

    switch (direction) {
      case 'forward': {
        if (index >= contents.value.length - 1) {
          return;
        }
        [updatedContents[index], updatedContents[index + 1]] = [updatedContents[index + 1], updatedContents[index]];
        break;
      }
      case 'backward': {
        if (index <= 0) {
          return;
        }
        [updatedContents[index], updatedContents[index - 1]] = [updatedContents[index - 1], updatedContents[index]];
        break;
      }
      case 'front': {
        if (index >= contents.value.length - 1) {
          return;
        }
        const [elementFront] = updatedContents.splice(index, 1);
        updatedContents.push(elementFront);
        break;
      }
      case 'back': {
        if (index <= 0) {
          return;
        }
        const [elementBack] = updatedContents.splice(index, 1);
        updatedContents.unshift(elementBack);
        break;
      }
      default:
        break;
    }

    contents.value = updatedContents;
  }

  function alignContent(elementId: string, type: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom', safeZone: SafeZone): void {
    const index = contents.value.findIndex(c => c.element_id === elementId);
    if (index === -1) {
      return;
    }

    const content = contents.value[index];
    const safeZoneLeft = safeZone?.left || 0;
    const safeZoneRight = safeZone?.right || 0;
    const safeZoneTop = safeZone?.top || 0;
    const safeZoneBottom = safeZone?.bottom || 0;

    const safeZoneWidth = CANVAS_WIDTH - safeZoneLeft - safeZoneRight;
    const safeZoneHeight = CANVAS_HEIGHT - safeZoneTop - safeZoneBottom;

    const metadata = content.metadata;
    const widthMode = (metadata as any).width_mode;
    const heightMode = (metadata as any).height_mode;

    if (widthMode === 'fill' && (type === 'center' || type === 'right')) {
      return;
    }
    if (heightMode === 'fill' && (type === 'middle' || type === 'bottom')) {
      return;
    }
    if (metadata.width === 'fit-content' && (type === 'center' || type === 'right')) {
      return;
    }
    if (metadata.height === 'fit-content' && (type === 'middle' || type === 'bottom')) {
      return;
    }

    const elementWidth = typeof metadata.width === 'number' ? metadata.width : 0;
    const elementHeight = typeof metadata.height === 'number' ? metadata.height : 0;

    const updatedContents = [...contents.value];
    const updatedMetadata = { ...metadata };

    switch (type) {
      case 'left':
        updatedMetadata.horizontal = 0;
        break;
      case 'center':
        updatedMetadata.horizontal = Math.max(0, (safeZoneWidth - elementWidth) / 2);
        break;
      case 'right':
        updatedMetadata.horizontal = Math.max(0, safeZoneWidth - elementWidth);
        break;
      case 'top':
        updatedMetadata.vertical = 0;
        break;
      case 'middle':
        updatedMetadata.vertical = Math.max(0, (safeZoneHeight - elementHeight) / 2);
        break;
      case 'bottom':
        updatedMetadata.vertical = Math.max(0, safeZoneHeight - elementHeight);
        break;
      default:
        break;
    }

    updatedContents[index] = {
      ...content,
      metadata: updatedMetadata,
    } as CertificateContentForm;
    contents.value = updatedContents;
  }

  function duplicateContent(elementId: string): void {
    const index = contents.value.findIndex(c => c.element_id === elementId);
    if (index === -1) {
      return;
    }

    const originalContent = contents.value[index];
    contentIdCounter.value++;
    const newElementId = generateContentKey(originalContent.type, contentIdCounter.value);

    const clonedContent: CertificateContentForm = JSON.parse(JSON.stringify(originalContent));
    clonedContent.element_id = newElementId;
    clonedContent.id = undefined;
    clonedContent.metadata.horizontal += 10;
    clonedContent.metadata.vertical += 10;

    contents.value = [...contents.value, clonedContent];
    selectedContentKey.value = newElementId;
  }

  function toggleLock(elementId: string): void {
    const index = contents.value.findIndex(c => c.element_id === elementId);
    if (index === -1) {
      return;
    }

    const content = contents.value[index];
    const updatedContents = [...contents.value];
    updatedContents[index] = {
      ...content,
      metadata: {
        ...content.metadata,
        isLocked: !content.metadata.isLocked,
      },
    } as CertificateContentForm;
    contents.value = updatedContents;
  }

  function reorderContents(newContents: CertificateContentForm[]): void {
    contents.value = newContents;
  }

  function loadContentsFromPayload(payloads: CertificateContentPayload[]): void {
    const mappedContents: CertificateContentForm[] = payloads.map((content, index) => {
      return mapContentPayloadToForm(content, index);
    });

    if (mappedContents.length > 0) {
      const maxId = mappedContents.reduce((max, c) => {
        const match = c.element_id.match(/_(\d+)$/);
        const id = match ? Number.parseInt(match[1], 10) : 0;
        return Math.max(max, id);
      }, 0);
      contentIdCounter.value = maxId;
    }

    contents.value = mappedContents;
  }

  function resetCanvas(): void {
    contents.value = [];
    contentIdCounter.value = 0;
    selectedContentKey.value = null;
    deletedContents.value = [];
  }

  return {
    contents,
    contentIdCounter,
    selectedContentKey,
    deletedContents,

    addContent,
    updateContentByIndex,
    updateContentPosition,
    deleteContent,
    toggleContentSelection,
    reorderLayers,
    alignContent,
    duplicateContent,
    toggleLock,
    reorderContents,
    loadContentsFromPayload,
    resetCanvas,
  };
}
