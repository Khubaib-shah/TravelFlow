"use client";

import { Document, Page, Text, View, StyleSheet, PDFViewer } from "@react-pdf/renderer";
import { useEffect, useState } from "react";

const THEME_COLOR = "#1a1b36"; 

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    position: "relative",
  },
  content: {
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 40,
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: THEME_COLOR,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  invoiceInfo: {
    fontSize: 10,
    color: "#666",
    marginBottom: 4,
  },
  detailsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  detailsCol: {
    width: "48%",
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: THEME_COLOR,
    textTransform: "uppercase",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 4,
    marginBottom: 8,
  },
  textRow: {
    fontSize: 10,
    color: "#333",
    marginBottom: 4,
  },
  table: {
    width: "100%",
    marginTop: 10,
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: THEME_COLOR,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  tableColHeaderLeft: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
  },
  tableColHeaderCenter: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#fff",
    width: 60,
    textAlign: "center",
  },
  tableColHeaderRight: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#fff",
    width: 100,
    textAlign: "right",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  tableCellLeft: {
    fontSize: 10,
    color: "#333",
    flex: 1,
  },
  tableCellCenter: {
    fontSize: 10,
    color: "#333",
    width: 60,
    textAlign: "center",
  },
  tableCellRight: {
    fontSize: 10,
    color: "#333",
    width: 100,
    textAlign: "right",
  },
  totalsContainer: {
    alignItems: "flex-end",
    marginTop: 20,
  },
  totalsBox: {
    width: 250,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  totalRowFinal: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderTopWidth: 2,
    borderTopColor: THEME_COLOR,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#666",
  },
  totalValue: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#333",
  },
  finalTotalLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: THEME_COLOR,
  },
  finalTotalValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: THEME_COLOR,
  },
  notes: {
    marginTop: 40,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  notesText: {
    fontSize: 9,
    color: "#666",
    fontStyle: "italic",
  },
});

export default function InvoicePDFViewer({ data }: { data: any }) {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return (
    <PDFViewer style={{ width: "100%", height: "100%", border: "none" }}>
      <Document title={`Invoice-${data.invoiceRef}`}>
        <Page size="A4" style={styles.page}>
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Text style={styles.title}>INVOICE</Text>
                <Text style={styles.invoiceInfo}>Invoice No: {data.invoiceRef}</Text>
                <Text style={styles.invoiceInfo}>Date: {new Date(data.createdAt).toLocaleDateString()}</Text>
                <Text style={styles.invoiceInfo}>Due Date: {new Date(data.dueDate).toLocaleDateString()}</Text>
                <Text style={styles.invoiceInfo}>Status: {data.status.toUpperCase()}</Text>
              </View>
              <View style={styles.headerRight}>
                <Text style={[styles.title, { fontSize: 18 }]}>Your Agency</Text>
              </View>
            </View>

            <View style={styles.detailsContainer}>
              <View style={styles.detailsCol}>
                <Text style={styles.sectionTitle}>Bill To:</Text>
                <Text style={styles.textRow}>{data.customer?.name || "N/A"}</Text>
                {data.customer?.companyName && <Text style={styles.textRow}>{data.customer.companyName}</Text>}
                <Text style={styles.textRow}>{data.customer?.phone || ""}</Text>
                <Text style={styles.textRow}>{data.customer?.email || ""}</Text>
                <Text style={styles.textRow}>{data.customer?.address || ""}</Text>
              </View>
            </View>

            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableColHeaderLeft}>Description</Text>
                <Text style={styles.tableColHeaderCenter}>Qty</Text>
                <Text style={styles.tableColHeaderRight}>Unit Price</Text>
                <Text style={styles.tableColHeaderRight}>Amount</Text>
              </View>

              {data.items?.map((item: any, i: number) => (
                <View key={i} style={styles.tableRow}>
                  <Text style={styles.tableCellLeft}>{item.description}</Text>
                  <Text style={styles.tableCellCenter}>{item.quantity}</Text>
                  <Text style={styles.tableCellRight}>{item.unitPrice.toLocaleString()}</Text>
                  <Text style={styles.tableCellRight}>{item.amount.toLocaleString()}</Text>
                </View>
              ))}
            </View>

            <View style={styles.totalsContainer}>
              <View style={styles.totalsBox}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Subtotal:</Text>
                  <Text style={styles.totalValue}>{data.subtotal.toLocaleString()}</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Tax:</Text>
                  <Text style={styles.totalValue}>{data.tax.toLocaleString()}</Text>
                </View>
                <View style={styles.totalRowFinal}>
                  <Text style={styles.finalTotalLabel}>TOTAL:</Text>
                  <Text style={styles.finalTotalValue}>{data.total.toLocaleString()} PKR</Text>
                </View>
              </View>
            </View>

            {data.notes && (
              <View style={styles.notes}>
                <Text style={styles.sectionTitle}>Notes</Text>
                <Text style={styles.notesText}>{data.notes}</Text>
              </View>
            )}
          </View>
        </Page>
      </Document>
    </PDFViewer>
  );
}
