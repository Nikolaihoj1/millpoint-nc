/**
 * G-code language definition for Monaco Editor
 * Supports Fanuc and Heidenhain G-code syntax highlighting
 */

/**
 * Register G-code language with syntax highlighting
 */
export function registerGCodeLanguage(monaco: any) {
  // Register Fanuc G-code language
  monaco.languages.register({ id: 'fanuc-gcode' });
  
  monaco.languages.setMonarchTokensProvider('fanuc-gcode', {
    tokenizer: {
      root: [
        // Comments (in parentheses)
        [/\([^)]*\)/, 'comment'],
        // Block numbers (N followed by digits)
        [/N\d+/, 'number'],
        // Program numbers (O followed by digits)
        [/O\d+/, 'number'],
        // G-codes
        [/G\d+/, 'keyword'],
        // M-codes
        [/M\d+/, 'keyword'],
        // Coordinate words (X, Y, Z, etc.)
        [/\b([XYZABC])\s*[+-]?\d*\.?\d*\b/i, 'type'],
        // Feed/Speed words
        [/\b([FS])\s*\d*\.?\d*\b/i, 'string'],
        // Tool words
        [/\b([THD])\s*\d*\b/i, 'variable'],
        // Percent sign (program start/end)
        [/[%]/, 'keyword'],
        // Numbers
        [/\d+\.?\d*/, 'number'],
        // Whitespace
        [/\s+/, 'white'],
      ],
    },
  });

  // Register Heidenhain G-code language
  monaco.languages.register({ id: 'heidenhain-gcode' });
  
  monaco.languages.setMonarchTokensProvider('heidenhain-gcode', {
    tokenizer: {
      root: [
        // Comments (semicolon or in parentheses)
        [/;.*$/, 'comment'],
        [/\([^)]*\)/, 'comment'],
        // Labels (LBL followed by number)
        [/LBL\s+\d+/, 'keyword'],
        // CYCL definitions
        [/CYCL\s+\d+/, 'keyword'],
        // DEF definitions
        [/DEF\s+\w+/, 'keyword'],
        // CALL statements
        [/CALL\s+\w+/, 'keyword'],
        // R parameters (R0-R99)
        [/\bR\d+\b/, 'variable'],
        // LIN, CIRC, etc.
        [/\b(LIN|CIRC|CC|ICC|CT|SL|SF|POS|ORI|PATTERN|CYCL|DEF|CALL|LBL|RET)\b/i, 'keyword'],
        // Coordinate words
        [/\b([XYZABC])\s*[+-]?\d*\.?\d*\b/i, 'type'],
        // Feed/Speed words
        [/\b([FS])\s*\d*\.?\d*\b/i, 'string'],
        // Tool words
        [/\b([THD])\s*\d*\b/i, 'variable'],
        // Numbers
        [/\d+\.?\d*/, 'number'],
        // Whitespace
        [/\s+/, 'white'],
      ],
    },
  });

  // Set up colors for both languages
  monaco.editor.defineTheme('gcode-fanuc', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
      { token: 'keyword', foreground: '569CD6', fontStyle: 'bold' },
      { token: 'number', foreground: 'B5CEA8' },
      { token: 'type', foreground: '4EC9B0' },
      { token: 'string', foreground: 'CE9178' },
      { token: 'variable', foreground: '9CDCFE' },
    ],
    colors: {
      'editor.background': '#1E1E1E',
      'editor.foreground': '#D4D4D4',
      // Diff emphasis
      'diffEditor.insertedTextBackground': '#176c2e55',
      'diffEditor.removedTextBackground': '#8b1a1a55',
      'diffEditor.insertedLineBackground': '#0f3d2055',
      'diffEditor.removedLineBackground': '#3d0f0f55',
      'diffEditor.diagonalFill': '#00000000',
      'editorOverviewRuler.addedForeground': '#22c55e',
      'editorOverviewRuler.deletedForeground': '#ef4444',
    },
  });

  monaco.editor.defineTheme('gcode-heidenhain', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
      { token: 'keyword', foreground: '569CD6', fontStyle: 'bold' },
      { token: 'number', foreground: 'B5CEA8' },
      { token: 'type', foreground: '4EC9B0' },
      { token: 'string', foreground: 'CE9178' },
      { token: 'variable', foreground: '9CDCFE' },
    ],
    colors: {
      'editor.background': '#1E1E1E',
      'editor.foreground': '#D4D4D4',
      // Diff emphasis
      'diffEditor.insertedTextBackground': '#176c2e55',
      'diffEditor.removedTextBackground': '#8b1a1a55',
      'diffEditor.insertedLineBackground': '#0f3d2055',
      'diffEditor.removedLineBackground': '#3d0f0f55',
      'diffEditor.diagonalFill': '#00000000',
      'editorOverviewRuler.addedForeground': '#22c55e',
      'editorOverviewRuler.deletedForeground': '#ef4444',
    },
  });
}

