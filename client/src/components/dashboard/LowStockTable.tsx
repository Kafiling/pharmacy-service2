import { useQuery } from "@tanstack/react-query";
import { MedicationWithSupplier } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type StockStatusBadgeProps = {
  current: number;
  minimum: number;
};

const StockStatusBadge = ({ current, minimum }: StockStatusBadgeProps) => {
  const isCritical = current < minimum * 0.5;
  const isLow = current < minimum;

  const getStatusStyles = () => {
    if (isCritical) {
      return 'bg-error/10 text-error';
    } else if (isLow) {
      return 'bg-warning/10 text-warning';
    } else {
      return 'bg-success/10 text-success';
    }
  };

  const getStatusText = () => {
    if (isCritical) {
      return 'Critical Stock';
    } else if (isLow) {
      return 'Low Stock';
    } else {
      return 'In Stock';
    }
  };

  return (
    <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyles()}`}>
      {getStatusText()}
    </p>
  );
};

const LowStockTable = () => {
  const { data: lowStockItems, isLoading } = useQuery<MedicationWithSupplier[]>({
    queryKey: ['/api/medications/low-stock'],
  });

  if (isLoading) {
    return (
      <div className="mt-8">
        <h2 className="text-lg font-medium text-neutral-900">Low Stock Medications</h2>
        <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-md">
          <ul role="list" className="divide-y divide-neutral-200">
            {[1, 2, 3].map((i) => (
              <li key={i} className="p-4">
                <div className="flex justify-between mb-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-8 w-24" />
                </div>
                <div className="flex justify-between">
                  <div className="flex space-x-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-4 w-40" />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  if (!lowStockItems || lowStockItems.length === 0) {
    return (
      <div className="mt-8">
        <h2 className="text-lg font-medium text-neutral-900">Low Stock Medications</h2>
        <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-md p-6 text-center">
          <p className="text-neutral-500">All medications are well stocked.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-lg font-medium text-neutral-900">Low Stock Medications</h2>
      <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-md">
        <ul role="list" className="divide-y divide-neutral-200">
          {lowStockItems.map((item) => (
            <li key={item.id}>
              <div className="block hover:bg-neutral-50">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-neutral-900 truncate">
                        {item.name}
                      </p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <StockStatusBadge current={item.stock} minimum={item.minStock} />
                      </div>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <Button size="sm">
                        Order More
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-neutral-500">
                        <i className="ri-medicine-bottle-line flex-shrink-0 mr-1.5 text-neutral-400"></i>
                        <span>{item.stock} units left</span>
                      </p>
                      <p className="mt-2 flex items-center text-sm text-neutral-500 sm:mt-0 sm:ml-6">
                        <i className="ri-stock-line flex-shrink-0 mr-1.5 text-neutral-400"></i>
                        <span>Minimum: {item.minStock} units</span>
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-neutral-500 sm:mt-0">
                      <span className="font-medium text-neutral-900">{item.supplier.name}</span>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default LowStockTable;
