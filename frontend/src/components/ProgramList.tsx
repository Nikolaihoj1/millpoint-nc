import { useState, useMemo, useEffect } from 'react';
import { usePrograms } from '../hooks';
import { programsApi, machinesApi } from '../api';
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
  onCreateNew?: () => void;
}

export function ProgramList({ onSelectProgram, onCreateNew }: ProgramListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterMachine, setFilterMachine] = useState<string>('all');
  const [filterCustomer, setFilterCustomer] = useState<string>('all');

  // Fetch programs via API
  const { programs, loading, error } = usePrograms({
    search: searchTerm || undefined,
    status: filterStatus !== 'all' ? (filterStatus as any) : undefined,
    customer: filterCustomer !== 'all' ? filterCustomer : undefined,
    sortBy: 'lastModified',
    sortOrder: 'desc',
    limit: 100,
  });

  const [machineOptions, setMachineOptions] = useState<{ id: string; name: string }[]>([]);
  useEffect(() => {
    (async () => {
      try {
        const res = await machinesApi.getAll();
        if (res.success && res.data) {
          setMachineOptions(res.data.map(m => ({ id: (m as any).id, name: (m as any).name })));
        }
      } catch {}
    })();
  }, []);

  // Get unique customers and machines for filters
  const customers = useMemo(() => {
    const unique = Array.from(new Set((programs || []).map(p => p.customer)));
    return unique.sort();
  }, [programs]);

  const filteredPrograms = (programs || []).filter((program) => {
    // Search across multiple fields
    const matchesSearch = searchTerm === '' || 
      program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.machine.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (program.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    
    const matchesStatus = filterStatus === 'all' || program.status === filterStatus;
    const matchesMachine = filterMachine === 'all' || (program as any).machine?.id === filterMachine || (program as any).machine?.name === filterMachine;
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

  const hasActiveFilters = filterStatus !== 'all' || filterMachine !== 'all' || filterCustomer !== 'all' || !!searchTerm;

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
          <Button
            onClick={async () => {
              if (onCreateNew) {
                onCreateNew();
                return;
              }
              try {
                // Ensure at least one machine exists
                const machinesRes = await machinesApi.getAll();
                const machinesList = machinesRes.success && machinesRes.data ? machinesRes.data : [];
                if (!machinesList.length) {
                  alert('Ingen maskiner fundet. Opret en maskine først under Maskiner.');
                  return;
                }

                const name = prompt('Programnavn');
                if (!name) return;
                const partNumber = prompt('Varenummer');
                if (!partNumber) return;
                const revision = prompt('Revision (f.eks. A)') || 'A';
                const operation = prompt('Operation') || 'Bearbejdning';
                const material = prompt('Materiale') || 'Aluminium';
                const customer = prompt('Kunde') || 'Ukendt';

                // Pick first machine for simplicity
                const machineId = (machinesList[0] as any).id;

                const res = await programsApi.create({
                  name,
                  partNumber,
                  revision,
                  machineId,
                  operation,
                  material,
                  customer,
                  status: 'Draft' as any,
                } as any);

                if (res.success) {
                  // Simple refresh via search toggle
                  setSearchTerm(prev => prev + '');
                  alert('Program oprettet.');
                } else {
                  alert('Kunne ikke oprette program.');
                }
              } catch (e:any) {
                alert('Fejl ved oprettelse: ' + (e?.message || e));
              }
            }}
          >
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
                {machineOptions.map(machine => (
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
            {loading ? 'Henter programmer...' : error ? 'Fejl ved hentning' : `Viser ${filteredPrograms.length} programmer`}
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
                    <p className="font-medium">{(program as any).machine?.name || '—'}</p>
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
                  <span>Ændret {program.lastModified} af {(program as any).author?.name || (program as any).author || '—'}</span>
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
