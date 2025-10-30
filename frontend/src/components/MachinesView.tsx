import { useState } from 'react';
import { machines, mockPrograms } from '../data/mockData';
import type { NCProgram } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { 
  Server, 
  FileCode2, 
  Search, 
  Box, 
  FileText, 
  ClipboardList,
  Eye,
  Download,
  Send
} from 'lucide-react';

interface MachinesViewProps {
  onSelectProgram: (program: NCProgram) => void;
}

export function MachinesView({ onSelectProgram }: MachinesViewProps) {
  const [selectedMachine, setSelectedMachine] = useState(machines[0].id);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCustomer, setFilterCustomer] = useState<string>('all');

  const currentMachine = machines.find(m => m.id === selectedMachine);
  const machinePrograms = mockPrograms.filter(p => p.machine === selectedMachine);
  
  // Get unique customers for this machine
  const customers = Array.from(new Set(machinePrograms.map(p => p.customer))).sort();
  
  const filteredPrograms = machinePrograms.filter(program => {
    const matchesSearch = searchTerm === '' ||
      program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.operation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (program.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    
    const matchesStatus = filterStatus === 'all' || program.status === filterStatus;
    const matchesCustomer = filterCustomer === 'all' || program.customer === filterCustomer;
    
    return matchesSearch && matchesStatus && matchesCustomer;
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Released': return 'success';
      case 'Approved': return 'success';
      case 'In Review': return 'warning';
      case 'Draft': return 'default';
      case 'Obsolete': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Maskiner</h2>
        <p className="text-muted-foreground">Vælg maskine for at se tilhørende NC-programmer</p>
      </div>

      {/* Machine Selector */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {machines.map((machine) => (
          <Card
            key={machine.id}
            className={`cursor-pointer transition-all ${
              selectedMachine === machine.id
                ? 'ring-2 ring-primary shadow-md'
                : 'hover:shadow-md'
            }`}
            onClick={() => setSelectedMachine(machine.id)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{machine.name}</CardTitle>
              <Server className={`h-4 w-4 ${machine.status === 'Online' ? 'text-green-600' : 'text-gray-400'}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{machinePrograms.filter(p => p.machine === machine.id).length}</div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-muted-foreground">{machine.type}</p>
                <Badge variant={machine.status === 'Online' ? 'success' : 'secondary'} className="text-xs">
                  {machine.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Programs for Selected Machine */}
      {currentMachine && (
        <Card>
          <CardHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Programmer for {currentMachine.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Viser {filteredPrograms.length} af {machinePrograms.length} programmer
                  </p>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Søg: varenummer, kunde, operation, beskrivelse..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-3">
                {/* Status Filter */}
                <div className="flex gap-2">
                  <span className="text-sm font-medium text-muted-foreground self-center">Status:</span>
                  <Button
                    variant={filterStatus === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus('all')}
                  >
                    Alle
                  </Button>
                  <Button
                    variant={filterStatus === 'Released' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus('Released')}
                  >
                    Udgivet
                  </Button>
                  <Button
                    variant={filterStatus === 'In Review' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus('In Review')}
                  >
                    Til Gennemgang
                  </Button>
                  <Button
                    variant={filterStatus === 'Draft' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus('Draft')}
                  >
                    Kladde
                  </Button>
                </div>

                {customers.length > 1 && (
                  <>
                    <div className="border-l mx-2"></div>
                    {/* Customer Filter */}
                    <div className="flex gap-2">
                      <span className="text-sm font-medium text-muted-foreground self-center">Kunde:</span>
                      <select
                        value={filterCustomer}
                        onChange={(e) => setFilterCustomer(e.target.value)}
                        className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <option value="all">Alle Kunder</option>
                        {customers.map(customer => (
                          <option key={customer} value={customer}>{customer}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredPrograms.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileCode2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Ingen programmer fundet</p>
                </div>
              ) : (
                filteredPrograms.map((program) => (
                  <div
                    key={program.id}
                    className="flex items-start justify-between p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => onSelectProgram(program)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FileCode2 className="h-5 w-5 text-blue-600" />
                        <h3 className="font-semibold">{program.name}</h3>
                        <Badge variant={getStatusVariant(program.status) as any}>
                          {program.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-2">
                        <div>
                          <span className="text-muted-foreground">Varenummer:</span>
                          <p className="font-medium">{program.partNumber} Rev {program.revision}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Kunde:</span>
                          <p className="font-medium">{program.customer}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Operation:</span>
                          <p className="font-medium">{program.operation}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Materiale:</span>
                          <p className="font-medium">{program.material}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Ændret {program.lastModified} af {program.author}</span>
                        <div className="flex gap-2 ml-auto">
                          {program.hasCAD && (
                            <span className="flex items-center gap-1 text-green-600">
                              <Box className="h-3 w-3" />
                              STEP
                            </span>
                          )}
                          {program.hasDXF && (
                            <span className="flex items-center gap-1 text-blue-600">
                              <FileText className="h-3 w-3" />
                              DXF
                            </span>
                          )}
                          {program.hasSetupSheet && (
                            <span className="flex items-center gap-1 text-purple-600">
                              <ClipboardList className="h-3 w-3" />
                              Opsætning
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                        <Download className="h-4 w-4" />
                      </Button>
                      {program.status === 'Released' && (
                        <Button variant="default" size="sm" onClick={(e) => e.stopPropagation()}>
                          <Send className="mr-2 h-4 w-4" />
                          Send
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

