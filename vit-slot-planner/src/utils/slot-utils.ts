import { SlotData, Assignment } from '../types/slot-types';

export const loadSlotData = (): SlotData => {
  return {
    slots: [
      {
        day: "Monday",
        times: ["A11", "B11", "C11", "LUNCH", "A21", "A14", "B21", "C21"]
      },
      {
        day: "Tuesday", 
        times: ["D11", "E11", "F11", "LUNCH", "D21", "E14", "E21", "F21"]
      },
      {
        day: "Wednesday",
        times: ["A12", "B12", "C12", "LUNCH", "A22", "B14", "B22", "A24"]
      },
      {
        day: "Thursday",
        times: ["D12", "E12", "F12", "LUNCH", "D22", "F14", "E22", "F22"]
      },
      {
        day: "Friday",
        times: ["A13", "B13", "C13", "LUNCH", "A23", "C14", "B23", "B24"]
      },
      {
        day: "Saturday",
        times: ["D13", "E13", "F13", "LUNCH", "D23", "D14", "D24", "E23"]
      }
    ],
    timeLabels: [
      "08:30 – 10:00",
      "10:05 – 11:35", 
      "11:40 – 13:10",
      "13:10 – 13:15 (LUNCH)",
      "13:15 – 14:45",
      "14:50 – 16:20",
      "16:25 – 17:55",
      "18:00 – 19:30"
    ]
  };
};

export const saveFacultyAssignments = (assignments: Assignment[]): void => {
  localStorage.setItem('ffcs-assignments', JSON.stringify(assignments));
};

export const loadFacultyAssignments = (): Assignment[] => {
  const saved = localStorage.getItem('ffcs-assignments');
  if (!saved) {
    return [];
  }
  try {
    const parsedAssignments: any[] = JSON.parse(saved);
    // Ensure facultyNames is always an array
    return parsedAssignments.map(assignment => ({
      ...assignment,
      facultyNames: Array.isArray(assignment.facultyNames)
        ? assignment.facultyNames
        : (typeof assignment.facultyName === 'string' ? [assignment.facultyName] : [])
    }));
  } catch (error) {
    console.error("Error parsing faculty assignments from local storage:", error);
    return [];
  }
};
