import type {
  ICertificateContentForm,
  SizeMode,
} from '#achievement/config/types';

export function useCertificateContentUpdate<T extends ICertificateContentForm>(
  getCurrentItem: () => T,
  emit: (event: 'update:contentItem', value: T) => void,
) {
  const updateValue = (value: string | undefined): void => {
    const contentItem = getCurrentItem();
    const updatedItem = {
      ...contentItem,
      value: value || (contentItem.type === 'text' ? '' : `{{ ${contentItem.type} }}`),
    } as T;
    emit('update:contentItem', updatedItem);
  };

  const updateMetadataField = <K extends keyof T['metadata']>(
    field: K,
    value: T['metadata'][K],
  ) => {
    const contentItem = getCurrentItem();
    const updatedItem = {
      ...contentItem,
      value: contentItem.value,
      metadata: {
        ...contentItem.metadata,
        [field]: value,
      },
    } as T;
    emit('update:contentItem', updatedItem);
  };

  const updateMultipleMetadataFields = (fields: Partial<T['metadata']>) => {
    const contentItem = getCurrentItem();
    const updatedItem = {
      ...contentItem,
      value: contentItem.value,
      metadata: {
        ...contentItem.metadata,
        ...fields,
      },
    } as T;
    emit('update:contentItem', updatedItem);
  };

  const updateWidth = (value: string | number | 'fit-content') => {
    updateMetadataField('width' as any, value === 'fit-content' ? 'fit-content' : (typeof value === 'string' ? Number(value) : value));
  };

  const updateHeight = (value: string | number | 'fit-content') => {
    updateMetadataField('height' as any, value === 'fit-content' ? 'fit-content' : (typeof value === 'string' ? Number(value) : value));
  };

  const updateFontSize = (value: string | number) => {
    updateMetadataField('font_size' as any, typeof value === 'string' ? Number(value) : value);
  };

  const updateFontWeight = (value: number) => {
    updateMetadataField('font_weight' as any, value);
  };

  const updateFontFamily = (value: string) => {
    updateMetadataField('font_family' as any, value);
  };

  const updateAlignment = (value: { label: string; value: string; }) => {
    updateMetadataField('alignment' as any, value);
  };

  const updateColor = (value: string | number) => {
    updateMetadataField('color' as any, String(value) || '000000');
  };

  const updateVertical = (value: string | number) => {
    updateMetadataField('vertical' as any, typeof value === 'string' ? Number(value) : value);
  };

  const updateHorizontal = (value: string | number) => {
    updateMetadataField('horizontal' as any, typeof value === 'string' ? Number(value) : value);
  };

  const updateAspectRatioLock = (value: boolean) => {
    updateMetadataField('isAspectRatioLocked' as any, value);
  };

  const updateWidthModeWithValue = (mode: SizeMode, width: number | 'fit-content', unlockAspectRatio?: boolean) => {
    const fields: Record<string, any> = {
      width_mode: mode,
      width,
    };

    if (mode === 'fill') {
      fields.horizontal = 0;
    }

    if (unlockAspectRatio) {
      fields.isAspectRatioLocked = false;
    }
    updateMultipleMetadataFields(fields as any);
  };

  const updateHeightModeWithValue = (mode: SizeMode, height: number | 'fit-content', unlockAspectRatio?: boolean) => {
    const fields: Record<string, any> = {
      height_mode: mode,
      height,
    };

    if (mode === 'fill') {
      fields.vertical = 0;
    }

    if (unlockAspectRatio) {
      fields.isAspectRatioLocked = false;
    }
    updateMultipleMetadataFields(fields as any);
  };

  const updateLocation = (value: string | undefined) => {
    updateMetadataField('location' as any, value || '');
  };

  const updateDateFormat = (value: string) => {
    updateMetadataField('date_format' as any, value);
  };

  return {
    updateValue,
    updateWidth,
    updateHeight,
    updateFontSize,
    updateFontWeight,
    updateFontFamily,
    updateAlignment,
    updateColor,
    updateVertical,
    updateHorizontal,
    updateAspectRatioLock,
    updateWidthModeWithValue,
    updateHeightModeWithValue,
    updateLocation,
    updateDateFormat,
  };
}
