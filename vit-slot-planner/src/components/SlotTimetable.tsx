
import { useState } from 'react';
import { SlotData, Assignment } from '../types/slot-types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Clock, User, X, Plus, Users } from 'lucide-react';

interface SlotTimetableProps {
  slotData: SlotData;
  assignments: Assignment[];
  onSlotAssignment: (slots: Array<{slotCode: string, day: string, timeIndex: number}>, facultyNames: string[] | null) => void; // Changed facultyName to facultyNames: string[]
  getSlotAssignment: (slotCode: string) => Assignment | undefined;
  showOnlyAvailable: boolean;
}

const SlotTimetable = ({
  slotData,
  assignments,
  onSlotAssignment,
  getSlotAssignment,
  showOnlyAvailable
}: SlotTimetableProps) => {
  const [selectedSlots, setSelectedSlots] = useState<Array<{
    slotCode: string;
    day: string;
    timeIndex: number;
  }>>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [facultyNameInput, setFacultyNameInput] = useState(''); // Renamed to avoid conflict
  const [selectedFaculty, setSelectedFaculty] = useState<string[]>([]); // New state for multiple faculty

  const handleSlotClick = (slotCode: string, day: string, timeIndex: number, event: React.MouseEvent) => {
    if (slotCode === 'LUNCH') return;
    
    const slotInfo = { slotCode, day, timeIndex };
    
    if (event.ctrlKey || event.metaKey) {
      // Multi-select mode
      setSelectedSlots(prev => {
        const exists = prev.find(slot => slot.slotCode === slotCode);
        if (exists) {
          return prev.filter(slot => slot.slotCode !== slotCode);
        } else {
          return [...prev, slotInfo];
        }
      });
    } else {
      // Single select mode
      setSelectedSlots([slotInfo]);
      const currentAssignment = getSlotAssignment(slotCode);
      setSelectedFaculty(currentAssignment ? currentAssignment.facultyNames : []); // Initialize with existing faculty
      setFacultyNameInput(''); // Clear input
      setIsDialogOpen(true);
    }
  };

  const handleBatchAssignment = () => {
    if (selectedSlots.length > 0) {
      setSelectedFaculty([]); // Clear previous selection for batch
      setFacultyNameInput(''); // Clear input
      setIsDialogOpen(true);
    }
  };

  const handleFacultyAssign = () => {
    if (selectedSlots.length > 0 && selectedFaculty.length > 0) { // Check for selectedFaculty
      onSlotAssignment(selectedSlots, selectedFaculty); // Pass array of faculty names
      setIsDialogOpen(false);
      setSelectedFaculty([]);
      setFacultyNameInput('');
      setSelectedSlots([]);
    }
  };

  const handleClearOperation = (type: 'faculty' | 'assignment') => {
    if (selectedSlots.length > 0) {
      if (type === 'faculty') {
        onSlotAssignment(selectedSlots, []); // Clear only faculty names
      } else if (type === 'assignment') {
        onSlotAssignment(selectedSlots, null); // Clear entire assignment
      }
      setIsDialogOpen(false);
      setSelectedFaculty([]);
      setFacultyNameInput('');
      setSelectedSlots([]);
    }
  };

  const clearSelection = () => {
    setSelectedSlots([]);
  };

  const handleAddFaculty = () => {
    if (facultyNameInput.trim() && !selectedFaculty.includes(facultyNameInput.trim())) {
      setSelectedFaculty(prev => [...prev, facultyNameInput.trim()]);
      setFacultyNameInput('');
    }
  };

  const handleRemoveFaculty = (facultyToRemove: string) => {
    setSelectedFaculty(prev => prev.filter(f => f !== facultyToRemove));
  };

  const shouldShowSlot = (slotCode: string): boolean => {
    if (slotCode === 'LUNCH') return true;
    const assignment = getSlotAssignment(slotCode);
    
    if (showOnlyAvailable && assignment && assignment.facultyNames.length > 0) return false; // Check if any faculty assigned
    
    return true;
  };

  const getSlotStyle = (slotCode: string): string => {
    if (slotCode === 'LUNCH') {
      return 'bg-orange-100 border-orange-300 text-orange-800 cursor-default';
    }
    
    const isSelected = selectedSlots.some(slot => slot.slotCode === slotCode);
    if (isSelected) {
      return 'bg-purple-500 hover:bg-purple-600 border-purple-600 text-white font-medium ring-2 ring-purple-300';
    }
    
    const assignment = getSlotAssignment(slotCode);
    if (!assignment || !assignment.facultyNames || assignment.facultyNames.length === 0) { // Added check for assignment.facultyNames
      return 'bg-green-50 hover:bg-green-100 border-green-200 text-green-800';
    }
    
    return 'bg-blue-500 hover:bg-blue-600 border-blue-600 text-white font-medium';
  };

  return (
    <>
      {/* Multi-select controls */}
      {selectedSlots.length > 0 && (
        <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">
                {selectedSlots.length} slot{selectedSlots.length > 1 ? 's' : ''} selected
              </span>
              <div className="flex flex-wrap gap-1">
                {selectedSlots.map((slot) => (
                  <Badge key={slot.slotCode} variant="outline" className="text-xs border-purple-500 text-purple-600">
                    {slot.slotCode}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleBatchAssignment} size="sm" className="bg-purple-600 hover:bg-purple-700">
                Assign Faculty
              </Button>
              <Button onClick={clearSelection} variant="outline" size="sm">
                Clear Selection
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Header */}
          <div className="grid grid-cols-8 gap-2 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg text-center">
              <Clock className="w-4 h-4 mx-auto mb-1" />
              Slot Time
            </div>
            {slotData.slots.map((slot) => (
              <div key={slot.day} className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg text-center">
                {slot.day}
              </div>
            ))}
          </div>

          {/* Time Slots Grid */}
          {slotData.timeLabels.map((timeLabel, timeIndex) => (
            <div key={timeIndex} className="grid grid-cols-8 gap-2 mb-3">
              <div className="p-3 bg-gradient-to-r from-gray-700 to-gray-600 text-white text-sm font-medium rounded-lg flex items-center justify-center text-center">
                {timeLabel}
              </div>
              {slotData.slots.map((slot) => {
                const slotCode = slot.times[timeIndex];
                const assignment = getSlotAssignment(slotCode);
                
                if (!shouldShowSlot(slotCode)) {
                  return (
                    <div key={`${slot.day}-${timeIndex}`} className="p-3 bg-gray-100 border border-gray-200 rounded-lg opacity-50">
                      <div className="text-xs text-gray-400 text-center">{slotCode}</div>
                    </div>
                  );
                }

                if (slotCode === 'LUNCH') {
                  return (
                    <div
                      key={`${slot.day}-${timeIndex}`}
                      className={`p-3 border-2 rounded-lg ${getSlotStyle(slotCode)}`}
                    >
                      <div className="text-center">
                        <div className="text-sm font-semibold">LUNCH</div>
                        <div className="text-xs">5 MIN</div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={`${slot.day}-${timeIndex}`}
                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 transform hover:scale-105 ${getSlotStyle(slotCode)}`}
                    onClick={(e) => handleSlotClick(slotCode, slot.day, timeIndex, e)}
                  >
                    <div className="text-center">
                      <div className="text-sm font-semibold mb-1">{slotCode}</div>
                      {assignment && assignment.facultyNames.length > 0 && (
                        <div className="text-xs opacity-90 flex flex-wrap justify-center gap-1">
                          {assignment.facultyNames.map(name => (
                            <Badge key={name} variant="secondary" className="text-xs">
                              {name.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase()}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]" aria-describedby="assignment-dialog-description">
          <DialogHeader>
            <DialogTitle>Assign Faculty to Slot{selectedSlots.length > 1 ? 's' : ''}</DialogTitle>
            <p id="assignment-dialog-description" className="text-sm text-gray-500">
              {selectedSlots.length > 1
                ? `Assign faculty to the selected ${selectedSlots.length} slots.`
                : `Assign faculty to slot ${selectedSlots[0]?.slotCode || ''}.`}
            </p>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {selectedSlots.length === 1 && (
              <div className="text-sm text-muted-foreground">
                <p><strong>Day:</strong> {selectedSlots[0]?.day}</p>
                <p><strong>Time:</strong> {selectedSlots[0] ? slotData.timeLabels[selectedSlots[0].timeIndex] : ''}</p>
              </div>
            )}
            {selectedSlots.length > 1 && (
              <div className="text-sm text-muted-foreground">
                <p><strong>Selected Slots:</strong></p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedSlots.map((slot) => (
                    <Badge key={slot.slotCode} variant="outline" className="text-xs">
                      {slot.slotCode}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {selectedSlots.some(slot => getSlotAssignment(slot.slotCode)?.facultyNames.length > 0) && ( // Check if any faculty assigned
              <p className="text-sm font-medium text-red-500">Some slots already assigned. Adding new faculty will append them.</p>
            )}

            <div className="flex flex-col gap-2">
              <label htmlFor="facultyName" className="text-sm font-medium">Add Faculty:</label>
              <div className="flex space-x-2">
                <Input
                  id="facultyName"
                  value={facultyNameInput}
                  onChange={(e) => setFacultyNameInput(e.target.value)}
                  placeholder="Faculty Name"
                  className="flex-grow"
                />
                <Button onClick={handleAddFaculty} size="sm">
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {selectedFaculty.map(faculty => (
                  <Badge key={faculty} variant="secondary" className="text-sm flex items-center gap-1">
                    {faculty}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => handleRemoveFaculty(faculty)} />
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-4">
              <Button onClick={() => handleClearOperation('faculty')} variant="outline" size="sm">
                Clear Faculty
              </Button>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => handleClearOperation('assignment')}>
                Clear Assignment
              </Button>
              <Button onClick={handleFacultyAssign} disabled={selectedFaculty.length === 0}>
                Submit Assignment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SlotTimetable;
