# Stack Browser

An interactive browser back-button simulation for the Data Structures mini
project **"Implementation of a basic version of a web browser's back button
functionality [Stack]"**.

## What it demonstrates

The project models browser history with two LIFO stacks:

- **Back stack:** previously visited pages.
- **Forward stack:** pages available after pressing Back.

The C++ engine performs all state transitions:

- **Visit:** pushes the current page onto the back stack, changes the current
  page, and clears the forward stack.
- **Back:** pushes the current page onto the forward stack, then pops the
  back-stack top into the current page.
- **Forward:** pushes the current page onto the back stack, then pops the
  forward-stack top into the current page.

## Technology stack

- C++17 for the core stack logic.
- Node.js and Express for the API and static file server.
- HTML, CSS, and JavaScript for the interactive frontend.
- Render configuration in `render.yaml` for deployment.

## Run locally

```powershell
cd D:\c++\browser-back-stack-project
npm install
npm start
```

Open `http://localhost:3000`.

The server compiles `browser_stack.cpp` automatically if the executable is
missing. To compile it directly:

```powershell
g++ -std=c++17 -O2 browser_stack.cpp -o browser_stack.exe
```

## API

`POST /api/browser/action`

Example request:

```json
{
  "action": "visit",
  "current": "Home",
  "backStack": [],
  "forwardStack": [],
  "url": "About"
}
```

The response contains the updated current page, both stacks, and a status
message. The browser UI sends the current state to the C++ engine for every
operation, so the stack behavior is not reimplemented in JavaScript.
