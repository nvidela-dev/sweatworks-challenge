import { FocusTrap } from 'focus-trap-react';
import type { ReactNode } from 'react';
import { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <FocusTrap
      focusTrapOptions={{
        escapeDeactivates: false,
        allowOutsideClick: true,
      }}
    >
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        onClick={onClose}
      >
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events */}
        <div
          className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 id="modal-title" className="text-lg font-semibold text-gray-900">
              {title}
            </h2>
            <button
              type="button"
              className="text-2xl text-gray-400 hover:text-gray-600 leading-none"
              onClick={onClose}
              aria-label="Close"
            >
              ×
            </button>
          </div>
          <div className="p-6">{children}</div>
        </div>
      </div>
    </FocusTrap>
  );
}
