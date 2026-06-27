"use client";

import { use } from "react";
import { ArrowLeft, Printer, Send, FileText, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay";

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full bg-[var(--tf-surface)] border border-[var(--tf-border)]">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="tf-h2 text-[var(--tf-text-primary)]">Invoice {id}</h1>
            <p className="tf-body text-[var(--tf-text-secondary)] mt-1">Generated on {new Date().toLocaleDateString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => window.print()} className="bg-[var(--tf-surface)] text-[var(--tf-text-primary)] print:hidden">
            <Printer className="w-4 h-4 mr-2" /> Print
          </Button>
          <Button variant="outline" onClick={() => toast.success("Invoice emailed successfully")} className="bg-[var(--tf-surface)] text-[var(--tf-text-primary)] print:hidden">
            <Send className="w-4 h-4 mr-2" /> Email
          </Button>
          <Button onClick={() => { toast.success("Generating PDF..."); window.print() }} className="bg-[var(--tf-primary)] text-white hover:bg-[var(--tf-primary-hover)] print:hidden">
            <Download className="w-4 h-4 mr-2" /> Download PDF
          </Button>
        </div>
      </div>

      {/* Invoice Document Simulation */}
      <div className="bg-white text-black p-8 md:p-12 rounded-xl shadow-sm border border-[var(--tf-border)] max-w-4xl mx-auto">
        <div className="flex justify-between items-start border-b border-gray-200 pb-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xl">T</span>
              </div>
              <span className="text-2xl font-bold text-gray-900 tracking-tight">TravelFlow</span>
            </div>
            <p className="text-gray-500 text-sm">123 Business Avenue, Suite 400</p>
            <p className="text-gray-500 text-sm">Karachi, Pakistan</p>
            <p className="text-gray-500 text-sm">contact@travelflow.pk</p>
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-light text-gray-900 mb-2">INVOICE</h2>
            <p className="text-gray-500 font-medium">{id}</p>
            <p className="text-gray-500 text-sm mt-4">Date: {new Date().toLocaleDateString()}</p>
            <p className="text-gray-500 text-sm">Due Date: {new Date(Date.now() + 86400000 * 7).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Billed To</p>
            <p className="font-semibold text-gray-900">Usman Ali</p>
            <p className="text-gray-500 text-sm">usman.ali@example.com</p>
            <p className="text-gray-500 text-sm">+92 333 9988776</p>
          </div>
          <div className="text-right">
             <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Payment Status</p>
             <span className="inline-block px-3 py-1 bg-green-100 text-green-700 font-medium rounded-full text-sm">
               PAID
             </span>
          </div>
        </div>

        <table className="w-full text-left border-collapse mb-8">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="py-3 text-sm font-bold text-gray-700 uppercase tracking-wider">Description</th>
              <th className="py-3 text-sm font-bold text-gray-700 uppercase tracking-wider text-right">Qty</th>
              <th className="py-3 text-sm font-bold text-gray-700 uppercase tracking-wider text-right">Price</th>
              <th className="py-3 text-sm font-bold text-gray-700 uppercase tracking-wider text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-4">
                <p className="font-medium text-gray-900">Return Flight: KHI - DXB</p>
                <p className="text-sm text-gray-500">Emirates Airlines (Economy)</p>
              </td>
              <td className="py-4 text-right text-gray-700">1</td>
              <td className="py-4 text-right text-gray-700"><CurrencyDisplay amount={95000} /></td>
              <td className="py-4 text-right font-medium text-gray-900"><CurrencyDisplay amount={95000} /></td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-4">
                <p className="font-medium text-gray-900">Visa Processing</p>
                <p className="text-sm text-gray-500">30-day Tourist Visa</p>
              </td>
              <td className="py-4 text-right text-gray-700">1</td>
              <td className="py-4 text-right text-gray-700"><CurrencyDisplay amount={25000} /></td>
              <td className="py-4 text-right font-medium text-gray-900"><CurrencyDisplay amount={25000} /></td>
            </tr>
          </tbody>
        </table>

        <div className="flex justify-end">
          <div className="w-64 space-y-3">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span><CurrencyDisplay amount={120000} /></span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Tax (0%)</span>
              <span><CurrencyDisplay amount={0} /></span>
            </div>
            <div className="flex justify-between text-xl font-bold text-gray-900 border-t border-gray-200 pt-3">
              <span>Total</span>
              <span><CurrencyDisplay amount={120000} /></span>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-200 text-gray-500 text-sm text-center">
          <p>Thank you for your business!</p>
          <p>If you have any questions regarding this invoice, please contact us.</p>
        </div>
      </div>
    </div>
  );
}
