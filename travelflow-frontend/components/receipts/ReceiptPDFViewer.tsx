"use client";

import { Document, Page, Text, View, StyleSheet, Image, PDFViewer } from "@react-pdf/renderer";
import { useEffect, useState } from "react";

const THEME_COLOR = "#1a1b36"; 

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    position: "relative",
  },
  content: {
    paddingTop: 150,
    paddingBottom: 100,
    paddingHorizontal: 40,
    flex: 1,
  },
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: -1,
  },
  
  // Header / Receipt Number
  receiptNumberLabel: {
    fontSize: 9,
    fontStyle: "italic",
    color: "#666",
    marginBottom: 4,
  },
  receiptNumberBox: {
    backgroundColor: THEME_COLOR,
    paddingVertical: 4,
    paddingHorizontal: 12,
    width: 140,
    marginBottom: 30,
  },
  receiptNumberText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
    textAlign: "center",
  },

  // 2-Column Grid for Details
  detailsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  detailsCol: {
    width: "48%",
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: THEME_COLOR,
    textTransform: "uppercase",
    fontStyle: "italic",
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 5,
  },
  detailLabel: {
    fontSize: 9,
    color: "#666",
  },
  detailValue: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#333",
    textAlign: "right",
    flex: 1,
    paddingLeft: 10,
  },

  // Services Table
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
    textTransform: "uppercase",
    flex: 1,
    letterSpacing: 2,
  },
  tableColHeaderCenter: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#fff",
    textTransform: "uppercase",
    width: 60,
    textAlign: "center",
    letterSpacing: 2,
  },
  tableColHeaderRight: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#fff",
    textTransform: "uppercase",
    width: 100,
    textAlign: "right",
    letterSpacing: 2,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  tableCellLeft: {
    fontSize: 9,
    color: "#333",
    fontWeight: "bold",
    flex: 1,
  },
  tableCellCenter: {
    fontSize: 9,
    color: "#333",
    width: 60,
    textAlign: "center",
  },
  tableCellRight: {
    fontSize: 9,
    color: "#333",
    width: 100,
    textAlign: "right",
  },

  // Totals Section
  totalsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  termsSection: {
    width: "55%",
  },
  termsTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  termsText: {
    fontSize: 8,
    color: "#666",
    lineHeight: 1.4,
    marginBottom: 10,
  },
  summarySection: {
    width: "40%",
    alignItems: "flex-end",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 10,
    fontStyle: "italic",
    color: "#666",
  },
  summaryValue: {
    fontSize: 10,
    fontWeight: "bold",
  },
  
  // Big Total Box
  totalBoxContainer: {
    backgroundColor: THEME_COLOR,
    width: "100%",
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  totalBoxAmount: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },
  totalBoxLabel: {
    color: "#fff",
    fontSize: 10,
    letterSpacing: 2,
    textTransform: "uppercase",
  },

  // Bottom Signature & Manager Info
  signatureContainer: {
    marginTop: 40,
    width: 200,
  },
  signatureLine: {
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    marginBottom: 8,
  },
  signatureText: {
    width: "100%",
    textAlign: "center",
    fontSize: 10,
    color: "#333",
  },
  managerInfo: {
    position: "absolute",
    bottom: 28,
    left: 65,
    fontSize: 9,
    color: "white",
  },
});

export default function ReceiptPDFViewer({ data }: { data: any }) {
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  if (!origin) return null;

  const bgUrl = `${origin}/assets/invoice/triptrails-letter-head.png`;

  const Doc = () => (
    <Document title={`Receipt-${data.receiptRef}`}>
      <Page size="A4" style={styles.page}>
        <Image src={bgUrl} style={styles.background} fixed />
        
        <View style={styles.content}>
          {/* Receipt Number */}
          <View>
            <Text style={styles.receiptNumberLabel}>Receipt Number:</Text>
            <View style={styles.receiptNumberBox}>
              <Text style={styles.receiptNumberText}>{data.receiptRef || "N/A"}</Text>
            </View>
          </View>

          {/* Details Grid */}
          <View style={styles.detailsContainer}>
            {/* Left: Received From */}
            <View style={styles.detailsCol}>
              <Text style={styles.sectionTitle}>Received From</Text>
              {(data.customerId?.name || data.customerId?.firstName || data.customerName) ? (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Client Name:</Text>
                  <Text style={styles.detailValue}>
                    {data.customerName || data.customerId?.name || `${data.customerId?.firstName || ""} ${data.customerId?.lastName || ""}`}
                  </Text>
                </View>
              ) : null}
              
              {data.customerId?.companyName ? (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Company:</Text>
                  <Text style={styles.detailValue}>{data.customerId?.companyName}</Text>
                </View>
              ) : null}

              {data.customerId?.phone ? (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Phone:</Text>
                  <Text style={styles.detailValue}>{data.customerId?.phone}</Text>
                </View>
              ) : null}
            </View>

            {/* Right: Payment Details */}
            <View style={styles.detailsCol}>
              <Text style={styles.sectionTitle}>Payment Details</Text>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date:</Text>
                <Text style={styles.detailValue}>
                  {new Date(data.date || data.createdAt).toLocaleDateString()}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Method:</Text>
                <Text style={[styles.detailValue, { textTransform: "capitalize" }]}>
                  {data.paymentMethod?.replace("_", " ")}
                </Text>
              </View>

              {data.bookingId?.bookingRef ? (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Booking Ref:</Text>
                  <Text style={styles.detailValue}>
                    {data.bookingId?.bookingRef}
                  </Text>
                </View>
              ) : null}

              {data.bookingId?.pnr ? (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>PNR:</Text>
                  <Text style={styles.detailValue}>
                    {data.bookingId?.pnr}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* Payment Info Table */}
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableColHeaderLeft}>Description</Text>
              <Text style={styles.tableColHeaderRight}>Amount Received</Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={styles.tableCellLeft}>
                Payment received for booking {data.bookingId?.bookingRef || ""}
              </Text>
              <Text style={styles.tableCellRight}>
                Rs {data.amount?.toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Totals & Notes Section */}
          <View style={styles.totalsContainer}>
            {/* Notes (Left) */}
            <View style={styles.termsSection}>
              {data.notes && (
                <View>
                  <Text style={styles.termsTitle}>Notes</Text>
                  <Text style={styles.termsText}>{data.notes}</Text>
                </View>
              )}

              {/* Signature Block */}
              <View style={styles.signatureContainer}>
                <View style={styles.signatureLine} />
                <Text style={styles.signatureText}>Authorized Signature</Text>
              </View>
            </View>

            {/* Big Total (Right) */}
            <View style={styles.summarySection}>
              <View style={styles.totalBoxContainer}>
                <Text style={styles.totalBoxAmount}>
                  Rs {data.amount?.toLocaleString()}
                </Text>
                <Text style={styles.totalBoxLabel}>AMOUNT PAID</Text>
              </View>
            </View>
          </View>

          {/* Background overlay manager info */}
          {data.managerContact && (
            <View style={styles.managerInfo} fixed>
              <Text style={{ marginBottom: 10 }}>
                {data.managerContact.phone || "N/A"}
              </Text>
              <Text style={{ marginTop: 5 }}>
                {data.managerContact.email || "N/A"}
              </Text>
            </View>
          )}
        </View>
      </Page>
    </Document>
  );

  return (
    <PDFViewer style={{ width: "100%", height: "100vh", border: "none" }}>
      <Doc />
    </PDFViewer>
  );
}
