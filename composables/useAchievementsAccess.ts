import {
  PERMISSION_BADGE,
  PERMISSION_BADGE_CREATE,
  PERMISSION_BADGE_DELETE,
  PERMISSION_BADGE_DETAIL,
  PERMISSION_BADGE_EDIT,
  PERMISSION_BADGE_LIST,
  PERMISSION_CERTIFICATE,
  PERMISSION_CERTIFICATE_CREATE,
  PERMISSION_CERTIFICATE_DELETE,
  PERMISSION_CERTIFICATE_DETAIL,
  PERMISSION_CERTIFICATE_EDIT,
  PERMISSION_CERTIFICATE_LIST,
  PERMISSION_FEATURE_KEY,
} from '#achievement/config/featureFlag.ts';

export const useAchievementsAccess = () => {
  const { checkPermission } = useRBAC();

  const access = computed(() => {
    return {
      // Certificate permissions
      certificate: checkPermission(
        PERMISSION_FEATURE_KEY,
        [PERMISSION_CERTIFICATE],
        permissions => permissions.includes(`cms:${PERMISSION_FEATURE_KEY}:${PERMISSION_CERTIFICATE}`),
      ),
      certificateList: checkPermission(
        PERMISSION_FEATURE_KEY,
        [PERMISSION_CERTIFICATE_LIST],
        permissions => permissions.includes(`cms:${PERMISSION_FEATURE_KEY}:${PERMISSION_CERTIFICATE_LIST}`),
      ),
      certificateCreate: checkPermission(
        PERMISSION_FEATURE_KEY,
        [PERMISSION_CERTIFICATE_CREATE],
        permissions => permissions.includes(`cms:${PERMISSION_FEATURE_KEY}:${PERMISSION_CERTIFICATE_CREATE}`),
      ),
      certificateDetail: checkPermission(
        PERMISSION_FEATURE_KEY,
        [PERMISSION_CERTIFICATE_DETAIL],
        permissions => permissions.includes(`cms:${PERMISSION_FEATURE_KEY}:${PERMISSION_CERTIFICATE_DETAIL}`),
      ),
      certificateEdit: checkPermission(
        PERMISSION_FEATURE_KEY,
        [PERMISSION_CERTIFICATE_EDIT],
        permissions => permissions.includes(`cms:${PERMISSION_FEATURE_KEY}:${PERMISSION_CERTIFICATE_EDIT}`),
      ),
      certificateDelete: checkPermission(
        PERMISSION_FEATURE_KEY,
        [PERMISSION_CERTIFICATE_DELETE],
        permissions => permissions.includes(`cms:${PERMISSION_FEATURE_KEY}:${PERMISSION_CERTIFICATE_DELETE}`),
      ),

      // Badge permissions
      badge: checkPermission(
        PERMISSION_FEATURE_KEY,
        [PERMISSION_BADGE],
        permissions => permissions.includes(`cms:${PERMISSION_FEATURE_KEY}:${PERMISSION_BADGE}`),
      ),
      badgeList: checkPermission(
        PERMISSION_FEATURE_KEY,
        [PERMISSION_BADGE_LIST],
        permissions => permissions.includes(`cms:${PERMISSION_FEATURE_KEY}:${PERMISSION_BADGE_LIST}`),
      ),
      badgeCreate: checkPermission(
        PERMISSION_FEATURE_KEY,
        [PERMISSION_BADGE_CREATE],
        permissions => permissions.includes(`cms:${PERMISSION_FEATURE_KEY}:${PERMISSION_BADGE_CREATE}`),
      ),
      badgeDetail: checkPermission(
        PERMISSION_FEATURE_KEY,
        [PERMISSION_BADGE_DETAIL],
        permissions => permissions.includes(`cms:${PERMISSION_FEATURE_KEY}:${PERMISSION_BADGE_DETAIL}`),
      ),
      badgeEdit: checkPermission(
        PERMISSION_FEATURE_KEY,
        [PERMISSION_BADGE_EDIT],
        permissions => permissions.includes(`cms:${PERMISSION_FEATURE_KEY}:${PERMISSION_BADGE_EDIT}`),
      ),
      badgeDelete: checkPermission(
        PERMISSION_FEATURE_KEY,
        [PERMISSION_BADGE_DELETE],
        permissions => permissions.includes(`cms:${PERMISSION_FEATURE_KEY}:${PERMISSION_BADGE_DELETE}`),
      ),
    };
  });

  return {
    access,
  };
};
