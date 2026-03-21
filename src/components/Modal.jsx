import React from 'react';

const Modal = ({ isOpen, onClose, title, children, actions }) => {
  if (!isOpen) return null;

  console.log('Modal is rendering with isOpen:', isOpen);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-end sm:items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-xl max-w-md w-full mx-0 sm:mx-4">
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 pr-4">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              ✕
            </button>
          </div>
          
          <div className="text-gray-900 mb-6">{children}</div>
          
          {actions && (
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;