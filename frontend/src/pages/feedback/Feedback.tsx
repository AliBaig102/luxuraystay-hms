import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui";
import { FeedbackSheet } from "@/components/sheets";
import { PlusIcon } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { ENDPOINT_URLS } from "@/constants/endpoints";
import type { Feedback } from "@/types/models";
import { DataTable } from "@/components/custom/DataTable";
import { createFeedbackColumns } from "./columns";
import { useAuth } from "@/hooks/useAuth";
import { hasPermission } from "@/lib/permissions";
import { FEEDBACK_CATEGORIES } from "@/types/models";

const filters = [
  {
    id: "category",
    label: "Category",
    options: [
      { value: FEEDBACK_CATEGORIES.ROOM_QUALITY, label: "Room Quality" },
      { value: FEEDBACK_CATEGORIES.SERVICE, label: "Service" },
      { value: FEEDBACK_CATEGORIES.CLEANLINESS, label: "Cleanliness" },
      { value: FEEDBACK_CATEGORIES.FOOD, label: "Food" },
      { value: FEEDBACK_CATEGORIES.STAFF, label: "Staff" },
      { value: FEEDBACK_CATEGORIES.FACILITIES, label: "Facilities" },
      { value: FEEDBACK_CATEGORIES.VALUE, label: "Value" },
      { value: FEEDBACK_CATEGORIES.OVERALL, label: "Overall" },
    ],
  },
  {
    id: "rating",
    label: "Rating",
    options: [
      { value: "5", label: "5 Stars" },
      { value: "4", label: "4 Stars" },
      { value: "3", label: "3 Stars" },
      { value: "2", label: "2 Stars" },
      { value: "1", label: "1 Star" },
    ],
  },
  {
    id: "hasResponse",
    label: "Response Status",
    options: [
      { value: "true", label: "Responded" },
      { value: "false", label: "Pending" },
    ],
  },
];

export function Feedback() {
  const { data, isLoading } = useApi<{feedback: Feedback[]}>(ENDPOINT_URLS.FEEDBACK.ALL);
  const { user: currentUser } = useAuth();
  const feedbackColumns = createFeedbackColumns(currentUser?.role);
  
  return (
    <div>
      <PageHeader
        title="Feedback"
        description="Manage and respond to guest feedback and reviews"
      >
        {currentUser && hasPermission(currentUser.role, "feedback.create") && (
          <FeedbackSheet>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Create New Feedback
            </Button>
          </FeedbackSheet>
        )}
      </PageHeader>
      <DataTable
        columns={feedbackColumns}
        data={data?.feedback || []}
        filters={filters}
        loading={isLoading}
        exportFileName="feedback"
      />
    </div>
  );
}
