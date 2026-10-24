import { ReactNode } from "preact/compat";
import { useEffect, useRef } from "preact/hooks";

export type DialogProps = {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
};

export default function Dialog({ isOpen, onClose, children }: DialogProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (isOpen && !dialog.open) dialog.showModal();
        if (!isOpen && dialog.open) dialog.close();
    }, [isOpen]);

    return (
        <dialog ref={dialogRef} onClose={onClose}>
            <form method="dialog">
                <button type="submit">X</button>
            </form>
            {children}
        </dialog>
    );
}
