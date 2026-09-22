"use client";

import "use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Loader2, Printer } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";

type Job = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  initialEstimate: number;
  confirmedTotal: number | null;
  paymentStatus: string;
  paymentMethod: string | null;
  customer: { name: string; phone: string };
  worker: { user: { name: string; phone: string } };
  service: { name: string; category: { name: string } } | null;
  jobProducts: { id: string; qty: number; priceAtTime: number; workerProduct: { name: string } }[];
  additionalWork: { id: string; description: string; extraCost: number }[];
};

export function InvoiceView({ job }: { job: Job }) {
  const productsTotal = job.jobProducts.reduce((s, p) => s + p.qty * p.priceAtTime, 0);
  const serviceAmount = job.initialEstimate - productsTotal;
  const additionsTotal = job.additionalWork.reduce((s, a) => s + a.extraCost, 0);
  const total = (job.confirmedTotal ?? job.initialEstimate) + additionsTotal;
  const receiptRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  async function downloadPdf() {
    if (!receiptRef.current) return;
    setDownloading(true);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas"), import("jspdf")]);
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      });
      const pdf = new jsPDF("p", "mm", "a4");
      const margin = 12;
      const pageWidth = pdf.internal.pageSize.getWidth() - margin * 2;
      const imageHeight = (canvas.height * pageWidth) / canvas.width;
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", margin, margin, pageWidth, imageHeight);
      pdf.save(`localhands-receipt-${job.id.slice(-8)}.pdf`);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="min-h-screen bg-canvas px-6 py-10 print:bg-white print:px-0 print:py-0">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between print:hidden">
          <Link href={`/customer/jobs/${job.id}`} className="flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink">
            <ArrowLeft size={15} /> Back to job
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-2.5 text-sm font-medium text-ink hover:border-ink"
            >
              <Printer size={15} /> Print receipt
            </button>
            <button
              onClick={downloadPdf}
              disabled={downloading}
              className="flex items-center gap-1.5 rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-canvas hover:bg-accent disabled:opacity-60"
            >
              {downloading ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
              {downloading ? "Creating PDF…" : "Download PDF"}
            </button>
          </div>
        </div>

        <div ref={receiptRef} className="rounded-3xl border border-border bg-surface p-8 print:rounded-none print:border-0 print:p-0 sm:p-10">
          <div className="flex items-start justify-between border-b border-border pb-6">
            <div>
              <BrandLogo compact />
              <p className="mt-1 text-xs text-ink-muted">Invoice #{job.id.slice(-8).toUpperCase()}</p>
            </div>
            <div className="text-right text-sm text-ink-muted">
              <p>{new Date(job.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
              <p className="mt-1">
                Status:{" "}
                <span className={job.paymentStatus === "PAID" ? "text-accent" : "text-ink"}>
                  {job.paymentStatus === "PAID" ? "Paid" : "Unpaid"}
                </span>
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-6 text-sm">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-ink-muted">Customer</p>
              <p className="mt-1 text-ink">{job.customer.name}</p>
              <p className="text-ink-muted">{job.customer.phone}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-ink-muted">Worker</p>
              <p className="mt-1 text-ink">{job.worker.user.name}</p>
              <p className="text-ink-muted">{job.worker.user.phone}</p>
            </div>
          </div>

          <div className="mt-8">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-widest text-ink-muted">
                  <th className="pb-2 font-medium">Item</th>
                  <th className="pb-2 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="py-2.5 text-ink">
                    {job.service ? `${job.service.category.name} — ${job.service.name}` : "Custom job"}
                  </td>
                  <td className="py-2.5 text-right text-ink">₹{serviceAmount.toFixed(0)}</td>
                </tr>
                {job.jobProducts.map((p) => (
                  <tr key={p.id}>
                    <td className="py-2.5 text-ink-muted">{p.workerProduct.name} × {p.qty}</td>
                    <td className="py-2.5 text-right text-ink-muted">₹{(p.qty * p.priceAtTime).toFixed(0)}</td>
                  </tr>
                ))}
                {job.additionalWork.map((a) => (
                  <tr key={a.id}>
                    <td className="py-2.5 text-ink-muted">{a.description} (approved extra)</td>
                    <td className="py-2.5 text-right text-ink-muted">₹{a.extraCost.toFixed(0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
              <span className="font-medium text-ink">Total</span>
              <span className="font-display text-2xl text-ink">₹{total.toFixed(0)}</span>
            </div>
            {job.paymentMethod && (
              <p className="mt-1 text-right text-xs text-ink-muted">Paid via {job.paymentMethod}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
