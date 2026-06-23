"use client";

import { use } from "react";
import { ArrowLeft, Printer, Send, FileText, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay";

export default function ReceiptDetailPage({ params }: { params: Promise<{ id: string }> }) {
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
            <h1 className="tf-h2 text-[var(--tf-text-primary)]">Receipt {id}</h1>
            <p className="tf-body text-[var(--tf-text-secondary)] mt-1">Generated on {new Date().toLocaleDateString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="bg-[var(--tf-surface)] text-[var(--tf-text-primary)]">
            <Printer className="w-4 h-4 mr-2" /> Print
          </Button>
          <Button variant="outline" className="bg-[var(--tf-surface)] text-[var(--tf-text-primary)]">
            <Send className="w-4 h-4 mr-2" /> Email
          </Button>
          <Button className="bg-[var(--tf-primary)] text-white hover:bg-[var(--tf-primary-hover)]">
            <Download className="w-4 h-4 mr-2" /> Download PDF
          </Button>
        </div>
      </div>

      {/* Receipt Document Simulation */}
      <div className="bg-white text-black p-8 md:p-12 rounded-xl shadow-sm border border-[var(--tf-border)] max-w-3xl mx-auto">
        <div className="flex justify-between items-center border-b border-gray-200 pb-8 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xl">T</span>
            </div>
            <span className="text-2xl font-bold text-gray-900 tracking-tight">TravelFlow</span>
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-light text-gray-900 mb-2">OFFICIAL RECEIPT</h2>
            <p className="text-gray-500 font-medium">{id}</p>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Receipt Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-lg">
            <div>
              <p className="text-gray-500 mb-1">Date Received:</p>
              <p className="font-semibold text-gray-900">{new Date().toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Payment Method:</p>
              <p className="font-semibold text-gray-900">Bank Transfer</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Received From:</p>
              <p className="font-semibold text-gray-900">Usman Ali</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Applied To:</p>
              <p className="font-semibold text-gray-900">INV-2024-001</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center py-12 border-y border-gray-100 my-8">
           <div className="text-center">
             <p className="text-gray-500 mb-2 uppercase tracking-widest text-sm font-bold">Amount Received</p>
             <CurrencyDisplay amount={45000} className="text-5xl font-light text-gray-900" />
           </div>
        </div>

        <div className="mt-8 text-gray-500 text-sm">
          <p className="mb-4">
            <span className="font-semibold text-gray-700">Notes: </span>
            Payment received via standard bank transfer. The amount has been applied to your outstanding balance for invoice INV-2024-001.
          </p>
          <div className="flex justify-between items-end mt-16 pt-8 border-t border-gray-200">
            <div>
              <p className="font-semibold text-gray-900">TravelFlow Inc.</p>
              <p>contact@travelflow.pk</p>
            </div>
            <div className="text-center">
               <div className="w-40 border-b border-gray-400 mb-2"></div>
               <p className="text-xs uppercase tracking-wider">Authorized Signature</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
