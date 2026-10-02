import { useEffect, useRef } from "react";

function ConfirmationDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}) {
  const dialogRef = useRef(null);
  const confirmButtonRef = useRef(null);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;

    confirmButtonRef.current?.focus();
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus?.();
    };
  }, [open]);

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onCancel();
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    const focusable = dialogRef.current?.querySelectorAll(
      "button:not([disabled])",
    );
    const first = focusable?.[0];
    const last = focusable?.[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  };

  if (!open) {
    return null;
  }

  return (
    <div
      className="confirmation-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onCancel();
        }
      }}
    >
      <section
        className="confirmation-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirmation-dialog-title"
        aria-describedby="confirmation-dialog-description"
        ref={dialogRef}
        onKeyDown={handleKeyDown}
      >
        <div className="confirmation-dialog-icon" aria-hidden="true">
          !
        </div>

        <div className="confirmation-dialog-copy">
          <h2 id="confirmation-dialog-title">{title}</h2>
          <p id="confirmation-dialog-description">{description}</p>
        </div>

        <div className="confirmation-dialog-actions">
          <button
            type="button"
            className="confirmation-dialog-cancel"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className="confirmation-dialog-confirm"
            onClick={onConfirm}
            ref={confirmButtonRef}
          >
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}

export default ConfirmationDialog;
