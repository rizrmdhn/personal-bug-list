import { Skeleton } from "./ui/skeleton";
import { TableCell, TableRow } from "./ui/table";

const TableRowSkeleton = ({ columns }: { columns: number }) => (
  <TableRow>
    {Array.from({ length: columns }).map((_, index) => (
      <TableCell key={index}>
        <Skeleton className="h-6 w-full" />
      </TableCell>
    ))}
  </TableRow>
);

export default TableRowSkeleton;
