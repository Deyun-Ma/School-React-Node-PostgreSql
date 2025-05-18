import { useState } from "react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Pencil,
  Plus,
  Search,
  Trash,
} from "lucide-react";
import { exportToCSV } from "@/lib/exportData";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";

interface Column {
  key: string;
  header: string;
  cell?: (item: any) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface DataTableProps {
  data: any[];
  columns: Column[];
  title: string;
  isLoading?: boolean;
  searchable?: boolean;
  onAdd?: () => void;
  onEdit?: (item: any) => void;
  onView?: (item: any) => void;
  onDelete?: (item: any) => void;
  sortKey?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (key: string) => void;
  actions?: boolean;
  selectable?: boolean;
  downloadable?: boolean;
  fileName?: string;
  emptyMessage?: string;
}

const DataTable = ({
  data,
  columns,
  title,
  isLoading = false,
  searchable = true,
  onAdd,
  onEdit,
  onView,
  onDelete,
  sortKey,
  sortDirection = "asc",
  onSort,
  actions = true,
  selectable = true,
  downloadable = true,
  fileName = "data_export",
  emptyMessage = "No data available",
}: DataTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState<Record<string | number, boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [showDeleteDialog, setShowDeleteDialog] = useState<{ show: boolean; item: any | null }>({
    show: false,
    item: null,
  });

  // Filter data based on search term
  const filteredData = searchTerm
    ? data.filter((item) =>
        Object.values(item).some(
          (value) =>
            value &&
            value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : data;

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  // Toggle selection of all items
  const toggleSelectAll = () => {
    if (Object.keys(selectedItems).length === paginatedData.length) {
      setSelectedItems({});
    } else {
      const newSelectedItems: Record<string | number, boolean> = {};
      paginatedData.forEach((item) => {
        newSelectedItems[item.id] = true;
      });
      setSelectedItems(newSelectedItems);
    }
  };

  // Toggle selection of a single item
  const toggleSelectItem = (id: string | number) => {
    setSelectedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Handle delete confirmation
  const handleDeleteClick = (item: any) => {
    setShowDeleteDialog({ show: true, item });
  };

  const handleConfirmDelete = () => {
    if (showDeleteDialog.item && onDelete) {
      onDelete(showDeleteDialog.item);
    }
    setShowDeleteDialog({ show: false, item: null });
  };

  // Handle download
  const handleDownload = () => {
    exportToCSV(
      filteredData.map((item) => {
        const newItem: Record<string, any> = {};
        columns.forEach((column) => {
          if (column.key !== "actions") {
            newItem[column.header] = item[column.key];
          }
        });
        return newItem;
      }),
      fileName
    );
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-medium text-gray-800">{title}</h3>
        <div className="flex space-x-2">
          {searchable && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 h-10"
              />
            </div>
          )}
          {onAdd && (
            <Button onClick={onAdd} className="flex items-center">
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          )}
          {downloadable && (
            <Button
              variant="outline"
              onClick={handleDownload}
              className="flex items-center"
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              {selectable && (
                <TableHead className="w-[40px]">
                  <Checkbox
                    checked={
                      paginatedData.length > 0 &&
                      Object.keys(selectedItems).length === paginatedData.length
                    }
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
              )}
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={column.width ? `w-[${column.width}]` : ""}
                >
                  <div className="flex items-center">
                    {column.header}
                    {column.sortable && onSort && (
                      <button
                        onClick={() => onSort(column.key)}
                        className="ml-1 focus:outline-none"
                      >
                        {sortKey === column.key ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={`h-4 w-4 ${
                              sortDirection === "asc"
                                ? "text-gray-900"
                                : "text-gray-400"
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d={
                                sortDirection === "asc"
                                  ? "M5 15l7-7 7 7"
                                  : "M19 9l-7 7-7-7"
                              }
                            />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 16V4m0 0L3 8m4-4l4 4"
                            />
                          </svg>
                        )}
                      </button>
                    )}
                  </div>
                </TableHead>
              ))}
              {actions && (onView || onEdit || onDelete) && (
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {selectable && (
                    <TableCell className="w-[40px]">
                      <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                    </TableCell>
                  )}
                  {columns.map((column, colIndex) => (
                    <TableCell key={colIndex}>
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    </TableCell>
                  ))}
                  {actions && (
                    <TableCell className="text-right">
                      <div className="h-8 w-20 bg-gray-200 rounded animate-pulse ml-auto"></div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={
                    columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)
                  }
                  className="text-center py-8 text-gray-500"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((item) => (
                <TableRow key={item.id} className="hover:bg-gray-50">
                  {selectable && (
                    <TableCell className="w-[40px]">
                      <Checkbox
                        checked={!!selectedItems[item.id]}
                        onCheckedChange={() => toggleSelectItem(item.id)}
                        aria-label={`Select item ${item.id}`}
                      />
                    </TableCell>
                  )}
                  {columns.map((column) => (
                    <TableCell key={column.key}>
                      {column.cell ? column.cell(item) : item[column.key]}
                    </TableCell>
                  ))}
                  {actions && (onView || onEdit || onDelete) && (
                    <TableCell className="text-right">
                      <div className="flex space-x-2 justify-end">
                        {onView && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onView(item)}
                            className="text-gray-500 hover:text-blue-600"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        {onEdit && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(item)}
                            className="text-gray-500 hover:text-blue-600"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(item)}
                            className="text-gray-500 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {!isLoading && totalPages > 0 && (
        <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">{startIndex + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(startIndex + itemsPerPage, filteredData.length)}
                </span>{" "}
                of <span className="font-medium">{filteredData.length}</span>{" "}
                results
              </p>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="rounded-l-md"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: totalPages }).map((_, index) => (
                  <Button
                    key={index}
                    variant={currentPage === index + 1 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(index + 1)}
                    className={
                      currentPage === index + 1
                        ? "bg-blue-50 border-blue-500 text-blue-600"
                        : "bg-white"
                    }
                  >
                    {index + 1}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="rounded-r-md"
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </nav>
            </div>
          </div>
          <div className="flex-1 flex justify-between sm:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <DeleteConfirmDialog
        open={showDeleteDialog.show}
        onClose={() => setShowDeleteDialog({ show: false, item: null })}
        onConfirm={handleConfirmDelete}
        title="Delete Item"
        description="Are you sure you want to delete this item? This action cannot be undone."
      />
    </div>
  );
};

export default DataTable;
