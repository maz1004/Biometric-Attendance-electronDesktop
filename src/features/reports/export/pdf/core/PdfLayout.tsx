import React, { ReactNode } from "react";
import { Document, Page, View } from "@react-pdf/renderer";
import { BaseReportProps } from "../../types";
import { pdfStyles } from "./styles";
import { PdfHeader } from "./PdfHeader";
import { PdfFooter } from "./PdfFooter";

export interface PdfLayoutProps extends BaseReportProps {
    children: ReactNode;
}

/**
 * PdfLayout
 * The main wrapper for all PDF reports.
 * Responsible for:
 * - Document & Page container
 * - Margins & Fonts
 * - Standard Header & Footer injection
 * 
 * STRICT: Does not accept raw business data. Only layout & meta props.
 */
export const PdfLayout: React.FC<PdfLayoutProps> = ({
    title,
    subtitle,
    meta,
    children
}) => {
    return (
        <Document
            title={`${title} - ${meta.reportDate}`}
            author={meta.companyName}
            creator="Biometric Attendance System"
        >
            <Page size="A4" style={pdfStyles.page}>
                <PdfHeader title={title} subtitle={subtitle} meta={meta} />

                <View style={pdfStyles.content}>
                    {children}
                </View>

                <PdfFooter meta={meta} />
            </Page>
        </Document>
    );
};
