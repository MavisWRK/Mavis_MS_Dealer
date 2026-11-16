const test = require("node:test");
const assert = require("node:assert/strict");
const { Song } = require("distube");
const { QobuzPlugin, trackIdFromUrl } = require("../structures/QobuzPlugin");
const { isCommandAvailable, isQobuzAvailable } = require("../structures/qobuzFeature");
const provider = require("../structures/qobuzProvider");
const command = require("../commands/Music/Qobuz");

test("Qobuz remains unavailable until an authorized provider is installed", async () => {
  assert.equal(isQobuzAvailable({ QOBUZ_ENABLED: false }), false);
  assert.equal(isQobuzAvailable({ QOBUZ_ENABLED: true }), false);
  assert.equal(isCommandAvailable(command, { QOBUZ_ENABLED: true }), false);

  let reply;
  await command.run(
    { config: { QOBUZ_ENABLED: false } },
    { reply: async (message) => (reply = message) },
  );
  assert.match(reply.content, /not available yet/i);
});

test("Qobuz source resolves its own tracks and requests a fresh stream at playback", async () => {
  const calls = [];
  const track = {
    id: "12345",
    title: "Example track",
    artist: "Example artist",
    duration: 180,
  };
  const plugin = new QobuzPlugin({
    getTrack: async (id) => {
      calls.push(["track", id]);
      return track;
    },
    searchTrack: async (query) => {
      calls.push(["search", query]);
      return track;
    },
    getStreamUrl: async (id) => {
      calls.push(["stream", id]);
      return `https://stream.qobuz.example/${id}`;
    },
  });

  assert.equal(trackIdFromUrl("https://open.qobuz.com/track/12345"), "12345");
  assert.equal(trackIdFromUrl("https://example.com/track/12345"), null);
  const linked = await plugin.resolve("https://open.qobuz.com/track/12345", {});
  const searched = await plugin.search("Example track", {});
  assert.ok(linked instanceof Song);
  assert.equal(linked.source, "qobuz");
  assert.equal(linked.stream.playFromSource, true);
  assert.equal(searched.name, "Example track");
  assert.deepEqual(calls, [
    ["track", "12345"],
    ["search", "Example track"],
  ]);
  assert.equal(await plugin.getStreamURL(linked), "https://stream.qobuz.example/12345");
  assert.deepEqual(calls.at(-1), ["stream", "12345"]);
});

test("the Qobuz command queues a searched Qobuz song when access is available", async () => {
  const plugin = new QobuzPlugin({
    searchTrack: async () => ({ id: "12345", title: "Example track", duration: 180 }),
  });
  const channel = { name: "Music", permissionsFor: () => ({ has: () => true }) };
  const member = { voice: { channel } };
  let queued;
  let response;
  const client = {
    config: { QOBUZ_ENABLED: true },
    qobuzPlugin: plugin,
    distube: { play: async (_channel, song) => (queued = song) },
  };
  const interaction = {
    guild: { id: "qobuz-test-guild", members: { me: {} } },
    member,
    channel: {},
    options: { getString: () => "Example track" },
    deferReply: async () => {},
    editReply: async (message) => (response = message),
  };

  provider.available = true;
  try {
    await command.run(client, interaction);
    assert.ok(queued instanceof Song);
    assert.equal(queued.source, "qobuz");
    assert.match(response, /added/i);
  } finally {
    provider.available = false;
  }
});
