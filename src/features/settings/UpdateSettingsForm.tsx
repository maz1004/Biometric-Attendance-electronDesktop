import { useForm } from "react-hook-form";
import styled from "styled-components";
import Form from "../../ui/Form";
import FormRow from "../../ui/FormRow";
import Input from "../../ui/Input";
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

export default function CompanySettingsForm() {
    const { isLoading, settings, update, isUpdating } = useSettings();
    const { register, handleSubmit, formState, reset } = useForm<UpdateSettingsRequest>();
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
            });
        }
    }, [settings, reset]);

    if (isLoading) return <Spinner />;

    function onSubmit(data: UpdateSettingsRequest) {
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
                    <Input
                        type="text"
                        id="language"
                        disabled={isUpdating}
                        placeholder="en, fr, es..."
                        {...register("language")}
                    />
                </FormRow>

                <FormRow label="Timezone" error={errors?.timezone?.message}>
                    <Input
                        type="text"
                        id="timezone"
                        disabled={isUpdating}
                        placeholder="Europe/Paris, America/New_York..."
                        {...register("timezone")}
                    />
                </FormRow>

                <FormRow label="Date Format" error={errors?.date_format?.message}>
                    <Input
                        type="text"
                        id="date_format"
                        disabled={isUpdating}
                        placeholder="YYYY-MM-DD, DD/MM/YYYY..."
                        {...register("date_format")}
                    />
                </FormRow>

                <FormRow label="Time Format" error={errors?.time_format?.message}>
                    <Input
                        type="text"
                        id="time_format"
                        disabled={isUpdating}
                        placeholder="24h, 12h..."
                        {...register("time_format")}
                    />
                </FormRow>

                <FormRow label="Working Hours Start" error={errors?.working_hours_start?.message}>
                    <Input
                        type="time"
                        id="working_hours_start"
                        disabled={isUpdating}
                        {...register("working_hours_start")}
                    />
                </FormRow>

                <FormRow label="Working Hours End" error={errors?.working_hours_end?.message}>
                    <Input
                        type="time"
                        id="working_hours_end"
                        disabled={isUpdating}
                        {...register("working_hours_end")}
                    />
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
