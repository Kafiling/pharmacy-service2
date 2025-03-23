import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Pill, Truck, FileText } from 'lucide-react';
import { Link } from 'wouter';

export default function QuickLinks() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {/* New Order */}
      <Card>
        <CardContent className="p-6 flex flex-col items-center justify-center">
          <div className="bg-blue-100 p-3 rounded-full mb-4">
            <PlusCircle className="text-blue-600 h-5 w-5" />
          </div>
          <h3 className="text-md font-medium text-gray-900 mb-1">New Order</h3>
          <p className="text-xs text-gray-500 text-center mb-3">Create a new customer order</p>
          <Link href="/orders?new=true">
            <Button variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-50">
              Create
            </Button>
          </Link>
        </CardContent>
      </Card>
      
      {/* Add Medication */}
      <Card>
        <CardContent className="p-6 flex flex-col items-center justify-center">
          <div className="bg-green-100 p-3 rounded-full mb-4">
            <Pill className="text-green-600 h-5 w-5" />
          </div>
          <h3 className="text-md font-medium text-gray-900 mb-1">Add Medication</h3>
          <p className="text-xs text-gray-500 text-center mb-3">Add new medication to inventory</p>
          <Link href="/inventory?new=true">
            <Button variant="outline" className="w-full border-green-600 text-green-600 hover:bg-green-50">
              Add
            </Button>
          </Link>
        </CardContent>
      </Card>
      
      {/* Order Supplies */}
      <Card>
        <CardContent className="p-6 flex flex-col items-center justify-center">
          <div className="bg-purple-100 p-3 rounded-full mb-4">
            <Truck className="text-purple-600 h-5 w-5" />
          </div>
          <h3 className="text-md font-medium text-gray-900 mb-1">Order Supplies</h3>
          <p className="text-xs text-gray-500 text-center mb-3">Place orders with suppliers</p>
          <Link href="/suppliers?new=true">
            <Button variant="outline" className="w-full border-purple-600 text-purple-600 hover:bg-purple-50">
              Order
            </Button>
          </Link>
        </CardContent>
      </Card>
      
      {/* Generate Report */}
      <Card>
        <CardContent className="p-6 flex flex-col items-center justify-center">
          <div className="bg-orange-100 p-3 rounded-full mb-4">
            <FileText className="text-orange-600 h-5 w-5" />
          </div>
          <h3 className="text-md font-medium text-gray-900 mb-1">Generate Report</h3>
          <p className="text-xs text-gray-500 text-center mb-3">Create inventory and sales reports</p>
          <Link href="/reports">
            <Button variant="outline" className="w-full border-orange-600 text-orange-600 hover:bg-orange-50">
              Generate
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
