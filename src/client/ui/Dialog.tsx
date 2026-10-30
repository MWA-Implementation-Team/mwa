import { ReactNode } from 'preact/compat';
import { useEffect, useRef } from 'preact/hooks';

export type DialogProps = {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
};

// Oat styles plain <dialog> and pads its header / div / footer children, so the
// markup below is all the layout this needs.
export default function Dialog({ isOpen, onClose, title, children }: DialogProps) {
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
        <dialog ref={dialogRef} onClose={onClose} onClick={handleBackdropClick}>
            {title && (
                <header>
                    <h2>{title}</h2>
                </header>
            )}
            {children}
        </dialog>
    );
}
