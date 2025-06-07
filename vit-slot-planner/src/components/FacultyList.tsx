
import { Assignment } from '../types/slot-types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, BookOpen, XCircle } from 'lucide-react'; // Import XCircle icon

interface FacultyListProps {
  assignments: Assignment[];
  onRemoveFaculty: (facultyName: string, slotCode: string) => void; // New prop for removing faculty
}

const FacultyList = ({ assignments, onRemoveFaculty }: FacultyListProps) => {
  const getGroupedFacultyBySlots = () => {
    const slotCombinations: { [key: string]: { facultyNames: string[]; slotCodes: string[] } } = {};

    // First, group assignments by faculty to get each faculty's assigned slots
    const facultyToSlots: { [key: string]: string[] } = {};
    assignments.forEach(assignment => {
      assignment.facultyNames.forEach(facultyName => {
        if (!facultyToSlots[facultyName]) {
          facultyToSlots[facultyName] = [];
        }
        if (!facultyToSlots[facultyName].includes(assignment.slotCode)) {
          facultyToSlots[facultyName].push(assignment.slotCode);
        }
      });
    });

    // Now, group faculty by their unique set of assigned slots
    Object.entries(facultyToSlots).forEach(([facultyName, slotCodes]) => {
      // Sort slot codes to ensure consistent key generation regardless of order
      const sortedSlotCodes = [...slotCodes].sort();
      const slotKey = sortedSlotCodes.join(',');

      if (!slotCombinations[slotKey]) {
        slotCombinations[slotKey] = { facultyNames: [], slotCodes: sortedSlotCodes };
      }
      slotCombinations[slotKey].facultyNames.push(facultyName);
    });

    return Object.values(slotCombinations);
  };

  const groupedFaculty = getGroupedFacultyBySlots();

  if (groupedFaculty.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Users className="w-5 h-5 mr-2 text-blue-600" />
            Faculty Assignments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No faculty assigned yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Users className="w-5 h-5 mr-2 text-blue-600" />
          Faculty Assignments by Slot Combination
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {groupedFaculty.map((group, index) => (
            <div key={index} className="p-4 border rounded-lg bg-white/50 hover:bg-white/70 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div>
                    <h4 className="font-medium text-sm">
                      {group.slotCodes.length > 0 ? `Slots: ${group.slotCodes.join(', ')}` : 'No Slots Assigned'}
                    </h4>
                    <p className="text-xs text-muted-foreground">Shared Slots</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {group.facultyNames.length} faculty
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center text-xs text-muted-foreground mb-2">
                  <Users className="w-3 h-3 mr-1" />
                  Assigned Faculty:
                </div>
                <div className="flex flex-wrap gap-1">
                  {group.facultyNames.map((facultyName) => (
                    <Badge 
                      key={facultyName} 
                      variant="outline" 
                      className="text-xs border-blue-500 text-blue-500 cursor-pointer group relative pr-6"
                    >
                      {facultyName}
                      <button
                        onClick={() => group.slotCodes.forEach(slotCode => onRemoveFaculty(facultyName, slotCode))}
                        className="absolute top-0 right-0 h-full w-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label={`Remove ${facultyName}`}
                      >
                        <XCircle className="w-4 h-4 text-red-500" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FacultyList;
