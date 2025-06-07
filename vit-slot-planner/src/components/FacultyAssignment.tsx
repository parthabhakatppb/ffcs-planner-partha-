
import { Assignment } from '../types/slot-types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, BookOpen } from 'lucide-react';

interface FacultyAssignmentProps {
  assignments: Assignment[];
  getSlotAssignment: (slotCode: string) => Assignment | undefined;
}

const FacultyAssignment = ({ assignments }: FacultyAssignmentProps) => {
  const getFacultyGroups = () => {
    const groups: { [key: string]: Assignment[] } = {};
    
    assignments.forEach(assignment => {
      assignment.facultyNames.forEach(facultyName => { // Iterate over facultyNames
        if (!groups[facultyName]) {
          groups[facultyName] = [];
        }
        groups[facultyName].push(assignment); // Push the whole assignment
      });
    });
    
    return groups;
  };

  const facultyGroups = getFacultyGroups();
  const facultyNames = Object.keys(facultyGroups);

  if (facultyNames.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Users className="w-5 h-5 mr-2 text-blue-600" />
            Faculty Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No faculty assigned yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Users className="w-5 h-5 mr-2 text-blue-600" />
            Faculty Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {facultyNames.map((facultyName) => {
              const facultyAssignments = facultyGroups[facultyName];
              return (
                <div key={facultyName} className="p-4 border rounded-lg bg-white/50 hover:bg-white/70 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
                        {facultyName.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{facultyName}</h4>
                        <p className="text-xs text-muted-foreground">Faculty Member</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {facultyAssignments.length} slots
                    </Badge>
                  </div>
                  
                  {facultyAssignments.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center text-xs text-muted-foreground mb-2">
                        <BookOpen className="w-3 h-3 mr-1" />
                        Assigned Slots:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {facultyAssignments.map((assignment) => (
                          <Badge 
                            key={assignment.slotCode} 
                            variant="outline" 
                            className="text-xs border-blue-500 text-blue-500"
                          >
                            {assignment.slotCode}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg">Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-green-100 border-2 border-green-200 rounded"></div>
              <span className="text-sm">Available Slot</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-blue-500 border-2 border-blue-600 rounded"></div>
              <span className="text-sm">Assigned Slot</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-purple-500 border-2 border-purple-600 rounded"></div>
              <span className="text-sm">Selected Slot</span>
            </div>
            <div className="text-xs text-muted-foreground mt-3">
              Hold Ctrl/Cmd and click slots to select multiple for batch assignment
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FacultyAssignment;
