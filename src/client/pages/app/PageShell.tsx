import type { ComponentChildren } from 'preact';

type PageShellProps = {
    title: string;
    subtitle?: string;
    eyebrow?: string;
    narrow?: boolean;
    children: ComponentChildren;
};

/**
 * Shared page layout, inspired by the compact light interface in layout.html.
 * The CSS is self-contained so these pages do not depend on a new bundler/CSS entry point.
 * Keep this file in the same directory as the page components.
 */
const styles = `
.mwa-shell {
    --mwa-accent: #cc181e;
    --mwa-link: #167ac6;
    --mwa-text: #333;
    --mwa-muted: #777;
    --mwa-line: #d9d9d9;
    --mwa-surface: #fff;
    box-sizing: border-box;
    min-height: calc(100vh - 64px);
    padding: 34px 22px 60px;
    background: #f7f7f7;
    color: var(--mwa-text);
    font: 14px/1.55 Roboto, 'Segoe UI', Arial, sans-serif;
}
.mwa-shell *, .mwa-shell *::before, .mwa-shell *::after { box-sizing: border-box; }
.mwa-shell-inner { width: 100%; max-width: 1080px; margin: 0 auto; }
.mwa-shell--narrow .mwa-shell-inner { max-width: 520px; }
.mwa-page-heading { padding-bottom: 19px; margin-bottom: 22px; border-bottom: 1px solid var(--mwa-line); }
.mwa-kicker { display: block; margin-bottom: 6px; color: var(--mwa-accent); font-size: 11px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
.mwa-page-heading h1 { margin: 0; color: #252525; font-size: clamp(25px, 4vw, 32px); font-weight: 600; line-height: 1.2; overflow-wrap: anywhere; }
.mwa-page-heading p { margin: 7px 0 0; color: #666; font-size: 13px; }
.mwa-content { display: grid; gap: 20px; }
.mwa-panel { min-width: 0; overflow: hidden; background: var(--mwa-surface); border: 1px solid var(--mwa-line); border-radius: 4px; box-shadow: 0 2px 6px rgba(0,0,0,.025); }
.mwa-panel-heading { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 9px; padding: 12px 18px; background: #f2f2f2; border-bottom: 1px solid var(--mwa-line); }
.mwa-panel-heading h2, .mwa-panel-heading h3 { margin: 0; color: #333; font-size: 15px; font-weight: 600; line-height: 1.45; }
.mwa-panel-body { padding: 21px; }
.mwa-panel-body > :first-child { margin-top: 0; }
.mwa-panel-body > :last-child { margin-bottom: 0; }
.mwa-panel p { line-height: 1.65; }
.mwa-panel h2, .mwa-panel h3 { color: #333; }
.mwa-muted, .mwa-shell .mwa-subtle { color: var(--mwa-muted); }
.mwa-small { font-size: 12px; }
.mwa-uppercase { font-size: 11px; font-weight: 600; letter-spacing: .09em; text-transform: uppercase; }
.mwa-stack { display: grid; gap: 16px; }
.mwa-stack--sm { gap: 10px; }
.mwa-row { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }
.mwa-row--between { justify-content: space-between; }
.mwa-columns { display: grid; grid-template-columns: minmax(0, 1.65fr) minmax(270px, 1fr); gap: 20px; align-items: start; }
.mwa-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
.mwa-shell a { color: var(--mwa-link); text-decoration: none; }
.mwa-shell a:hover { text-decoration: underline; }
.mwa-shell :is(button, .mwa-btn) { display: inline-flex; align-items: center; justify-content: center; gap: 7px; min-height: 37px; padding: 8px 14px; border: 1px solid #ccc; border-radius: 3px; background: linear-gradient(#fff, #f3f3f3); color: #333; font: inherit; font-weight: 600; line-height: 1.2; cursor: pointer; text-align: center; text-decoration: none; transition: background-color .12s, border-color .12s; }
.mwa-shell :is(button, .mwa-btn):hover { background: #ebebeb; border-color: #b7b7b7; text-decoration: none; }
.mwa-shell :is(.btn-primary, .mwa-btn--primary) { background: var(--mwa-accent); border-color: #b41419; color: #fff; }
.mwa-shell :is(.btn-primary, .mwa-btn--primary):hover { background: #ad1419; border-color: #991015; color: #fff; }
.mwa-shell .mwa-btn--danger { border-color: #e1c4c4; background: #fff; color: #a32126; }
.mwa-shell .mwa-btn--danger:hover { border-color: #cf9f9f; background: #fff3f3; }
.mwa-shell :is(input:not([type=hidden]), select, textarea) { min-width: 0; width: 100%; min-height: 41px; padding: 10px 12px; border: 1px solid #ccc; border-radius: 3px; background: #fff; color: #333; font: inherit; }
.mwa-shell :is(input:not([type=hidden]), select, textarea)::placeholder { color: #999; }
.mwa-shell :is(input, button, a, textarea, select):focus-visible { outline: 3px solid rgba(22,122,198,.23); outline-offset: 2px; }
.mwa-field { display: grid; gap: 6px; }
.mwa-field label { font-size: 12px; font-weight: 600; color: #555; }
.mwa-form { display: grid; gap: 15px; }
.mwa-form-actions { margin-top: 5px; display: flex; gap: 10px; flex-wrap: wrap; }
.mwa-notice { margin: 0; padding: 11px 14px; border: 1px solid #d9d9d9; border-left: 3px solid var(--mwa-link); border-radius: 3px; background: #f8fbfe; font-size: 13px; }
.mwa-notice--error { border-color: #e5cdcd; border-left-color: #b42828; background: #fff5f5; color: #8e2727; }
.mwa-notice--success { border-color: #cddfc9; border-left-color: #659d32; background: #f5fbf1; color: #3d6b20; }
.mwa-empty { padding: 33px 18px; text-align: center; background: #fbfbfb; border: 1px dashed #ddd; border-radius: 3px; }
.mwa-empty h3 { margin: 0 0 6px; font-size: 16px; font-weight: 600; }
.mwa-empty p { margin: 0; color: #777; font-size: 13px; }
.mwa-list { padding: 0; margin: 0; list-style: none; }
.mwa-list > li + li { border-top: 1px solid #eee; }
.mwa-list-item { display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 14px 0; }
.mwa-list-item:first-child { padding-top: 0; }
.mwa-list-item:last-child { padding-bottom: 0; }
.mwa-list-title { display: block; font-weight: 600; overflow-wrap: anywhere; }
.mwa-list-meta { margin-top: 3px; color: #888; font-size: 12px; overflow-wrap: anywhere; }
.mwa-tile { display: block; height: 100%; padding: 19px; background: #fff; border: 1px solid var(--mwa-line); border-radius: 4px; color: #333 !important; transition: border-color .12s, box-shadow .12s; }
.mwa-tile:hover { text-decoration: none !important; border-color: #b6b6b6; box-shadow: 0 4px 10px rgba(0,0,0,.055); }
.mwa-tile-title { display: block; font-size: 15px; font-weight: 600; }
.mwa-tile-kicker { display: block; margin-bottom: 9px; color: var(--mwa-accent); font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .07em; }
.mwa-tile-description { display: block; margin-top: 5px; color: #777; font-size: 12px; }
.mwa-tile-footer { display: block; margin-top: 16px; padding-top: 10px; border-top: 1px solid #eee; color: var(--mwa-link); font-size: 12px; font-weight: 600; }
.mwa-stat { padding: 16px; background: #fafafa; border: 1px solid #e3e3e3; border-radius: 3px; }
.mwa-stat strong { display: block; margin-top: 6px; font-size: 25px; font-weight: 600; line-height: 1.2; font-variant-numeric: tabular-nums; overflow-wrap: anywhere; }
.mwa-tabbar { display: flex; flex-wrap: wrap; gap: 0; border-bottom: 1px solid #ccc; }
.mwa-tabbar a { padding: 10px 18px; color: #666; border-bottom: 3px solid transparent; font-size: 13px; font-weight: 600; }
.mwa-tabbar a:hover { color: var(--mwa-link); text-decoration: none; background: #fafafa; }
.mwa-tabbar a.is-active { color: var(--mwa-accent); border-bottom-color: var(--mwa-accent); }
.mwa-table-wrap { width: 100%; overflow-x: auto; }
.mwa-table { width: 100%; border-collapse: collapse; text-align: left; }
.mwa-table th { background: #f7f7f7; color: #666; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; }
.mwa-table td, .mwa-table th { padding: 11px 12px; border-bottom: 1px solid #eee; }
.mwa-table tbody tr:last-child td { border-bottom: 0; }
.mwa-badge { display: inline-block; border: 1px solid #dcdcdc; border-radius: 3px; padding: 2px 8px; color: #777; background: #f8f8f8; font-size: 11px; font-weight: 600; }
.mwa-divider { height: 1px; border: 0; background: #eee; margin: 16px 0; }
.mwa-footer { padding: 21px 0 0; margin-top: 28px; border-top: 1px solid #e6e6e6; color: #999; font-size: 11px; text-align: center; }
@media (max-width: 760px) {
    .mwa-shell { padding: 24px 14px 44px; }
    .mwa-columns { grid-template-columns: 1fr; }
    .mwa-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .mwa-panel-body { padding: 17px; }
}
@media (max-width: 510px) {
    .mwa-grid { grid-template-columns: 1fr; }
    .mwa-list-item { align-items: flex-start; flex-direction: column; }
    .mwa-list-item > :last-child { align-self: flex-start; }
}
@media (prefers-reduced-motion: reduce) {
    .mwa-shell :is(button, .mwa-btn, .mwa-tile) { transition: none; }
}
`;

export default function PageShell({
    title,
    subtitle,
    eyebrow = 'MWA / Event portal',
    narrow = false,
    children,
}: PageShellProps) {
    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: styles }} />
            <main class={`mwa-shell${narrow ? ' mwa-shell--narrow' : ''}`}>
                <div class="mwa-shell-inner">
                    <header class="mwa-page-heading">
                        <span class="mwa-kicker">{eyebrow}</span>
                        <h1>{title}</h1>
                        {subtitle && <p>{subtitle}</p>}
                    </header>
                    <div class="mwa-content">{children}</div>
                    <footer class="mwa-footer">MWA &middot; Event portal</footer>
                </div>
            </main>
        </>
    );
}
