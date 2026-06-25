import { PERMISSION_CREATE, PERMISSION_DELETE, PERMISSION_DETAIL, PERMISSION_EDIT, PERMISSION_LIST } from '#audio/config/featureFlag';

export const useAccessAudio = () => {
  const { checkPermission } = useRBAC();
  const access = computed(() => {
    return {
      create: checkPermission(PERMISSION_LIST, [PERMISSION_CREATE]),
      edit: checkPermission(PERMISSION_LIST, [PERMISSION_EDIT]),
      detail: checkPermission(PERMISSION_LIST, [PERMISSION_DETAIL]),
      delete: checkPermission(PERMISSION_LIST, [PERMISSION_DELETE]),
    };
  });

  return {
    access,
  };
};
