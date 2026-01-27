import { StyleSheet } from "@react-pdf/renderer";

// Register fonts if needed (using Helvetica for now which is standard)
// Font.register({ family: 'Inter', src: '...' });

export const colors = {
    text: {
        primary: "#111827",
        secondary: "#4B5563",
        muted: "#9CA3AF",
    },
    border: {
        default: "#E5E7EB",
        light: "#F3F4F6",
    },
    background: {
        header: "#F9FAFB",
        zebra: "#F9FAFB",
    },
};

export const pdfStyles = StyleSheet.create({
    page: {
        flexDirection: "column",
        backgroundColor: "#FFFFFF",
        padding: 30,
        fontFamily: "Helvetica",
        fontSize: 10,
        color: colors.text.primary,
    },
    // Layout Structure
    header: {
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.default,
        paddingBottom: 10,
    },
    content: {
        flex: 1,
    },
    footer: {
        marginTop: "auto",
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: colors.border.default,
        flexDirection: "row",
        justifyContent: "space-between",
        fontSize: 8,
        color: colors.text.muted,
    },
    // Typography
    title: {
        fontSize: 20,
        fontWeight: "bold",
        color: colors.text.primary,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 10,
        color: colors.text.secondary,
    },
    metaText: {
        fontSize: 8,
        color: colors.text.muted,
    },
});
