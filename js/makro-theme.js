/* makro restyle of the Fresh design system, part 1: Tailwind theme.
   Runs after vendor/tailwind-setup.js and before Tailwind Play generates classes.
   Radius: every DS radius step becomes 0 (makro is square). `rounded-full` is left alone
   on purpose, so genuinely round things (avatars, badges, round icon buttons) stay round.
   Colours and arbitrary radii are handled in css/makro-fresh.css (part 2). */
(function () {
  var ext = window.tailwind.config.theme.extend;
  var zero = {};
  ['none', 'sm', 'DEFAULT', 'md', 'lg', 'xl', '2xl', '3xl', 'ds-sm', 'ds-lg', 'ds-xl', 'ds-2xl', 'ds-3xl'].forEach(function (k) { zero[k] = '0px'; });
  ext.borderRadius = Object.assign(ext.borderRadius || {}, zero);
})();
