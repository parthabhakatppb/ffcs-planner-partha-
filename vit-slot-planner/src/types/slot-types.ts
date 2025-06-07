
export interface SlotData {
  slots: {
    day: string;
    times: string[];
  }[];
  timeLabels: string[];
}

export interface Faculty {
  id: string;
  name: string;
  initials: string;
  color: string;
}

export interface Assignment {
  slotCode: string;
  day: string;
  timeIndex: number;
  facultyNames: string[];
  groupId: string; // New property to group assignments
}
