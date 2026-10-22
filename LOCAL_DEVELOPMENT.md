# Run JarSol locally

## About

JarSol is an experimental Solana dashboard with wallet balance reads, local cryptography demonstrations and a repository deployment registry. Balance reads verify the selected network. The browser does not deploy tokens, operate a paid agent service or perform a legal review. AI access needs a separately configured service and user authorization; no provider success is fabricated.

## Start the development app

Install Node.js 24 and Git. Open a terminal in this repository, then run:

```text
npm ci
npm start
```

Keep that terminal running. Open [http://127.0.0.1:5173/](http://127.0.0.1:5173/) or [http://localhost:5173/](http://localhost:5173/). The frontend proxies API calls to the loopback backend on port 3001. [Backend health](http://127.0.0.1:3001/api/health) describes configuration; it does not prove every external service is connected.

No operator credential, wallet key or AI API key is needed to open the app. The default server network is Devnet. Optional configuration starts from .env.example; leave secret fields blank unless you deliberately configure a reviewed server operation. Keep .env and keypair files outside Git, and keep signing files outside the checkout. See [backend security](BACKEND_SECURITY.md).

The server and frontend use fixed ports and startup fails if a port is busy. Stop only your own existing terminal with Ctrl+C, or choose an explicit free frontend port:

```text
npm run dev -- --port 5174
```

That command starts only a frontend; backend features need the separately running JarSol backend. Do not assume that another application using port 3001 is JarSol.

## Test and preview

```text
npm test
npm run test:quantum
npm run build
npm run preview
```

After a successful build, preview opens at [http://127.0.0.1:4173/](http://127.0.0.1:4173/). Preview serves the built frontend; it does not start a backend. Stop a server or preview with Ctrl+C.

localhost refers to your computer, not public hosting. The deployed browser prototype is [JarSol on GitHub Pages](https://elon00.github.io/jarsol-web4-automaton/). Unavailable providers, failed reads and unimplemented operations must remain explicit. CI, testnet evidence, independent security review, operations and market acceptance are separate gates.
