import type { CertificateContentForm } from '#achievement/config/types';
import { useCertificateContentUpdate } from '#achievement/composables/useCertificateContentUpdate';

interface AlignmentOption {
  label: string;
  value: string;
}

interface AlignmentControlsProps<T> {
  contentItem: T;
}

export function useAlignmentControls<T extends CertificateContentForm>(
  props: AlignmentControlsProps<T>,
  emit: (event: 'update:contentItem' | 'delete' | 'headerClick', value?: any) => void,
) {
  const updateHandlers = useCertificateContentUpdate(() => props.contentItem, emit as any);

  const handleAlignmentUpdate = (value: string | number | object | any[] | undefined) => {
    if (value && typeof value === 'object' && 'label' in value && 'value' in value) {
      const alignmentValue: AlignmentOption = value as AlignmentOption;
      updateHandlers.updateAlignment(alignmentValue);
    }
  };

  const handleValueUpdate = (value: string | undefined) => {
    updateHandlers.updateValue(value);
  };

  return {
    handleAlignmentUpdate,
    handleValueUpdate,
  };
}
