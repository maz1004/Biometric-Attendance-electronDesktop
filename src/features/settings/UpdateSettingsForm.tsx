import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import Form from "../../ui/Form";
import FormRow from "../../ui/FormRow";
import Input from "../../ui/Input";
import Select from "../../ui/Select";
import Spinner from "../../ui/Spinner";
import Button from "../../ui/Button";
import { useSettings } from "./useSettings";
import { useEffect, useState } from "react";
import type { UpdateSettingsRequest } from "../../services/settings";
import { getShifts, archiveShift } from "../../services/planning";
import { validateSettingsChange, SettingsChangeValidation } from "../planning/engine/PlanningEngine";

import toast from "react-hot-toast";
import Switch from "../../ui/Switch";
import Tooltip from "../../ui/Tooltip";

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
    { value: "ar", label: "العربية" },
    { value: "kab", label: "Taqbaylit" },
];



export default function CompanySettingsForm() {
    const { t, i18n } = useTranslation();
    const { isLoading, settings, update, isUpdating } = useSettings();
    const { register, handleSubmit, formState, reset, setError, watch, setValue } = useForm<UpdateSettingsRequest>();
    const { errors } = formState;

    const enablePlanning = watch("enable_planning_based_attendance");
    const selectedLanguage = watch("language");

    // Sync form language change with i18n instance immediately
    useEffect(() => {
        if (selectedLanguage && selectedLanguage !== i18n.language) {
            i18n.changeLanguage(selectedLanguage);
            document.documentElement.dir = selectedLanguage === 'ar' ? 'rtl' : 'ltr';
            document.documentElement.lang = selectedLanguage;
        }
    }, [selectedLanguage, i18n]);

    useEffect(() => {
        if (settings) {
            reset({
                company_name: settings.company_name,
                language: settings.language,
                late_threshold_minutes: settings.late_threshold_minutes,
                early_departure_threshold_minutes: settings.early_departure_threshold_minutes,
                enable_planning_based_attendance: settings.enable_planning_based_attendance,
                enable_global_late_tracking: settings.enable_global_late_tracking,
                // Planning Config
                planning_day_start: settings.planning_day_start || "07:00",
                planning_day_end: settings.planning_day_end || "19:00",
                planning_night_start: settings.planning_night_start || "19:00",
                planning_night_end: settings.planning_night_end || "07:00",
            });
        }
    }, [settings, reset]);

    const [pendingData, setPendingData] = useState<UpdateSettingsRequest | null>(null);
    const [validationResult, setValidationResult] = useState<SettingsChangeValidation | null>(null);
    const [showConfirmation, setShowConfirmation] = useState(false);

    if (isLoading) return <Spinner />;

    async function onSubmit(data: UpdateSettingsRequest) {
        // Basic Overlap Validation
        const toMins = (t: string) => {
            const [h, m] = t.split(":").map(Number);
            return h * 60 + m;
        };

        const dEnd = toMins(data.planning_day_end || "19:00");
        const nStart = toMins(data.planning_night_start || "19:00");

        if (dEnd > nStart) {
            setError("planning_day_end", { type: "custom", message: t("settings.verification.overlap_day_end") });
            setError("planning_night_start", { type: "custom", message: t("settings.verification.overlap_night_start") });
            return;
        }

        // Validate against existing shifts
        try {
            const existingShifts = await getShifts();
            const validation = validateSettingsChange(data, existingShifts);

            if (validation.hasWarnings) {
                // Show confirmation modal
                setPendingData(data);
                setValidationResult(validation);
                setShowConfirmation(true);
                return;
            }
        } catch (err) {
            console.warn('[Settings] Could not validate against shifts:', err);
            // Proceed anyway if shifts can't be fetched
        }

        update(data);
    }

    function handleConfirmUpdate() {
        // User chose to proceed - archive incompatible shifts and update settings
        if (pendingData && validationResult) {
            // Archive incompatible shifts
            const archivePromises = validationResult.affectedShifts.map(shift =>
                archiveShift(shift.shiftId, `Incompatible avec nouveaux horaires: ${shift.newRange}`)
                    .catch((err: unknown) => console.warn(`Could not archive shift ${shift.shiftId}:`, err))
            );

            Promise.all(archivePromises).then(() => {
                update(pendingData);
                toast.success(t("settings.verification.success_updated", { count: validationResult.affectedShifts.length }));
            });
        }
        setShowConfirmation(false);
        setPendingData(null);
        setValidationResult(null);
    }

    function handleRollback() {
        // User chose to rollback - reset form to original values
        if (settings) {
            reset({
                planning_day_start: settings.planning_day_start,
                planning_day_end: settings.planning_day_end,
                planning_night_start: settings.planning_night_start,
                planning_night_end: settings.planning_night_end,
            });
            toast(t("settings.verification.restored_msg"), { icon: '↩️' });
        }
        setShowConfirmation(false);
        setPendingData(null);
        setValidationResult(null);
    }

    function handleCancelUpdate() {
        setShowConfirmation(false);
        setPendingData(null);
        setValidationResult(null);
    }

    return (
        <Box>
            <Title>{t("settings.title")}</Title>
            <Form onSubmit={handleSubmit(onSubmit)}>
                <FormRow label={t("settings.form.company_name")} error={errors?.company_name?.message}>
                    <Input
                        type="text"
                        id="company_name"
                        disabled={isUpdating}
                        {...register("company_name", { required: t("common.field_required") })}
                    />
                </FormRow>

                <FormRow label={t("settings.language")} error={errors?.language?.message}>
                    <Select
                        id="language"
                        options={LANGUAGE_OPTIONS}
                        disabled={isUpdating}
                        {...register("language")}
                    />
                </FormRow>



                <FormRow label={t("settings.form.late_threshold")} error={errors?.late_threshold_minutes?.message}>
                    <Input
                        type="number"
                        id="late_threshold_minutes"
                        step="5"
                        disabled={isUpdating}
                        {...register("late_threshold_minutes", {
                            valueAsNumber: true,
                            min: { value: 0, message: t("settings.form.late_threshold_min") },
                        })}
                    />
                </FormRow>

                <FormRow label={t("settings.form.early_departure_threshold")} error={errors?.early_departure_threshold_minutes?.message}>
                    <Input
                        type="number"
                        id="early_departure_threshold_minutes"
                        step="5"
                        disabled={isUpdating}
                        {...register("early_departure_threshold_minutes", {
                            valueAsNumber: true,
                            min: { value: 0, message: t("settings.form.early_departure_threshold_min") },
                        })}
                    />
                </FormRow>

                <FormRow label={t("settings.form.day_schedule")} error={errors?.planning_day_start?.message}>
                    <FlexRow>
                        <Input
                            type="time"
                            disabled={isUpdating}
                            {...register("planning_day_start")}
                        />
                        <span>{t("settings.form.to")}</span>
                        <Input
                            type="time"
                            disabled={isUpdating}
                            {...register("planning_day_end")}
                        />
                    </FlexRow>
                </FormRow>

                <FormRow label={t("settings.form.night_schedule")} error={errors?.planning_night_start?.message}>
                    <FlexRow>
                        <Input
                            type="time"
                            disabled={isUpdating}
                            {...register("planning_night_start")}
                        />
                        <span>{t("settings.form.to")}</span>
                        <Input
                            type="time"
                            disabled={isUpdating}
                            {...register("planning_night_end")}
                        />
                    </FlexRow>
                </FormRow>



                <SectionDivider />

                <FormRow label={t("settings.logic.title")}>
                    <LogicContainer>
                        <LogicItem>
                            <div className="info">
                                <label htmlFor="enable_planning">{t("settings.logic.enable_planning")}</label>
                                <Tooltip text={t("settings.logic.enable_planning_tooltip")} />
                            </div>
                            <Switch
                                id="enable_planning"
                                checked={watch("enable_planning_based_attendance") || false}
                                onChange={(val) => setValue("enable_planning_based_attendance", val, { shouldDirty: true })}
                                disabled={isUpdating}
                            />
                        </LogicItem>

                        <LogicItem>
                            <div className="info">
                                <label htmlFor="enable_global">{t("settings.logic.track_global")}</label>
                                <Tooltip text={t("settings.logic.track_global_tooltip")} />
                            </div>
                            <Switch
                                id="enable_global"
                                checked={watch("enable_global_late_tracking") || false}
                                onChange={(val) => setValue("enable_global_late_tracking", val, { shouldDirty: true })}
                                disabled={isUpdating || enablePlanning}
                            />
                        </LogicItem>
                    </LogicContainer>
                </FormRow>

                <FormRow>
                    <Button disabled={isUpdating} type="submit">
                        {isUpdating ? t("settings.form.updating") : t("settings.form.update_btn")}
                    </Button>
                </FormRow>
            </Form>

            {/* Confirmation Modal for Settings Change Warnings */}
            {
                showConfirmation && validationResult && (
                    <ConfirmationOverlay onClick={handleCancelUpdate}>
                        <ConfirmationModal onClick={(e) => e.stopPropagation()}>
                            <ModalHeader>
                                <h3>{t("settings.verification.warning_title")}</h3>
                            </ModalHeader>
                            <ModalBody>
                                <p>{validationResult.summary}</p>
                                {validationResult.affectedShifts.length > 0 && (
                                    <AffectedList>
                                        {validationResult.affectedShifts.map((shift, idx) => (
                                            <AffectedItem key={idx}>
                                                <strong>{shift.shiftName}</strong>
                                                <span>{t("settings.verification.current")}: {shift.currentRange}</span>
                                                <span>{t("settings.verification.new")}: {shift.newRange}</span>
                                            </AffectedItem>
                                        ))}
                                    </AffectedList>
                                )}
                            </ModalBody>
                            <ModalFooter>
                                <Button variation="secondary" onClick={handleRollback}>
                                    {t("settings.verification.restore_btn")}
                                </Button>
                                <Button variation="danger" onClick={handleConfirmUpdate}>
                                    {t("settings.verification.archive_btn")}
                                </Button>
                            </ModalFooter>
                        </ConfirmationModal>
                    </ConfirmationOverlay>
                )
            }
        </Box >
    );
}

// Confirmation Modal Styles
const ConfirmationOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
`;

const ConfirmationModal = styled.div`
    background: var(--color-bg-elevated);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-lg);
    max-width: 500px;
    width: 90%;
    overflow: hidden;
`;

const ModalHeader = styled.div`
    padding: 1.5rem;
    border-bottom: 1px solid var(--color-border-subtle);
    h3 {
        margin: 0;
        font-size: 1.4rem;
        color: var(--color-text-strong);
    }
`;

const ModalBody = styled.div`
    padding: 1.5rem;
    p {
        margin: 0 0 1rem;
        color: var(--color-text-main);
    }
`;

const AffectedList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    max-height: 200px;
    overflow-y: auto;
`;

const AffectedItem = styled.div`
    background: var(--color-grey-50);
    border: 1px solid var(--color-border-card);
    border-radius: var(--border-radius-sm);
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    
    strong {
        color: var(--color-text-strong);
    }
    
    span {
        font-size: 0.85rem;
        color: var(--color-text-secondary);
    }
`;

const ModalFooter = styled.div`
    padding: 1.5rem;
    border-top: 1px solid var(--color-border-subtle);
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
`;

const SectionDivider = styled.div`
    height: 1px;
    background-color: var(--color-border-subtle);
    margin: 2.4rem 0;
`;

const LogicContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1.6rem;
`;

const LogicItem = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: var(--color-grey-50);
    padding: 1.2rem;
    border-radius: var(--border-radius-sm);
    border: 1px solid var(--color-border-card);

    .info {
        display: flex;
        align-items: center;
        gap: 0.8rem;
        
        label {
            font-weight: 500;
            color: var(--color-text-strong);
            font-size: 1.4rem;
            cursor: pointer;
        }
    }
`;
