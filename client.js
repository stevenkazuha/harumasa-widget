/**
 * Harumasa client half: only the pet loader.
 *
 * There is no theme layer here on purpose — the widget keeps the user's own palette and
 * just adds the corner pet. The pet script itself is served by the Host half, so it also
 * works in the desktop shell, where this module may not mount at all.
 */

window.__ModuleLoader__.load({
  id: '@local/harumasa-widget',
  factory() {
    const SRC = '/dsh-harumasa/pet.js';
    const ID = 'dsh-harumasa-pet-script';

    return {
      apply(ctx) {
        ctx.effect(() => {
          try {
            if (!document.getElementById(ID)) {
              const tag = document.createElement('script');
              tag.id = ID;
              tag.src = SRC;
              tag.onerror = function () {};
              (document.body || document.documentElement).appendChild(tag);
            }
          } catch (error) {
            /* the Host injection row may still load it */
          }
          return () => {
            try { if (window.__dshHarumasaPet && window.__dshHarumasaPet.remove) window.__dshHarumasaPet.remove(); } catch (error) {}
            try { const el = document.getElementById(ID); if (el) el.remove(); } catch (error) {}
          };
        });
      },
    };
  },
});
