const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-100 text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">{title}</h2>
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="flex justify-center space-x-4">
            <button
              className="bg-red-500 text-white px-5 py-2 rounded-lg shadow-md transition hover:bg-red-600"
              onClick={onConfirm}
            >
              Yes
            </button>
            <button
              className="bg-gray-500 text-white px-5 py-2 rounded-lg shadow-md transition hover:bg-gray-600"
              onClick={onClose}
            >
              No
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  export default ConfirmModal;
  