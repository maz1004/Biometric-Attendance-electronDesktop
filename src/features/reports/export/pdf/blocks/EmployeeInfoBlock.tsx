import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { EmployeeExportModel } from "../../adapters/employeeAdapter";
import { colors } from "../core/styles";

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
        padding: 15,
        backgroundColor: colors.background.header,
        borderRadius: 6,
        borderLeftWidth: 4,
        borderLeftColor: colors.text.primary,
    },
    row: {
        flexDirection: "row",
        marginBottom: 4,
    },
    label: {
        width: 100,
        fontSize: 9,
        color: colors.text.secondary,
        fontWeight: "bold",
    },
    value: {
        fontSize: 9,
        color: colors.text.primary,
    },
    name: {
        fontSize: 14,
        fontWeight: "bold",
        marginBottom: 8,
        color: colors.text.primary,
    },
});

interface EmployeeInfoBlockProps {
    employee: EmployeeExportModel;
}

export const EmployeeInfoBlock: React.FC<EmployeeInfoBlockProps> = ({ employee }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.name}>{employee.fullName}</Text>

            <View style={styles.row}>
                <Text style={styles.label}>Matricule:</Text>
                <Text style={styles.value}>{employee.employeeId}</Text>
            </View>
            <View style={styles.row}>
                <Text style={styles.label}>Département:</Text>
                <Text style={styles.value}>{employee.department}</Text>
            </View>
            <View style={styles.row}>
                <Text style={styles.label}>Rôle:</Text>
                <Text style={styles.value}>{employee.role}</Text>
            </View>
            {employee.email && (
                <View style={styles.row}>
                    <Text style={styles.label}>Email:</Text>
                    <Text style={styles.value}>{employee.email}</Text>
                </View>
            )}
        </View>
    );
};
