import { Field, FieldProps, Form, Formik, FormikHelpers } from "formik";
import React from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { ControlLabels } from "components";
import { Button } from "components/ui/Button";
import { DropDown } from "components/ui/DropDown";
import { Text } from "components/ui/Text";

import { Geography } from "core/request/AirbyteClient";
import { PageTrackingCodes, useTrackPage } from "hooks/services/Analytics";
import { useNotificationService } from "hooks/services/Notification";
import { useCurrentWorkspace } from "hooks/services/useWorkspace";
import { useAvailableGeographies } from "packages/cloud/services/geographies/GeographiesService";
import { SettingsCard } from "pages/SettingsPage/pages/SettingsComponents";
import { useUpdateWorkspace } from "services/workspaces/WorkspacesService";
import { links } from "utils/links";

import styles from "./DataResidencyView.module.scss";

interface DefaultDataResidencyFormValues {
  defaultGeography: Geography | undefined;
}

export const DataResidencyView: React.FC = () => {
  const workspace = useCurrentWorkspace();
  const { geographies } = useAvailableGeographies();
  const { mutateAsync: updateWorkspace } = useUpdateWorkspace();
  const { registerNotification } = useNotificationService();

  const { formatMessage } = useIntl();
  useTrackPage(PageTrackingCodes.SETTINGS_DATA_RESIDENCY);

  const handleSubmit = async (
    values: DefaultDataResidencyFormValues,
    { resetForm }: FormikHelpers<DefaultDataResidencyFormValues>
  ) => {
    try {
      await updateWorkspace({
        workspaceId: workspace.workspaceId,
        defaultGeography: values.defaultGeography,
      });
      resetForm({ values });
    } catch (e) {
      registerNotification({
        id: "workspaceSettings.defaultGeographyError",
        title: formatMessage({ id: "connection.geographyUpdateError" }),
        isError: true,
      });
    }
  };

  const initialValues: DefaultDataResidencyFormValues = {
    defaultGeography: workspace.defaultGeography,
  };

  return (
    <SettingsCard title={<FormattedMessage id="settings.defaultDataResidency" />}>
      <div className={styles.cardContent}>
        <Text className={styles.description}>
          <FormattedMessage
            id="settings.defaultDataResidencyDescription"
            values={{
              lnk: (node: React.ReactNode) => (
                <a href={links.cloudAllowlistIPsLink} target="_blank" rel="noreferrer">
                  {node}
                </a>
              ),
            }}
          />
        </Text>
        <Formik initialValues={initialValues} onSubmit={handleSubmit}>
          {({ isSubmitting, dirty, isValid, resetForm }) => (
            <Form>
              <Field name="defaultGeography">
                {({ field, form }: FieldProps<Geography>) => (
                  <div className={styles.geographyRow}>
                    <ControlLabels
                      nextLine
                      label={<FormattedMessage id="settings.defaultGeography" />}
                      message={
                        <FormattedMessage
                          id="connection.geographyDescription"
                          values={{
                            lnk: (node: React.ReactNode) => (
                              <a href={links.cloudAllowlistIPsLink} target="_blank" rel="noreferrer">
                                {node}
                              </a>
                            ),
                          }}
                        />
                      }
                    />
                    <div className={styles.defaultGeographyDropdown}>
                      <DropDown
                        options={geographies.map((geography) => ({
                          label: formatMessage({
                            id: `connection.geography.${geography}`,
                            defaultMessage: geography.toUpperCase(),
                          }),
                          value: geography,
                        }))}
                        value={field.value}
                        onChange={(option) => form.setFieldValue("defaultGeography", option.value)}
                      />
                    </div>
                  </div>
                )}
              </Field>
              <div className={styles.buttonGroup}>
                <Button type="button" variant="secondary" disabled={!dirty || isSubmitting} onClick={() => resetForm()}>
                  <FormattedMessage id="form.cancel" />
                </Button>
                <Button type="submit" disabled={!dirty || !isValid || isSubmitting} isLoading={isSubmitting}>
                  <FormattedMessage id="form.saveChanges" />
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </SettingsCard>
  );
};
