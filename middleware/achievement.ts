import { REMOTE_FEAT_FLAG_KEY } from '#achievement/config/constants';
import FeatureFlag from '#achievement/config/featureFlag';

export default defineNuxtRouteMiddleware((to, _) => {
  const auth = useAppAuth();

  // TODO: Get remote feature flag
  const remoteFeats = auth.getSession()?.featureEnabled || {};
  const isRemoteFeatEnabled = remoteFeats[REMOTE_FEAT_FLAG_KEY];

  // STEP 1: Feature check
  // We check if the module or feature itself is enabled

  // Check this conditions:
  // 1. Internal feature flag is set (if any)
  // 2. Remote feature flag is set (if any)
  if (!FeatureFlag.FEATURE_ENABLED || !isRemoteFeatEnabled) {
    return abortNavigation();
  }

  // STEP 2: Permission check (if opt-out from `rbac` middleware)
  // This step is optional (or even not necessary) if the page also uses 'rbac' middleware
  // We compare RBAC data with the permission defined in each route `meta` here.
  // We expected `rbac.permissions` value to be like below:
  // ```
  // definePageMeta({
  //   //... other meta
  //   rbac: {
  //     permissions: boolean | string[]  // expect true/false to disable whole access, or array of permission list: ie. ["read", "write", "delete"]
  //   }
  // })
  // ```

  // if not permitted,
  // throw user to 403 page. (to throw to 403 page, pass `fatal: true` !)
  if (to.meta?.rbac?.permissions === false) {
    throw createError({ statusCode: 403, statusMessage: 'Not Authorized', fatal: true });
  }
  else if (to.meta?.rbac?.permissions !== true) {
    // TODO: Add case-specific permission here if any
  }

  // STEP 3: Check if page requires login (if opt-out from `app-auth` middleware)
  // This step is optional (or even not necessary) if the page also uses 'app-auth' middleware
  // as auth state check is already handled there.
  if (!auth.isAuthenticated() && to?.path !== '/auth/login') {
    return navigateTo('/auth/login');
  }
});
