import { format } from "date-fns";
import type { ColumnDef } from "@tanstack/react-table";
import type { Feedback, UserRole } from "@/types/models";
import { Button, Badge } from "@/components/ui";
import { Edit, Trash2, Star, Reply } from "lucide-react";
import { FeedbackSheet } from "@/components/sheets";
import { hasPermission } from "@/lib/permissions";
import { FEEDBACK_CATEGORIES } from "@/types/models";
import { ConfirmFeedbackDeleteDialog } from "@/components/dialogs";
import { cn } from "@/lib/utils";

// Star Rating Component
const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, i) => i + 1).map((star) => (
        <Star
          key={star}
          className={cn(
            "h-4 w-4",
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300"
          )}
        />
      ))}
      <span className="ml-1 text-sm font-medium">{rating}/5</span>
    </div>
  );
};

// Category colors
const categoryColors: Record<string, string> = {
  [FEEDBACK_CATEGORIES.ROOM_QUALITY]: "bg-blue-100 text-blue-800",
  [FEEDBACK_CATEGORIES.SERVICE]: "bg-green-100 text-green-800",
  [FEEDBACK_CATEGORIES.CLEANLINESS]: "bg-purple-100 text-purple-800",
  [FEEDBACK_CATEGORIES.FOOD]: "bg-orange-100 text-orange-800",
  [FEEDBACK_CATEGORIES.STAFF]: "bg-pink-100 text-pink-800",
  [FEEDBACK_CATEGORIES.FACILITIES]: "bg-indigo-100 text-indigo-800",
  [FEEDBACK_CATEGORIES.VALUE]: "bg-yellow-100 text-yellow-800",
  [FEEDBACK_CATEGORIES.OVERALL]: "bg-gray-100 text-gray-800",
};

// Rating colors
const ratingColors: Record<number, string> = {
  1: "bg-red-100 text-red-800",
  2: "bg-orange-100 text-orange-800",
  3: "bg-yellow-100 text-yellow-800",
  4: "bg-blue-100 text-blue-800",
  5: "bg-green-100 text-green-800",
};

export const createFeedbackColumns = (
  currentUserRole?: UserRole
): ColumnDef<Feedback>[] => {
  return [
    {
      accessorKey: "createdAt",
      header: "Date",
      enableSorting: true,
      sortingFn: "datetime",
      filterFn: "dateRange",
      cell: ({ row }) => format(new Date(row.original.createdAt), "MM/dd/yyyy"),
    },
    {
      accessorKey: "rating",
      header: "Rating",
      enableSorting: true,
      sortingFn: "number",
      cell: ({ row }) => {
        const rating = row.getValue("rating") as number;
        return (
          <div className="flex items-center gap-2">
            <StarRating rating={rating} />
            <Badge variant="secondary" className={ratingColors[rating]}>
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent"}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "category",
      header: "Category",
      enableSorting: true,
      sortingFn: "text",
      cell: ({ row }) => {
        const category = row.getValue("category") as string;
        return (
          <Badge variant="secondary" className={categoryColors[category]}>
            {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </Badge>
        );
      },
    },
    {
      accessorKey: "comment",
      header: "Comment",
      enableSorting: true,
      sortingFn: "text",
      cell: ({ row }) => {
        const comment = row.getValue("comment") as string;
        return (
          <div className="max-w-[300px]">
            {comment ? (
              <p className="text-sm text-muted-foreground truncate">
                {comment}
              </p>
            ) : (
              <span className="text-sm text-muted-foreground italic">
                No comment
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "guestId",
      header: "Guest",
      enableSorting: true,
      sortingFn: "text",
      cell: ({ row }) => {
        const feedback = row.original;
        const isAnonymous = feedback.isAnonymous;
        
        if (isAnonymous) {
          return (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Anonymous</span>
              <Badge variant="outline" className="text-xs">
                Anonymous
              </Badge>
            </div>
          );
        }

        // If guestId is populated, show guest info
        const guest = feedback.guestId as any;
        if (typeof guest === 'object' && guest?.firstName) {
          return (
            <div className="flex flex-col">
              <span className="font-medium">
                {guest.firstName} {guest.lastName}
              </span>
              <span className="text-sm text-muted-foreground">
                {guest.email}
              </span>
            </div>
          );
        }

        return (
          <span className="text-sm text-muted-foreground">
            Guest ID: {feedback.guestId}
          </span>
        );
      },
    },
    {
      accessorKey: "roomId",
      header: "Room",
      enableSorting: true,
      sortingFn: "text",
      cell: ({ row }) => {
        const feedback = row.original;
        const room = feedback.roomId as any;
        
        if (typeof room === 'object' && room?.roomNumber) {
          return (
            <div className="flex flex-col">
              <span className="font-medium">Room {room.roomNumber}</span>
              <span className="text-sm text-muted-foreground">
                {room.roomType}
              </span>
            </div>
          );
        }

        return (
          <span className="text-sm text-muted-foreground">
            Room ID: {feedback.roomId}
          </span>
        );
      },
    },
    {
      accessorKey: "response",
      header: "Response",
      enableSorting: true,
      sortingFn: "text",
      filterFn: "booleanFilter",
      cell: ({ row }) => {
        const feedback = row.original;
        const hasResponse = feedback.response && feedback.respondedBy;
        
        return (
          <div className="flex items-center gap-2">
            {hasResponse ? (
              <>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Reply className="h-3 w-3 mr-1" />
                  Responded
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {feedback.responseDate && format(new Date(feedback.responseDate), "MMM dd")}
                </span>
              </>
            ) : (
              <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                Pending
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {currentUserRole && hasPermission(currentUserRole, "feedback.delete") && (
            <ConfirmFeedbackDeleteDialog
              id={row.original._id}
              title="Delete Feedback"
              description="Are you sure you want to delete this feedback? This action cannot be undone."
            >
              <Button variant="destructive" size="icon">
                <Trash2 />
              </Button>
            </ConfirmFeedbackDeleteDialog>
          )}
          {currentUserRole && hasPermission(currentUserRole, "feedback.update") && (
            <FeedbackSheet id={row.original._id}>
              <Button variant="outline" size="icon">
                <Edit />
              </Button>
            </FeedbackSheet>
          )}
        </div>
      ),
    },
  ];
};

// Export the columns for backward compatibility (without permissions)
export const feedbackColumns = createFeedbackColumns();
