import { useForm } from "react-hook-form";
import { X } from "lucide-react";

import { createCompany } from "../../api/company.api";
import Modal from "../common/Modal";
import { Input } from "../common/Input";
import { Button } from "../common/Button";

interface AddCompanyModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface CompanyFormData {
  name: string;
  location: string;
  city: string;
  foundedOn: string;
  description: string;
  logo: string;
}

const AddCompanyModal = ({
  open,
  onClose,
  onSuccess,
}: AddCompanyModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CompanyFormData>({
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  if (!open) return null;

  const onSubmit = async (data: CompanyFormData) => {
    try {
      await createCompany(data);

      reset();

      onClose();

      onSuccess();
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <Modal isOpen={open} onClose={onClose} className="max-w-xl">
      <div className="relative overflow-hidden rounded-2xl bg-white px-8 py-10">
        {/* Decorative circles */}

        <div className="absolute -left-8 z-20 -top-8 h-28 w-28 rounded-full bg-gradient-to-br from-fuchsia-500 to-indigo-700"></div>

        <div className="absolute left-10 -top-8 z-10 h-24 w-24 rounded-full bg-violet-200"></div>

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute cursor-pointer right-6 top-6 text-gray-700 hover:text-black"
        >
          <X size={24} />
        </button>

        {/* Heading */}
        <h2 className="mb-10 text-center text-4xl font-semibold">
          Add Company
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Company Name"
            placeholder="Enter..."
            error={errors.name?.message}
            {...register("name", {
              required: "Company name is required",
            })}
          />

          <Input
            label="Location"
            placeholder="Select Location"
            error={errors.location?.message}
            {...register("location", {
              required: "Location is required",
            })}
          />

          <div className="grid grid-cols-2 gap-5">
            <Input
              label="City"
              placeholder="Enter city"
              error={errors.city?.message}
              {...register("city", {
                required: "City is required",
              })}
            />

            <Input
              type="date"
              label="Founded On"
              error={errors.foundedOn?.message}
              {...register("foundedOn", {
                required: "Founded date is required",
              })}
            />
          </div>

          <Input
            label="Logo URL"
            placeholder="https://logo.clearbit.com/company.com"
            error={errors.logo?.message}
            {...register("logo")}
          />

          <div>
            <label className="mb-2 block text-sm font-medium text-text-secondary">
              Description
            </label>

            <textarea
              rows={4}
              placeholder="Write a short description..."
              {...register("description")}
              className="resize-none py-3 
                w-full border
                border-border-subtle
                px-3
                rounded-lg
                text-sm outline-none
                font-medium
                placeholder:font-medium
                placeholder:text-sm
                focus:border-gray-700 focus:border-2
                transition-colors"
            />

            <p className="mt-1 text-sm text-red-500">
              {errors.description?.message}
            </p>
          </div>

          <div className="flex justify-center pt-2">
            <Button type="submit" loading={isSubmitting} className="min-w-40">
              Save
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default AddCompanyModal;
