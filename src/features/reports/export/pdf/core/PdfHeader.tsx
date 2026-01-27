import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { BaseReportProps } from "../../types";
import { pdfStyles } from "./styles";

// Placeholder logo - in a real app, this would be an absolute path or base64
// const LOGO_URL = "path/to/logo.png"; 

export const PdfHeader: React.FC<BaseReportProps> = ({ title, subtitle, meta }) => {
    return (
        <View style={pdfStyles.header}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <View>
                    <Text style={pdfStyles.title}>{title}</Text>
                    {subtitle && <Text style={pdfStyles.subtitle}>{subtitle}</Text>}
                </View>
                <View style={{ alignItems: "flex-end" }}>
                    <Text style={pdfStyles.metaText}>{meta.companyName}</Text>
                    <Text style={pdfStyles.metaText}>{meta.reportType}</Text>
                </View>
            </View>
        </View>
    );
};
