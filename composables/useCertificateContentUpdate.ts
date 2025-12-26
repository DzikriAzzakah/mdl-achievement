import type {
  ICertificateContentForm,
} from '#achievement/config/types';

/**
 * Composable for managing certificate content updates
 * Provides type-safe update functions that eliminate boilerplate
 */
export function useCertificateContentUpdate<T extends ICertificateContentForm>(
  contentItem: T,
  emit: (event: 'update:contentItem', value: T) => void,
) {
  const updateValue = (value: string | undefined) => {
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

  const updateWidth = (value: string | number) => {
    updateMetadataField('width' as any, typeof value === 'string' ? Number(value) : value);
  };

  const updateHeight = (value: string | number) => {
    updateMetadataField('height' as any, typeof value === 'string' ? Number(value) : value);
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

  // Special update for location metadata
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
    updateLocation,
    updateDateFormat,
    updateMetadataField,
  };
}
