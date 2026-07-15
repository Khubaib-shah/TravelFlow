import { ReactNode } from "react";

export default function PrintLayout({ children }: { children: ReactNode }) {
  return <div className="print-layout min-h-screen bg-gray-100 print:bg-white">{children}</div>;
}
