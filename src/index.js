const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { execFile, execFileSync } = require('child_process');

const app = express();
const port = process.env.PORT || 3000;
const root = path.join(__dirname, '..');
const source = path.join(root, 'browser_stack.cpp');
const executable = path.join(root, process.platform === 'win32' ? 'browser_stack.exe' : 'browser_stack');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(root, 'public')));

function ensureEngine() {
  if (fs.existsSync(executable)) return;
  const outputArguments = process.platform === 'win32' ? ['-o', executable] : ['-o', executable];
  try {
    execFileSync('g++', ['-std=c++17', '-O2', source, ...outputArguments], { stdio: 'pipe' });
  } catch (error) {
    throw new Error('The C++ stack engine could not be compiled. Install g++ and try again.');
  }
}

function cleanItems(items) {
  if (!Array.isArray(items)) return [];
  return items.filter(item => typeof item === 'string' && item.length > 0 && !item.includes('|'));
}

app.post('/api/browser/action', (request, response) => {
  const { action, current = '', backStack = [], forwardStack = [], url = '' } = request.body || {};
  if (!['visit', 'back', 'forward'].includes(action)) {
    return response.status(400).json({ error: 'Action must be visit, back, or forward.' });
  }
  if (action === 'visit' && (typeof url !== 'string' || !url.trim())) {
    return response.status(400).json({ error: 'A page name or URL is required.' });
  }
  if (typeof current !== 'string' || current.includes('|')) {
    return response.status(400).json({ error: 'Invalid current page.' });
  }

  try {
    ensureEngine();
    const argumentsList = [
      action,
      current,
      cleanItems(backStack).join('|'),
      cleanItems(forwardStack).join('|'),
    ];
    if (action === 'visit') argumentsList.push(url.trim());
    execFile(executable, argumentsList, { maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) {
        console.error('C++ stack error:', stderr || error.message);
        return response.status(500).json({ error: 'The C++ stack engine failed.' });
      }
      try {
        return response.json(JSON.parse(stdout));
      } catch (parseError) {
        console.error('Invalid stack engine response:', parseError.message);
        return response.status(500).json({ error: 'The C++ stack engine returned invalid data.' });
      }
    });
  } catch (error) {
    console.error('Stack engine setup error:', error.message);
    return response.status(503).json({ error: error.message });
  }
});

app.get('/api/health', (request, response) => {
  response.json({ status: 'OK', message: 'C++ browser stack engine is running' });
});

app.listen(port, () => {
  console.log(`Browser stack website is running on port ${port}`);
});
