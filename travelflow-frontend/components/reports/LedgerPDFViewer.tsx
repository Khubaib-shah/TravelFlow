"use client";

import { Document, Page, Text, View, StyleSheet, PDFViewer } from "@react-pdf/renderer";
import { useEffect, useState } from "react";

const THEME_COLOR = "#0f172a"; 

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    padding: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
    borderBottomWidth: 2,
    borderBottomColor: THEME_COLOR,
    paddingBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: THEME_COLOR,
    textTransform: "uppercase",
  },
  infoText: {
    fontSize: 10,
    color: "#666",
    marginTop: 4,
  },
  detailsContainer: {
    marginBottom: 20,
  },
  customerName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  table: {
    width: "100%",
    marginTop: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: THEME_COLOR,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  colDate: { width: "15%" },
  colRef: { width: "15%" },
  colDesc: { flex: 1 },
  colAmount: { width: "15%", textAlign: "right" },
  headerText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#fff",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  cellText: {
    fontSize: 9,
    color: "#333",
  },
  summaryContainer: {
    marginTop: 30,
    alignItems: "flex-end",
  },
  summaryBox: {
    width: 200,
    backgroundColor: "#f8fafc",
    padding: 15,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 10,
    color: "#666",
    fontWeight: "bold",
  },
  summaryValue: {
    fontSize: 12,
    color: THEME_COLOR,
    fontWeight: "bold",
  },
});

export default function LedgerPDFViewer({ data }: { data: any }) {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return (
    <PDFViewer style={{ width: "100%", height: "100%", border: "none" }}>
      <Document title={`Ledger-${data.customer?.name}`}>
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>CUSTOMER LEDGER</Text>
              <Text style={styles.infoText}>Generated: {new Date().toLocaleDateString()}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={[styles.title, { fontSize: 16 }]}>Your Agency</Text>
            </View>
          </View>

          <View style={styles.detailsContainer}>
            <Text style={styles.customerName}>{data.customer?.name || "Customer"}</Text>
            {data.customer?.companyName && <Text style={styles.infoText}>{data.customer.companyName}</Text>}
            <Text style={styles.infoText}>{data.customer?.email} | {data.customer?.phone}</Text>
          </View>

          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <View style={styles.colDate}><Text style={styles.headerText}>Date</Text></View>
              <View style={styles.colRef}><Text style={styles.headerText}>Reference</Text></View>
              <View style={styles.colDesc}><Text style={styles.headerText}>Description</Text></View>
              <View style={styles.colAmount}><Text style={styles.headerText}>Debit</Text></View>
              <View style={styles.colAmount}><Text style={styles.headerText}>Credit</Text></View>
              <View style={styles.colAmount}><Text style={styles.headerText}>Balance</Text></View>
            </View>

            {data.entries?.map((entry: any, i: number) => (
              <View key={i} style={styles.tableRow}>
                <View style={styles.colDate}>
                  <Text style={styles.cellText}>{new Date(entry.date).toLocaleDateString()}</Text>
                </View>
                <View style={styles.colRef}>
                  <Text style={styles.cellText}>{entry.reference}</Text>
                </View>
                <View style={styles.colDesc}>
                  <Text style={styles.cellText}>{entry.description}</Text>
                </View>
                <View style={styles.colAmount}>
                  <Text style={[styles.cellText, { textAlign: "right" }]}>
                    {entry.debit > 0 ? entry.debit.toLocaleString() : "-"}
                  </Text>
                </View>
                <View style={styles.colAmount}>
                  <Text style={[styles.cellText, { textAlign: "right" }]}>
                    {entry.credit > 0 ? entry.credit.toLocaleString() : "-"}
                  </Text>
                </View>
                <View style={styles.colAmount}>
                  <Text style={[styles.cellText, { textAlign: "right", fontWeight: "bold" }]}>
                    {entry.balance.toLocaleString()}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.summaryContainer}>
            <View style={styles.summaryBox}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Final Balance:</Text>
                <Text style={styles.summaryValue}>{data.finalBalance.toLocaleString()} PKR</Text>
              </View>
            </View>
          </View>
        </Page>
      </Document>
    </PDFViewer>
  );
}
