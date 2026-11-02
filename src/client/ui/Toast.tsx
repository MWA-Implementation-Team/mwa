import { ComponentChildren } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';

export type ToastKind = 'info' | 'success' | 'error';

type ToastItem = {
    id: number;
    kind: ToastKind;
    content: ComponentChildren;
    closing: boolean;
};

const LINGER_MS = 4000;
const EXIT_MS = 200;

// Toast lifetimes run entirely on the client — toasts come from effects and
// event handlers, so the store stays empty during SSR.
let nextId = 0;
let items: ToastItem[] = [];
const timers = new Map<number, ReturnType<typeof setTimeout>>();
const listeners = new Set<() => void>();

function emit() {
    for (const listener of listeners) listener();
}

function dismiss(id: number) {
    if (!items.some((item) => item.id === id)) return;
    const timer = timers.get(id);
    if (timer !== undefined) clearTimeout(timer);
    timers.delete(id);
    items = items.map((item) => (item.id === id ? { ...item, closing: true } : item));
    emit();
    setTimeout(() => {
        items = items.filter((item) => item.id !== id);
        emit();
    }, EXIT_MS);
}

// Push a toast onto the stack. The returned close() withdraws it early — used
// by Toast when the condition that produced the message clears first.
export function toast(content: ComponentChildren, kind: ToastKind = 'info', ms = LINGER_MS) {
    const id = ++nextId;
    items = [...items, { id, kind, content, closing: false }];
    emit();
    timers.set(
        id,
        setTimeout(() => dismiss(id), ms),
    );
    return { close: () => dismiss(id) };
}

// Drop-in for the old inline .mwa-note banners. Renders the message inline so
// it stays in the SSR HTML (and remains visible with JS off), then on mount
// hands it to the toast stack — the real toast takes over and this goes away.
// If the banner unmounts before the timeout, the toast is withdrawn early
// (e.g. the session page's "disconnected" clears on reconnect).
export function Toast({
    kind = 'info',
    children,
}: {
    kind?: ToastKind;
    children: ComponentChildren;
}) {
    const [pushed, setPushed] = useState(false);
    useEffect(() => {
        const handle = toast(children, kind);
        setPushed(true);
        return () => handle.close();
    }, []);
    if (pushed) return null;
    const kindClass = kind === 'info' ? '' : ` mwa-toast--${kind}`;
    return (
        <div class={`mwa-toast${kindClass}`} role={kind === 'error' ? 'alert' : 'status'}>
            {children}
        </div>
    );
}

// Rendered once by ClientContextWrapper. The container is a manual popover:
// top-layer placement keeps toasts visible above modal <dialog>s, and it
// mounts outside .mwa so position: fixed isn't trapped by its filter.
export function Toasts() {
    const ref = useRef<HTMLDivElement>(null);
    const [, bump] = useState(0);

    useEffect(() => {
        const listener = () => bump((n) => n + 1);
        listeners.add(listener);
        // page toasts may have pushed before this effect ran — re-render to
        // pick up whatever the store already holds
        listener();
        return () => listeners.delete(listener);
    }, []);

    useEffect(() => {
        const el = ref.current;
        if (!el || typeof el.showPopover !== 'function') return;
        const isOpen = el.matches(':popover-open');
        if (items.length === 0) {
            if (isOpen) el.hidePopover();
            return;
        }
        if (!isOpen) {
            el.showPopover();
        } else if (document.querySelector('dialog[open]')) {
            // A modal dialog that opened after the popover sits higher in the
            // top layer — re-show to leapfrog it.
            el.hidePopover();
            el.showPopover();
        }
    });

    return (
        <div ref={ref} class="mwa-toasts" popover="manual">
            {items.map((item) => {
                // built outside the class= attribute — the css-usage check
                // reads bare string literals in there as class names
                const kind = item.kind === 'info' ? '' : ` mwa-toast--${item.kind}`;
                const closing = item.closing ? ' mwa-toast--closing' : '';
                return (
                    <div
                        key={item.id}
                        class={`mwa-toast${kind}${closing}`}
                        role={item.kind === 'error' ? 'alert' : 'status'}
                        onClick={() => dismiss(item.id)}
                    >
                        {item.content}
                    </div>
                );
            })}
        </div>
    );
}
