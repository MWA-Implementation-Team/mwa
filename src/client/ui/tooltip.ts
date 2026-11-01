// Upgrades plain title= hints into a top-layer popover. A DOM tooltip inside a
// scroll or clip container gets cut at the container's edge — z-index can't
// help because clipping is geometric, not stacking. The [popover] top layer
// escapes both (and .mwa's filter containing block). Elements keep title= as
// the source of truth: it's the accessible name and the no-popover/no-JS
// fallback — we only hide it from the browser while our own bubble is up.
let tip: HTMLDivElement | undefined;
let current: HTMLElement | undefined;
let timer: ReturnType<typeof setTimeout> | undefined;

const SHOW_DELAY = 400;
const OFFSET = 8;
const EDGE = 8;

function hide() {
    if (timer !== undefined) clearTimeout(timer);
    timer = undefined;
    if (current?.dataset.mwaTip !== undefined) {
        current.setAttribute('title', current.dataset.mwaTip);
        delete current.dataset.mwaTip;
    }
    current = undefined;
    tip?.hidePopover();
}

function show(el: HTMLElement) {
    const text = el.getAttribute('title');
    if (!tip || !text) return;
    current = el;
    el.dataset.mwaTip = text;
    el.removeAttribute('title');
    tip.textContent = text;
    tip.showPopover();
    const r = el.getBoundingClientRect();
    const tr = tip.getBoundingClientRect();
    tip.style.left = `${Math.min(
        Math.max(EDGE, r.left + r.width / 2 - tr.width / 2),
        innerWidth - tr.width - EDGE,
    )}px`;
    tip.style.top = `${r.top - tr.height - OFFSET >= EDGE ? r.top - tr.height - OFFSET : r.bottom + OFFSET}px`;
}

export function installTooltips() {
    if (tip !== undefined) return;
    if (typeof HTMLElement.prototype.showPopover !== 'function') return;
    const el = document.querySelector('.mwa-tooltip');
    if (!(el instanceof HTMLDivElement)) return;
    tip = el;

    document.addEventListener('mouseover', (e) => {
        const el = (e.target as HTMLElement | null)?.closest?.('[title]');
        if (el === current && timer === undefined) return;
        hide();
        if (el instanceof HTMLElement) {
            timer = setTimeout(() => show(el), SHOW_DELAY);
        }
    });
    // Leaving the window entirely produces no mouseover — catch it here.
    document.addEventListener('mouseout', (e) => {
        if (!e.relatedTarget) hide();
    });
    document.addEventListener('scroll', hide, true);
    document.addEventListener('pointerdown', hide, true);
}
