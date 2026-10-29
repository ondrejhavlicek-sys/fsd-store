/* Fresh (Vue + @kosik/ui) bridge for the vanilla prototype.
   The shell stays plain JS; Fresh components live in small Vue "islands" that are mounted once
   and kept alive across App.render() (see js/nav.js). Fresh.ready resolves when Tailwind Play has
   generated its first DS classes, so islands do not measure themselves unstyled. */
window.Fresh = (function () {
  const { createApp } = Vue;
  const ready = new Promise(function (resolve) {
    const probe = document.createElement('span');
    probe.className = 'tw-text-style-xs';
    probe.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none';
    document.body.appendChild(probe);
    let tries = 0;
    (function wait() {
      if (getComputedStyle(probe).fontSize === '11px' || tries++ > 120) { probe.remove(); resolve(); return; }
      setTimeout(wait, 16);
    })();
  });
  /* Mount a component into a (possibly detached) element. Returns the Vue app. */
  function mount(component, el, register) {
    const app = createApp(component);
    KosikUI.install(app);
    if (register) register(app);
    app.mount(el);
    return app;
  }
  return { ready, mount, icons: KosikUI.icons };
})();
