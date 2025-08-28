import type { UseFormSetError } from "react-hook-form";
import { toast } from "react-toastify";

type ApiError = {
  field: any;
  message: string;
};

export const handleApiError = (
  error: any,
  setError: UseFormSetError<any>,
  toastError: (message: string) => void = toast.error
) => {
  if (error?.response?.data?.errors?.length > 0) {
    error?.response?.data?.errors.forEach((item: ApiError) => {
      setError(item.field, {
        type: "manual",
        message: item.message,
      });
    });
  } else {
    toastError(error?.response?.data?.message || "An error occurred");
  }
};
