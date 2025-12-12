export interface SettingsFormValues {
    companyName: string;
    minWorkHours: number;
    maxWorkHours: number;
    emailNotifications: boolean;
    slackNotifications: boolean;
    theme: 'light' | 'dark' | 'system';
}
