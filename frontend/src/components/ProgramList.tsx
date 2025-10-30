import { useState, useMemo } from 'react';
import { mockPrograms, machines } from '../data/mockData';
import type { NCProgram } from '../types';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';
import { 
  Search, 
  Filter, 
  Upload, 
  FileCode2, 
  Box, 
  FileText, 
  ClipboardList,
  Eye,
  Download,
  Send,
  X
} from 'lucide-react';

interface ProgramListProps {
  onSelectProgram: (program: NCProgram) => void;
}

export function ProgramList({ onSelectProgram }: ProgramListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterMachine, setFilterMachine] = useState<string>('all');
  const [filterCustomer, setFilterCustomer] = useState<string>('all');

  // Get unique customers and machines for filters
  const customers = useMemo(() => {
    const unique = Array.from(new Set(mockPrograms.map(p => p.customer)));
    return unique.sort();
  }, []);

  const filteredPrograms = mockPrograms.filter((program) => {
    // Search across multiple fields
    const matchesSearch = searchTerm === '' || 
      program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.machine.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (program.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    
    const matchesStatus = filterStatus === 'all' || program.status === filterStatus;
    const matchesMachine = filterMachine === 'all' || program.machine === filterMachine;
    const matchesCustomer = filterCustomer === 'all' || program.customer === filterCustomer;
    
    return matchesSearch && matchesStatus && matchesMachine && matchesCustomer;
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

  const hasActiveFilters = filterStatus !== 'all' || filterMachine !== 'all' || filterCustomer !== 'all';

  const clearFilters = () => {
    setFilterStatus('all');
    setFilterMachine('all');
    setFilterCustomer('all');
    setSearchTerm('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">NC Programmer</h2>
          <p className="text-muted-foreground">Administrer og organiser dine NC-programmer</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Importer
          </Button>
          <Button>
            <FileCode2 className="mr-2 h-4 w-4" />
            Nyt Program
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Søg: varenummer, kunde, maskine, beskrivelse..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Filter Row */}
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

            <div className="border-l mx-2"></div>

            {/* Machine Filter */}
            <div className="flex gap-2">
              <span className="text-sm font-medium text-muted-foreground self-center">Maskine:</span>
              <select
                value={filterMachine}
                onChange={(e) => setFilterMachine(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="all">Alle Maskiner</option>
                {machines.map(machine => (
                  <option key={machine.id} value={machine.id}>{machine.name}</option>
                ))}
              </select>
            </div>

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

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="mr-2 h-4 w-4" />
                Ryd Filtre
              </Button>
            )}
          </div>

          {/* Results Count */}
          <div className="text-sm text-muted-foreground">
            Viser {filteredPrograms.length} af {mockPrograms.length} programmer
          </div>
        </div>
      </Card>

      {/* Program List */}
      <div className="space-y-2">
        {filteredPrograms.map((program) => (
          <Card
            key={program.id}
            className="p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onSelectProgram(program)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <FileCode2 className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-lg">{program.name}</h3>
                  <Badge variant={getStatusVariant(program.status) as any}>
                    {program.status}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm mb-3">
                  <div>
                    <span className="text-muted-foreground">Varenummer:</span>
                    <p className="font-medium">{program.partNumber} Rev {program.revision}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Kunde:</span>
                    <p className="font-medium">{program.customer}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Maskine:</span>
                    <p className="font-medium">{program.machine}</p>
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

                {program.description && (
                  <p className="text-sm text-muted-foreground mb-3">{program.description}</p>
                )}

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Ændret {program.lastModified} af {program.author}</span>
                  {program.workOrder && <span>AO: {program.workOrder}</span>}
                  
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
                    Send til Maskine
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredPrograms.length === 0 && (
        <Card className="p-12 text-center">
          <FileCode2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Ingen programmer fundet</h3>
          <p className="text-muted-foreground mb-4">Prøv at justere din søgning eller filtre</p>
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters}>
              <X className="mr-2 h-4 w-4" />
              Ryd Alle Filtre
            </Button>
          )}
        </Card>
      )}
    </div>
  );
}
