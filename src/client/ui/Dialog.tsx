import { ReactNode } from 'preact/compat';
import { useContext, useEffect, useRef } from 'preact/hooks';
import { ClientContext } from '#src/client/context.js';

export type DialogProps = {
    isOpen: boolean;
    onClose?: () => void;
    title?: string;
    class?: string;
    // extra buttons injected into the footer, before the Close button
    actions?: ReactNode;
    // when false: no Close button, and Esc / backdrop clicks can't dismiss —
    // the caller's actions decide how the user gets out
    closable?: boolean;
    children: ReactNode;
};

// Oat styles plain <dialog> and pads its header / div / footer children, so the
// markup below is all the layout this needs.
export default function Dialog({
    isOpen,
    onClose,
    title,
    class: className,
    actions,
    closable = true,
    children,
}: DialogProps) {
    const { t } = useContext(ClientContext);
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (isOpen && !dialog.open) dialog.showModal();
        if (!isOpen && dialog.open) dialog.close();
    }, [isOpen]);

    // Clicks on the dimmed backdrop land on the <dialog> element itself, with
    // coordinates outside its box — outside means close.
    const handleBackdropClick = (e: MouseEvent) => {
        if (!closable) return;
        const box = dialogRef.current?.getBoundingClientRect();
        if (
            box &&
            (e.clientX < box.left ||
                e.clientX > box.right ||
                e.clientY < box.top ||
                e.clientY > box.bottom)
        ) {
            dialogRef.current?.close();
        }
    };

    return (
        <dialog
            ref={dialogRef}
            class={className}
            onClose={onClose}
            onCancel={closable ? undefined : (e) => e.preventDefault()}
            onClick={handleBackdropClick}
        >
            {title && (
                <header>
                    <h2>{title}</h2>
                </header>
            )}
            {children}
            {actions !== undefined && (
                <footer>
                    {actions}
                    {closable && onClose && (
                        <button type="button" class="mwa-button" onClick={onClose}>
                            {t('dialogClose')}
                        </button>
                    )}
                </footer>
            )}
        </dialog>
    );
}
