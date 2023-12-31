import React, { useEffect, useRef } from "react";

type Props = {
  onClose?: () => void;
  open: boolean;
  title?: string;
  children: React.ReactNode;
  closeByModal?: boolean;
  modal?: boolean;
};

export default function Dialog(props: Props) {
  const domId = useRef<string>(`my_modal_${Math.round(Math.random() * 1e5)}`);

  useEffect(() => {
    const openModal = () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
      (document.getElementById(domId.current) as any)?.showModal();
    };

    if (props.open) {
      openModal();
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
      (document.getElementById(domId.current) as any)?.close();
    }
  }, [props]);

  return (
    <>
      <dialog id={domId.current} className="modal">
        <div className="modal-box">
          {!props.closeByModal && !props.modal && (
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button
                className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                onClick={() => props.onClose && props.onClose()}
              >
                ✕
              </button>
            </form>
          )}
          {props.title && (
            <h5 className="font-semibold text-lg -mt-2 mb-2 text-text1">
              {props.title}
            </h5>
          )}
          {props.children}
        </div>

        {props.closeByModal && !props.modal && (
          <form
            method="dialog"
            className="modal-backdrop"
            onClick={() => props.onClose && props.onClose()}
          >
            <button>✕</button>
          </form>
        )}
      </dialog>
    </>
  );
}
