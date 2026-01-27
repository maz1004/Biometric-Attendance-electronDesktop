import { useForm } from "react-hook-form";
import styled from "styled-components";
import Form from "../../ui/Form";
import FormRow from "../../ui/FormRow";
import Input from "../../ui/Input";
import Select from "../../ui/Select";
import Spinner from "../../ui/Spinner";
import Button from "../../ui/Button";
import { useSettings } from "./useSettings";
import { useEffect } from "react";
import type { UpdateSettingsRequest } from "../../services/settings";

const Box = styled.div`
  background-color: var(--color-bg-elevated);
  padding: 2.4rem;
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-border-card);
`;

const Title = styled.h3`
  font-size: 1.6rem;
  font-weight: 600;
  color: var(--color-text-strong);
  margin-bottom: 1.6rem;
`;

const FlexRow = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  width: 100%;
`;


const LANGUAGE_OPTIONS = [
    { value: "en", label: "English" },
    { value: "fr", label: "Français" },
];

const TIMEZONE_OPTIONS = [
    { value: "UTC", label: "UTC" },
    { value: "Europe/Paris", label: "Europe/Paris" },
    { value: "America/New_York", label: "America/New_York" },
    { value: "Asia/Dubai", label: "Asia/Dubai" },
];

const DATE_FORMAT_OPTIONS = [
    { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
    { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
    { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
];

const TIME_FORMAT_OPTIONS = [
    { value: "24h", label: "24h" },
    { value: "12h", label: "12h" },
];

export default function CompanySettingsForm() {
    const { isLoading, settings, update, isUpdating } = useSettings();
    const { register, handleSubmit, formState, reset, setError } = useForm<UpdateSettingsRequest>();
    const { errors } = formState;

    useEffect(() => {
        if (settings) {
            reset({
                company_name: settings.company_name,
                timezone: settings.timezone,
                language: settings.language,
                date_format: settings.date_format,
                time_format: settings.time_format,
                working_hours_start: settings.working_hours_start,
                working_hours_end: settings.working_hours_end,
                late_threshold_minutes: settings.late_threshold_minutes,
                // Planning Config
                planning_day_start: settings.planning_day_start || "07:00",
                planning_day_end: settings.planning_day_end || "19:00",
                planning_night_start: settings.planning_night_start || "19:00",
                planning_night_end: settings.planning_night_end || "07:00",
            });
        }
    }, [settings, reset]);

    if (isLoading) return <Spinner />;

    function onSubmit(data: UpdateSettingsRequest) {
        // Basic Overlap Validation
        // Convert times to minutes for comparison
        const toMins = (t: string) => {
            const [h, m] = t.split(":").map(Number);
            return h * 60 + m;
        };

        const dStart = toMins(data.planning_day_start || "07:00");
        const dEnd = toMins(data.planning_day_end || "19:00");
        const nStart = toMins(data.planning_night_start || "19:00");
        const nEnd = toMins(data.planning_night_end || "07:00");

        // Logic: Day should be "inside" DayStart-DayEnd. Night might wrap.
        // Check if Day overlaps with Night.
        // Simplest check: If DayEnd > NightStart (and NightStart > DayStart), that's an overlap.
        // But user provided 07:00-19:00 and 19:00-07:00. This touches but doesn't overlap.
        // Let's warn if overlap > 0.

        if (dEnd > nStart) {
            setError("planning_day_end", { type: "custom", message: "Overlaps with Night Start" });
            setError("planning_night_start", { type: "custom", message: "Overlaps with Day End" });
            return;
        }

        update(data);
    }

    return (
        <Box>
            <Title>🧩 Company Settings</Title>
            <Form onSubmit={handleSubmit(onSubmit)}>
                <FormRow label="Company Name" error={errors?.company_name?.message}>
                    <Input
                        type="text"
                        id="company_name"
                        disabled={isUpdating}
                        {...register("company_name", { required: "This field is required" })}
                    />
                </FormRow>

                <FormRow label="Language" error={errors?.language?.message}>
                    <Select
                        id="language"
                        options={LANGUAGE_OPTIONS}
                        disabled={isUpdating}
                        {...register("language")}
                    />
                </FormRow>

                <FormRow label="Timezone" error={errors?.timezone?.message}>
                    <Select
                        id="timezone"
                        options={TIMEZONE_OPTIONS}
                        disabled={isUpdating}
                        {...register("timezone")}
                    />
                </FormRow>

                <FormRow label="Date Format" error={errors?.date_format?.message}>
                    <Select
                        id="date_format"
                        options={DATE_FORMAT_OPTIONS}
                        disabled={isUpdating}
                        {...register("date_format")}
                    />
                </FormRow>

                <FormRow label="Time Format" error={errors?.time_format?.message}>
                    <Select
                        id="time_format"
                        options={TIME_FORMAT_OPTIONS}
                        disabled={isUpdating}
                        {...register("time_format")}
                    />
                </FormRow>

                <FormRow label="Official Working Hours" error={errors?.working_hours_start?.message}>
                    <FlexRow>
                        <Input
                            type="time"
                            id="working_hours_start"
                            disabled={isUpdating}
                            {...register("working_hours_start")}
                        />
                        <span>to</span>
                        <Input
                            type="time"
                            id="working_hours_end"
                            disabled={isUpdating}
                            {...register("working_hours_end")}
                        />
                    </FlexRow>
                </FormRow>

                <FormRow label="Horaire Jour (Planning)" error={errors?.planning_day_start?.message}>
                    <FlexRow>
                        <Input
                            type="time"
                            disabled={isUpdating}
                            {...register("planning_day_start")}
                        />
                        <span>to</span>
                        <Input
                            type="time"
                            disabled={isUpdating}
                            {...register("planning_day_end")}
                        />
                    </FlexRow>
                </FormRow>

                <FormRow label="Horaire Nuit (Planning)" error={errors?.planning_night_start?.message}>
                    <FlexRow>
                        <Input
                            type="time"
                            disabled={isUpdating}
                            {...register("planning_night_start")}
                        />
                        <span>to</span>
                        <Input
                            type="time"
                            disabled={isUpdating}
                            {...register("planning_night_end")}
                        />
                    </FlexRow>
                </FormRow>

                <FormRow label="Late Threshold (minutes)" error={errors?.late_threshold_minutes?.message}>
                    <Input
                        type="number"
                        id="late_threshold_minutes"
                        disabled={isUpdating}
                        {...register("late_threshold_minutes", {
                            min: { value: 0, message: "Minimum value is 0" },
                        })}
                    />
                </FormRow>

                <FormRow>
                    <Button disabled={isUpdating} type="submit">
                        {isUpdating ? "Updating..." : "Update settings"}
                    </Button>
                </FormRow>
            </Form>
        </Box>
    );
}
