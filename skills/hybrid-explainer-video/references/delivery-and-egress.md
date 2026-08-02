# Getting local clips to Higgsfield (and why the obvious ways fail)

The animation is rendered on your machine; the narration lives on Higgsfield. To mux them
you need one of the two to travel. In a sandboxed or policy-controlled environment, the
obvious routes are frequently blocked, so it is worth knowing the failure signatures
before you spend time on them.

## The three routes, in order of preference

### 1. Serve the clips from a public URL and import them (usually works)

`media_import_url` runs on Higgsfield's servers, not yours, so your own egress policy is
irrelevant. Anything publicly fetchable works.

If the project lives in a **public** GitHub repo, commit the clips, push, and import via
jsDelivr:

```
https://cdn.jsdelivr.net/gh/<owner>/<repo>@<commit-sha>/path/to/block-01.mp4
```

Pin the **commit SHA**, not the branch. Branch names containing slashes
(`claude/my-feature`) are ambiguous in these URLs, and a SHA also guarantees you import
the bytes you just rendered.

**`raw.githubusercontent.com` does not work for this.** It serves `.mp4` as
`application/octet-stream` and the importer rejects it:

```
URL import failed: Unsupported content-type: application/octet-stream
```

jsDelivr serves the correct `video/mp4`. Its per-file limit for the `gh` endpoint is
around 20 MB, which a 10-second 1080p block sits comfortably under (2–6 MB typical).

Note the tradeoff and mention it to the user: this commits video files into the repo, and
the pipeline depends on the repo staying public.

### 2. Upload directly (blocked in many sandboxes)

`media_upload` returns presigned S3 URLs to `PUT` to. Clean when it works. In a
restricted environment it fails at the proxy before TLS:

```
curl: (56) CONNECT tunnel failed, response 403
```

### 3. Download the narration and mux locally (usually blocked, and needs local TTS)

Requires fetching the audio from the Higgsfield CDN, which is commonly blocked the same
way. Local TTS alternatives tend to be blocked too — `edge-tts` needs
`speech.platform.bing.com`, and good offline neural voices (Piper, Kokoro) download models
from Hugging Face. Offline synthesis that needs no network at all (espeak-ng) sounds far
worse than a preset voice and is not worth shipping in a narration.

## Diagnosing egress quickly

```bash
curl -sS "$HTTPS_PROXY/__agentproxy/status" | python3 -m json.tool | head -40
```

`recentRelayFailures` names the exact host that was refused. Two failure classes look
similar but are not:

- **`connect_rejected` / 403 on CONNECT** — organization policy. Do not retry or route
  around it. Report the blocked host to the user and change approach.
- **`CERTIFICATE_VERIFY_FAILED` / self-signed certificate in chain** — the tool is not
  reading the proxy CA. This is fixable: point it at `/root/.ccr/ca-bundle.crt` via the
  tool's own mechanism (`SSL_CERT_FILE`, `NODE_EXTRA_CA_CERTS`, `--cacert`, or by
  replacing the SSL context for libraries that pin `certifi`).

Never disable TLS verification and never unset `HTTPS_PROXY` to get around either one.

## Assembly

```
explainer_video({
  width: 1920, height: 1080,
  subtitles: { font: "patrick" },      // omit for no captions
  items: [ { video: <media_id>, audio: <audio_job_id> }, ... ]  // play order
})
```

Each block is a fixed window: a shorter take is centred in silence, a slightly longer one
is sped up pitch-safely, and the video is never stretched. Total runtime is therefore
exactly `blocks x block_length` — which is why the word counts in the script matter.

Assembly is free; captions cost about 0.05 credits per voiced block for transcription.

## Always keep a local silent master

Concatenate the blocks locally regardless of how assembly goes:

```bash
printf "file 'block-%02d.mp4'\n" $(seq 1 12) > concat.txt
ffmpeg -y -f concat -safe 0 -i concat.txt -c copy ../../output/silent-master.mp4
```

If every remote route fails, this is still a complete deliverable the user can watch, and
it costs nothing. A downscaled copy (`-vf scale=1280:720 -crf 26`) is worth making too —
full 1080p masters are often too large to hand over directly.
