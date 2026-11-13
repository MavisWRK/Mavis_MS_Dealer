const http = require("http");
const path = require("path");
const { spawn } = require("child_process");
const { randomUUID } = require("crypto");
const playbackLog = require("./playbackLog");

const sources = new Map();
let serverPromise;

function ytDlpBinary() {
  return path.join(
    process.env.YTDLP_DIR ||
      path.resolve(__dirname, "..", "node_modules", "@distube", "yt-dlp", "bin"),
    process.env.YTDLP_FILENAME || (process.platform === "win32" ? "yt-dlp.exe" : "yt-dlp"),
  );
}

function serve(request, response) {
  const source = sources.get(request.url?.slice(1));
  if (!source || request.method !== "GET") {
    response.writeHead(404).end();
    return;
  }

  let activeChild;
  let cancelled = false;
  response.once("close", () => {
    if (activeChild && !activeChild.killed && activeChild.exitCode === null) {
      cancelled = true;
      activeChild.kill();
    }
  });

  const startAttempt = (useEmbeddedClient) => {
    const args = [
      "--no-warnings",
      "--no-progress",
      "--no-playlist",
      "--force-ipv4",
      "--downloader",
      "native",
      ...(process.platform === "win32" ? ["--impersonate", "Chrome-151:Windows-10"] : []),
      ...(useEmbeddedClient ? ["--extractor-args", "youtube:player_client=web_embedded"] : []),
      "--format",
      "ba",
      "--output",
      "-",
      source.url,
    ];
    const child = spawn(ytDlpBinary(), args, { windowsHide: true });
    activeChild = child;
    source.children.add(child);
    let started = false;
    let errorOutput = "";
    child.stderr.on("data", (chunk) => {
      errorOutput = (errorOutput + chunk.toString()).slice(-2000);
    });
    child.stdout.once("data", (chunk) => {
      started = true;
      response.writeHead(200, {
        "Content-Type": "application/octet-stream",
        "Cache-Control": "no-store",
      });
      response.write(chunk);
      child.stdout.pipe(response);
    });
    child.once("error", (error) => {
      errorOutput = error.message;
    });
    child.once("close", (code) => {
      source.children.delete(child);
      if (cancelled || response.destroyed) return;
      if (!started && !useEmbeddedClient) {
        startAttempt(true);
        return;
      }
      if (code !== 0) playbackLog("yt-dlp", `Streaming failed (${code}): ${errorOutput}`);
      if (!started && !response.headersSent) response.writeHead(502);
      response.end();
    });
  };

  startAttempt(false);
}

async function startServer() {
  if (!serverPromise) {
    serverPromise = new Promise((resolve, reject) => {
      const server = http.createServer(serve);
      server.once("error", reject);
      server.listen(0, "127.0.0.1", () => resolve(server));
    });
  }
  return serverPromise;
}

async function registerStream(url) {
  const server = await startServer();
  const key = randomUUID();
  sources.set(key, { url, children: new Set() });
  return { key, url: `http://127.0.0.1:${server.address().port}/${key}` };
}

function release(key) {
  const source = sources.get(key);
  if (!source) return;
  sources.delete(key);
  for (const child of source.children) child.kill();
}

module.exports = { registerStream, release };
