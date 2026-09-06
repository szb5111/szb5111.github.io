/**
 * ask.js — progressive enhancement for the FAQ question form.
 *
 * The form posts natively without JavaScript (Netlify Forms picks it up from
 * the static markup), so this only upgrades the experience: submit in place,
 * keep the page where it is, and report success or failure inline.
 *
 * Only one accordion stays open at a time, so the section never becomes a wall.
 */
export function initAsk() {
  /* ---- accordion: one at a time ---- */
  const items = [...document.querySelectorAll('.faq__item')];
  items.forEach((d) => {
    d.addEventListener('toggle', () => {
      if (!d.open) return;
      items.forEach((o) => { if (o !== d) o.open = false; });
    });
  });

  /* ---- the form ---- */
  const form = document.querySelector('.ask__form');
  if (!form) return;
  const status = form.querySelector('.ask__status');

  const say = (msg, state) => {
    status.textContent = msg;
    if (state) status.dataset.state = state; else status.removeAttribute('data-state');
  };

  form.addEventListener('submit', async (e) => {
    // Let the browser do its own validation pass first.
    if (!form.reportValidity()) return;
    e.preventDefault();

    form.classList.add('is-sending');
    say('Sending…');

    try {
      const body = new URLSearchParams(new FormData(form)).toString();
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body
      });
      if (!res.ok) throw new Error(res.status);
      form.reset();
      say('Got it. I’ll get back to you personally.', 'ok');
    } catch (err) {
      // Local dev has no form handler, and a network can fail anywhere:
      // hand the visitor a route that always works rather than a dead end.
      console.warn('[ask] falling back to email', err);
      const get = (n) => encodeURIComponent(form.elements[n]?.value || '');
      const subject = encodeURIComponent('Question from the website');
      const bodyText = `${form.elements.question?.value || ''}\n\n— ${form.elements.name?.value || ''}`;
      say('Couldn’t send from here — opening your email instead.', 'err');
      window.location.href =
        `mailto:szb5111@gmail.com?subject=${subject}&body=${encodeURIComponent(bodyText)}`;
    } finally {
      form.classList.remove('is-sending');
    }
  });
}
