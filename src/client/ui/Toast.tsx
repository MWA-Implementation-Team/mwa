import { ComponentChildren } from 'preact';
import { createPortal } from 'preact/compat';
import { useEffect, useRef, useState } from 'preact/hooks';

export type ToastKind = 'info' | 'success' | 'error';

type ToastItem = {
    id: number;
    kind: ToastKind;
    content: ComponentChildren;
    // the <dialog> that contained the message at push time, if any
    dialog: HTMLDialogElement | null;
    // frozen on first render: was that dialog open then — docks inside it
    inModal?: boolean;
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

function currentOpenDialog(): HTMLDialogElement | null {
    if (typeof document === 'undefined') return null;
    return [...document.querySelectorAll<HTMLDialogElement>('dialog[open]')].pop() ?? null;
}

// Push a toast onto the stack. The returned close() withdraws it early — used
// by Toast when the condition that produced the message clears first.
export function toast(
    content: ComponentChildren,
    kind: ToastKind = 'info',
    opts: { ms?: number; dialog?: HTMLDialogElement | null } = {},
) {
    const { ms = LINGER_MS } = opts;
    const id = ++nextId;
    items = [
        ...items,
        {
            id,
            kind,
            content,
            dialog: 'dialog' in opts ? (opts.dialog ?? null) : currentOpenDialog(),
            closing: false,
        },
    ];
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
    const ref = useRef<HTMLDivElement>(null);
    const [pushed, setPushed] = useState(false);
    useEffect(() => {
        // remember the containing dialog — Toasts decides whether it was
        // actually open once mount effects have all run
        const dialog = ref.current?.closest('dialog') ?? null;
        const handle = toast(children, kind, { dialog });
        setPushed(true);
        return () => handle.close();
    }, []);
    if (pushed) return null;
    const kindClass = kind === 'info' ? '' : ` mwa-toast--${kind}`;
    return (
        <div ref={ref} class={`mwa-toast${kindClass}`} role={kind === 'error' ? 'alert' : 'status'}>
            {children}
        </div>
    );
}

// Rendered once by ClientContextWrapper. While a modal <dialog> is open the
// rest of the document is inert — even top-layer elements can't be clicked —
// so toasts pushed from inside a dialog render portaled into it (fixed inside
// it, above the backdrop). Page-level toasts always stay on the page stack:
// opening a dialog doesn't drag them in, they just dim behind the backdrop
// like the rest of the page. The page stack mounts outside .mwa so position:
// fixed isn't trapped by its filter.
export function Toasts() {
    const [, bump] = useState(0);

    useEffect(() => {
        const listener = () => bump((n) => n + 1);
        listeners.add(listener);
        // page toasts may have pushed before this effect ran — re-render to
        // pick up whatever the store already holds
        listener();
        return () => listeners.delete(listener);
    }, []);

    // a dialog opening or closing changes where modal-born toasts dock
    useEffect(() => {
        const observer = new MutationObserver(() => bump((n) => n + 1));
        observer.observe(document.body, {
            attributes: true,
            subtree: true,
            attributeFilter: ['open'],
        });
        return () => observer.disconnect();
    }, []);

    // Split by where each toast was born. inModal freezes on first render —
    // by then every mount effect (a dialog's showModal included) has run, so
    // `open` reflects the settled state regardless of effect ordering. A
    // modal-born toast whose dialog closes drops back to the page stack and
    // redocks if it reopens; page toasts never relocate.
    const buckets = new Map<HTMLDialogElement, ToastItem[]>();
    const pageItems: ToastItem[] = [];
    for (const item of items) {
        item.inModal ??= item.dialog?.hasAttribute('open') ?? false;
        if (item.inModal && item.dialog?.hasAttribute('open')) {
            const bucket = buckets.get(item.dialog) ?? [];
            buckets.set(item.dialog, [...bucket, item]);
        } else {
            pageItems.push(item);
        }
    }

    return (
        <>
            <div class="mwa-toasts">{pageItems.map(toastEl)}</div>
            {[...buckets].map(([dialog, list], i) =>
                createPortal(
                    <div key={i} class="mwa-toasts mwa-toasts--in-dialog">
                        {list.map(toastEl)}
                    </div>,
                    dialog,
                ),
            )}
        </>
    );
}

// built outside the class= attribute — the css-usage check reads bare string
// literals in there as class names
function toastEl(item: ToastItem) {
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
}
