import { X } from "lucide-react";

import Modal from "./Modal";
import { Button } from "./Button";

interface Props {
  open: boolean;
  onClose: () => void;
}

const AuthNoticeModal = ({ open, onClose }: Props) => {
  return (
    <Modal isOpen={open} onClose={onClose} className="max-w-lg">
      <div className="relative overflow-hidden rounded-2xl bg-white px-8 py-8">
        <div className="absolute -left-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br from-fuchsia-500 to-indigo-700" />

        <div className="absolute left-14 -top-8 h-24 w-24 rounded-full bg-violet-200" />

        {/* Close model */}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 cursor-pointer"
        >
          <X size={22} />
        </button>

        <h2 className="mb-6 text-center text-3xl font-semibold">
          Authentication
        </h2>

        <p className="leading-8 text-text-secondary">
          Login and Signup have not been implemented in this project because the
          current requirements do not include any user-specific features such as
          protected routes, personalized data, or user accounts. The focus was
          kept on the core company review functionality. Authentication can be
          added easily if the project requirements are expanded.
        </p>

        <div className="mt-8 flex justify-center">
          <Button onClick={onClose}>Got it</Button>
        </div>
      </div>
    </Modal>
  );
};

export default AuthNoticeModal;
