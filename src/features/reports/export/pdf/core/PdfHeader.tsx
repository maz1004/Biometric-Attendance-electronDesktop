import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { BaseReportProps } from "../../types";
import { pdfStyles } from "./styles";

// Placeholder logo - in a real app, this would be an absolute path or base64
// const LOGO_URL = "path/to/logo.png"; 

export const PdfHeader: React.FC<BaseReportProps> = ({ title, meta }) => {
    const centralizedNote = meta.sector
        ? `${title} de ${meta.companyName} du secteur ${meta.sector}`
        : `${title} de ${meta.companyName}`;

    return (
        <View style={pdfStyles.header}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                <View>
                    <Text style={pdfStyles.title}>Biometric Attendance System</Text>
                    <Text style={pdfStyles.subtitle}>{centralizedNote}</Text>
                    {meta.period && <Text style={[pdfStyles.metaText, { marginTop: 4 }]}>Période: {meta.period}</Text>}
                </View>
                <View style={{ alignItems: "flex-end" }}>
                    <Text style={[pdfStyles.metaText, { fontWeight: "bold", fontSize: 10 }]}>{meta.companyName}</Text>
                    {meta.sector && <Text style={pdfStyles.metaText}>{meta.sector}</Text>}
                    <Text style={[pdfStyles.metaText, { fontSize: 8, color: "#666", marginTop: 2 }]}>{meta.reportDate}</Text>
                </View>
            </View>
        </View>
    );
};
