import * as FeatureFlag from '#audio/config/featureFlag';

export default defineNuxtRouteMiddleware((to, _from) => {
  const auth = useAppAuth();

  if (!FeatureFlag.FEATURE_ENABLED) {
    return abortNavigation();
  }

  if (!auth.isAuthenticated()) {
    return navigateTo('/auth/login');
  }
  if (to.path === '/audio' && !to.query.tab) {
    return navigateTo({
      path: '/audio',
      query: { tab: 'audio-list' },
    });
  }
});
