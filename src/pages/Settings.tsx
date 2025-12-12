import styled from "styled-components";
import Heading from "../ui/Heading";
import Row from "../ui/Row";
import GeneralSettings from "../features/settings/UpdateSettingsForm";
import DeviceManagement from "../features/settings/DeviceManagement";
import SecuritySettings from "../features/settings/SecuritySettings";
import { useState } from "react";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2.4rem;
`;

const TabsContainer = styled.div`
  display: flex;
  gap: 1rem;
  border-bottom: 1px solid var(--color-border-card);
  padding-bottom: 0.2rem;
`;

const Tab = styled.button<{ $active: boolean }>`
  background: none;
  border: none;
  padding: 0.8rem 1.6rem;
  font-size: 1.4rem;
  font-weight: 500;
  color: ${(p) => (p.$active ? "var(--color-brand-600)" : "var(--color-text-dim)")};
  border-bottom: 2px solid ${(p) => (p.$active ? "var(--color-brand-600)" : "transparent")};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: var(--color-brand-600);
  }
`;

function Settings() {
  const [activeTab, setActiveTab] = useState<"general" | "devices" | "security">("general");

  return (
    <Container>
      <Row>
        <Heading as="h1">Settings</Heading>
      </Row>

      <TabsContainer>
        <Tab $active={activeTab === "general"} onClick={() => setActiveTab("general")}>
          General
        </Tab>
        <Tab $active={activeTab === "devices"} onClick={() => setActiveTab("devices")}>
          Devices
        </Tab>
        <Tab $active={activeTab === "security"} onClick={() => setActiveTab("security")}>
          Security
        </Tab>
      </TabsContainer>

      {activeTab === "general" && <GeneralSettings />}
      {activeTab === "devices" && <DeviceManagement />}
      {activeTab === "security" && <SecuritySettings />}
    </Container>
  );
}

export default Settings;
