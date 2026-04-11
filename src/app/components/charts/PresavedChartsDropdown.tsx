import { useProfiles } from "@/contexts/ProfilesContext";
import { BirthChartProfile } from "@/interfaces/BirthChartInterfaces";
import React from "react";

interface DropdownProps {
  disabled?: boolean;
  selectedProfileId?: string;
  onChange?: (profile: BirthChartProfile) => void;
}

export default function PresavedChartsDropdown(props: DropdownProps) {
  const { disabled, onChange, selectedProfileId } = props;
  const { profiles } = useProfiles();
  const selectedValue = selectedProfileId ?? profiles[0]?.id ?? "";

  return (
    <select
      disabled={disabled ?? false}
      className="w-full disabled:opacity-50"
      value={selectedValue}
      onChange={(e) => {
        const key = e.target.value;
        const profile = profiles.find((p) => p.id === key);

        if (profile) {
          onChange?.(profile);
        }
      }}
    >
      {profiles.map((profile, index) => (
        <option key={profile.id ?? index} value={profile.id}>
          {profile.name}
        </option>
      ))}
    </select>
  );
}
