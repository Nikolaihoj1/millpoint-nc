import { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { ProgramList } from './components/ProgramList';
import { ProgramDetail } from './components/ProgramDetail';
import { MachinesView } from './components/MachinesView';
import { SetupSheetPreview } from './components/SetupSheetPreview';
import type { NCProgram } from './types';
import {
  LayoutDashboard,
  FileCode2,
  Server,
  Settings,
  Search,
  Bell,
  User,
  Menu,
  X,
} from 'lucide-react';
import { Button } from './components/ui/Button';
import { Input } from './components/ui/Input';

type View = 'dashboard' | 'programs' | 'machines' | 'settings';

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedProgram, setSelectedProgram] = useState<NCProgram | null>(null);
  const [showSetupSheet, setShowSetupSheet] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navigation = [
    { name: 'Dashboard', icon: LayoutDashboard, view: 'dashboard' as View },
    { name: 'NC Programmer', icon: FileCode2, view: 'programs' as View },
    { name: 'Maskiner', icon: Server, view: 'machines' as View },
    { name: 'Indstillinger', icon: Settings, view: 'settings' as View },
  ];

  const handleNavigation = (view: View) => {
    setCurrentView(view);
    setSelectedProgram(null);
    setShowSetupSheet(false);
  };

  const handleSelectProgram = (program: NCProgram) => {
    setSelectedProgram(program);
    setShowSetupSheet(false);
  };

  const handleBackFromProgram = () => {
    setSelectedProgram(null);
    setShowSetupSheet(false);
  };

  const handleViewSetupSheet = () => {
    if (selectedProgram) {
      setShowSetupSheet(true);
    }
  };

  const handleBackFromSetupSheet = () => {
    setShowSetupSheet(false);
  };

  const renderContent = () => {
    // Setup Sheet Preview (within program context)
    if (showSetupSheet && selectedProgram) {
      return (
        <SetupSheetPreview 
          programId={selectedProgram.id} 
          onBack={handleBackFromSetupSheet}
        />
      );
    }

    // Program Detail
    if (selectedProgram) {
      return (
        <ProgramDetail 
          program={selectedProgram} 
          onBack={handleBackFromProgram} 
          onViewSetupSheet={handleViewSetupSheet}
        />
      );
    }

    // Main Views
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'programs':
        return <ProgramList onSelectProgram={handleSelectProgram} />;
      case 'machines':
        return <MachinesView onSelectProgram={handleSelectProgram} />;
      case 'settings':
        return (
          <div className="space-y-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Indstillinger</h2>
              <p className="text-muted-foreground">Konfigurer dit NC-styringssystem</p>
            </div>
            <div className="text-center py-12 text-muted-foreground">
              <Settings className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>Indstillingsvisning - Godkendelse, arbejdsgange, valideringsregler</p>
            </div>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-4 gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          <div className="flex items-center gap-2 font-bold text-xl">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <FileCode2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="hidden sm:inline">MillPoint NC</span>
          </div>

          <div className="flex-1 max-w-md ml-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Hurtig søgning..."
                className="pl-9 bg-muted/50"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed md:sticky top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r bg-background transition-transform duration-200 ease-in-out md:translate-x-0`}
        >
          <nav className="space-y-1 p-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.view && !selectedProgram && !showSetupSheet;
              return (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.view)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-7xl">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
