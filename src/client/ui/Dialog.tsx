import { ReactNode } from 'preact/compat';
import { useContext, useEffect, useRef } from 'preact/hooks';
import { ClientContext } from '#src/client/context.js';

export type DialogProps = {
    isOpen: boolean;
    onClose?: () => void;
    title?: string;
    class?: string;
    // extra buttons injected into the footer, between Close and submit
    actions?: ReactNode;
    // primary action — a submit button wired to the form by id (form=), so
    // the footer can live outside the <form>
    submit?: { form: string; label: string };
    // when false: no Close button, and Esc / backdrop clicks can't dismiss —
    // the caller's actions decide how the user gets out
    closable?: boolean;
    children: ReactNode;
};

// Oat styles plain <dialog> and pads its header / div / footer children. The
// body wrapper is the scroll region — Oat caps the box at 85vh but leaves
// scrolling to a direct div/section child, so bare h3/ul/form children would
// overflow the cap instead of scrolling.
export default function Dialog({
    isOpen,
    onClose,
    title,
    class: className,
    actions,
    submit,
    closable = true,
    children,
}: DialogProps) {
    const { t } = useContext(ClientContext);
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (isOpen && !dialog.open) {
            dialog.showModal();
            // showModal() focuses the first field with the caret at 0 —
            // prefilled values read better with the caret at the end.
            const el = dialog.ownerDocument.activeElement;
            if (
                (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) &&
                el.selectionStart === 0
            ) {
                el.setSelectionRange(el.value.length, el.value.length);
            }
        }
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
            <div class="mwa-dialog-body">{children}</div>
            {(actions !== undefined || submit !== undefined) && (
                <footer>
                    {closable && onClose && (
                        <button type="button" class="mwa-button" onClick={onClose}>
                            {t('dialogClose')}
                        </button>
                    )}
                    {actions}
                    {submit && (
                        <button type="submit" class="mwa-button" form={submit.form}>
                            {submit.label}
                        </button>
                    )}
                </footer>
            )}
        </dialog>
    );
}
