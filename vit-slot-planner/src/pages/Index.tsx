import { useState, useEffect } from 'react';
import SlotTimetable from '../components/SlotTimetable';
import FacultyList from '../components/FacultyList';
import { SlotData, Assignment } from '../types/slot-types';
import { loadSlotData, saveFacultyAssignments, loadFacultyAssignments } from '../utils/slot-utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Calendar, Users } from 'lucide-react';
import { Instagram } from 'lucide-react'; // Import Instagram icon

const Index = () => {
  const [slotData] = useState<SlotData>(loadSlotData());
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);

  useEffect(() => {
    const savedAssignments = loadFacultyAssignments();
    setAssignments(savedAssignments);
  }, []);

  const handleSlotAssignment = (slots: Array<{slotCode: string, day: string, timeIndex: number}>, facultyNames: string[] | null) => {
    let updatedAssignments = [...assignments];
    const newGroupId = slots.length > 1 ? Date.now().toString() : ''; // Generate a groupId for batched assignments

    slots.forEach(slotToAssign => {
      const existingAssignmentIndex = updatedAssignments.findIndex(a => a.slotCode === slotToAssign.slotCode);

      if (facultyNames === null) {
        // Clear entire assignment for this slot
        if (existingAssignmentIndex !== -1) {
          updatedAssignments.splice(existingAssignmentIndex, 1);
        }
      } else if (facultyNames.length === 0) {
        // Clear all faculty from this slot, but keep the assignment if it exists
        if (existingAssignmentIndex !== -1) {
          updatedAssignments[existingAssignmentIndex] = {
            ...updatedAssignments[existingAssignmentIndex],
            facultyNames: []
          };
        } else {
          // If no existing assignment, create one with empty faculty (though this case is less common for 'clear faculty')
          updatedAssignments.push({
            slotCode: slotToAssign.slotCode,
            day: slotToAssign.day,
            timeIndex: slotToAssign.timeIndex,
            facultyNames: [],
            groupId: newGroupId // Assign groupId even if facultyNames is empty
          });
        }
      } else {
        // Assign or add faculty to this slot
        if (existingAssignmentIndex !== -1) {
          // Update existing assignment: add new faculty, avoid duplicates
          const currentFaculty = updatedAssignments[existingAssignmentIndex].facultyNames || [];
          const newFacultySet = new Set([...currentFaculty, ...facultyNames]);
          updatedAssignments[existingAssignmentIndex] = {
            ...updatedAssignments[existingAssignmentIndex],
            facultyNames: Array.from(newFacultySet),
            groupId: updatedAssignments[existingAssignmentIndex].groupId || newGroupId // Preserve existing groupId or assign new
          };
        } else {
          // Create new assignment
          updatedAssignments.push({
            slotCode: slotToAssign.slotCode,
            day: slotToAssign.day,
            timeIndex: slotToAssign.timeIndex,
            facultyNames: facultyNames,
            groupId: newGroupId // Assign groupId to new assignment
          });
        }
      }
    });

    setAssignments(updatedAssignments);
    saveFacultyAssignments(updatedAssignments);
  };

  const getSlotAssignment = (slotCode: string): Assignment | undefined => {
    return assignments.find(a => a.slotCode === slotCode);
  };

  const clearAllAssignments = () => {
    setAssignments([]);
    saveFacultyAssignments([]);
  };

  const handleRemoveFaculty = (facultyToRemove: string, slotCode: string) => {
    const assignmentToRemoveFrom = assignments.find(a => a.slotCode === slotCode && a.facultyNames.includes(facultyToRemove));

    if (!assignmentToRemoveFrom) return; // Faculty not found in this slot

    let updatedAssignments: Assignment[];

    if (assignmentToRemoveFrom.groupId) {
      // If there's a groupId, remove faculty from all assignments with that groupId
      updatedAssignments = assignments.map(assignment => {
        if (assignment.groupId === assignmentToRemoveFrom.groupId) {
          const newFacultyNames = assignment.facultyNames.filter(name => name !== facultyToRemove);
          return { ...assignment, facultyNames: newFacultyNames };
        }
        return assignment;
      }).filter(assignment => assignment.facultyNames.length > 0); // Remove assignment if no faculty remain
    } else {
      // If no groupId, remove faculty only from the specific slot
      updatedAssignments = assignments.map(assignment => {
        if (assignment.slotCode === slotCode) {
          const newFacultyNames = assignment.facultyNames.filter(name => name !== facultyToRemove);
          return { ...assignment, facultyNames: newFacultyNames };
        }
        return assignment;
      }).filter(assignment => assignment.facultyNames.length > 0); // Remove assignment if no faculty remain
    }

    setAssignments(updatedAssignments);
    saveFacultyAssignments(updatedAssignments);
  };

  const getTotalSlots = () => {
    return slotData.slots[0].times.filter(slot => slot !== 'LUNCH').length * slotData.slots.length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative">
      {/* Watermark */}
      <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center">
        <div className="text-gray-200 text-4xl md:text-6xl lg:text-8xl font-bold transform rotate-45 opacity-20 select-none">
          PARTHA PRATIM BHAKAT
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <GraduationCap className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              VIT FFCS PLANNER
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Plan your Fully Flexible Credit System schedule with our interactive slot booking system
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/70 backdrop-blur-sm border-blue-200 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Slots</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{getTotalSlots()}</div>
              <p className="text-xs text-muted-foreground">Across all days</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/70 backdrop-blur-sm border-green-200 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assigned Slots</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{assignments.length}</div>
              <p className="text-xs text-muted-foreground">Faculty assigned</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/70 backdrop-blur-sm border-purple-200 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Slots</CardTitle>
              <Calendar className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{getTotalSlots() - assignments.length}</div>
              <p className="text-xs text-muted-foreground">Ready for booking</p>
            </CardContent>
          </Card>
        </div>

        {/* Developer Info Card */}
        <div className="grid grid-cols-1 gap-6 mb-8">
          <Card className="bg-white/70 backdrop-blur-sm border-gray-200 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contact the Developer</CardTitle>
              <Users className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-gray-800">PARTHA PRATIM BHAKAT</div>
              <p className="text-xs text-muted-foreground">
                <a 
                  href="https://www.instagram.com/the_twinflameodyssey?igsh=MXJhdHNsMXBhaG5sNQ=="
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center"
                >
                  <Instagram className="h-4 w-4 mr-1" /> Instagram Profile
                </a>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="mb-8">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Filters & Controls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="availableOnly"
                    checked={showOnlyAvailable}
                    onChange={(e) => setShowOnlyAvailable(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="availableOnly" className="text-sm font-medium">
                    Show only available slots
                  </label>
                </div>
                
                <Button onClick={clearAllAssignments} variant="destructive">
                  Clear All Assignments
                </Button>
              </div>
              <div className="mt-4 text-sm text-gray-700">
                <p className="font-semibold">Key Features:</p>
                <ul className="list-disc list-inside ml-4">
                  <li><span className="font-bold text-blue-600">Multi-slot Selection:</span> You can now hold Ctrl/Cmd and click multiple slots to select them simultaneously.</li>
                  <li><span className="font-bold text-blue-600">Smartphone Multi-selection:</span> On smartphones, multi-slot-selection is not enabled for now, wait for future updates.</li>
                  <li><span className="font-bold text-blue-600">RECOMENDED:</span> Use of laptops instead of smartphones for better user experience.</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Slot Timetable</CardTitle>
              </CardHeader>
              <CardContent>
                <SlotTimetable
                  slotData={slotData}
                  assignments={assignments}
                  onSlotAssignment={handleSlotAssignment}
                  getSlotAssignment={getSlotAssignment}
                  showOnlyAvailable={showOnlyAvailable}
                />
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Faculty List</CardTitle>
              </CardHeader>
              <CardContent>
                <FacultyList
                  slotData={slotData}
                  assignments={assignments}
                  onRemoveFaculty={handleRemoveFaculty}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center text-sm text-gray-500 relative z-10">
        <p>
          &copy; {new Date().getFullYear()} VIT FFCS Planner. All rights reserved.
        </p>
        <p>
          Contact the Developer: 
          <a 
            href="https://www.instagram.com/the_twinflameodyssey?igsh=MXJhdHNsMXBhaG5sNQ=="
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline ml-1"
          >
            PARTHA PRATIM BHAKAT (Instagram)
          </a>
        </p>
      </footer>
    </div>
  );
};

export default Index;
