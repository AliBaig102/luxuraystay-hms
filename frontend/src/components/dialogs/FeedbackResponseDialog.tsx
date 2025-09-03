import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Textarea,
} from "@/components/ui";
import { LoadingButton } from "../custom/LoadingButton";
import { useApi } from "@/hooks/useApi";
import { ENDPOINT_URLS } from "@/constants/endpoints";
import { feedbackResponseSchema, type FeedbackResponseFormData } from "@/lib/zodValidation";
import { Reply, MessageSquare } from "lucide-react";
import { handleApiError } from "@/lib";
import { useAuth } from "@/hooks/useAuth";

interface FeedbackResponseDialogProps {
  feedbackId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  children?: React.ReactNode;
}

export function FeedbackResponseDialog({
  feedbackId,
  open,
  onOpenChange,
  onClose,
  children,
}: FeedbackResponseDialogProps) {
  const { user } = useAuth();
  const { post, isMutating, invalidate } = useApi(
    ENDPOINT_URLS.FEEDBACK.RESPOND(feedbackId),
    {
      immediate: false,
    }
  );

  const form = useForm<FeedbackResponseFormData>({
    resolver: zodResolver(feedbackResponseSchema) as Resolver<FeedbackResponseFormData>,
    defaultValues: {
      feedbackId: feedbackId,
      response: "",
      responseBy: user?._id || "",
    },
  });

  const handleSubmit = async (data: FeedbackResponseFormData) => {
    try {
      await post(data);
      await invalidate();
      onClose();
      form.reset({
        feedbackId: feedbackId,
        response: "",
        responseBy: user?._id || "",
      });
    } catch (error) {
      handleApiError(error, form.setError);
      console.error("Error adding response:", error);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
    if (!newOpen) {
      form.reset({
        feedbackId: feedbackId,
        response: "",
        responseBy: user?._id || "",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
              <Reply className="h-4 w-4 text-blue-600" />
            </div>
            Add Response to Feedback
          </DialogTitle>
          <DialogDescription>
            Respond to the guest feedback. Your response will be visible to the guest
            and help improve their experience.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="response"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Response</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter your response to the feedback..."
                      className="min-h-[120px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <LoadingButton
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isMutating}
              >
                Cancel
              </LoadingButton>
              <LoadingButton
                type="submit"
                isLoading={isMutating}
                disabled={isMutating}
              >
                <Reply className="h-4 w-4 mr-2" />
                Add Response
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
