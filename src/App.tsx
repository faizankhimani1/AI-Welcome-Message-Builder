import { useMemo, useState } from "react";

type ButtonConfig = {
  label: string;
  intent: string;
};

type ColorRGB = {
  r: number;
  g: number;
  b: number;
};

const DEFAULT_STORYBOARD = `Additional Features

Prospect Qualification (Demo Simulation)

Preliminary Quote Estimation (Indicative)

State-Specific Insurance Awareness

Lead Scoring & CRM Push (Demo Simulation)

Appointment Scheduling with Licensed Agents

Policy Comparison Guidance

Compliance Disclaimer Handling

Consent Capture & Data Privacy Acknowledgment

Follow-Up Reminder Simulation

Insurance Prospect Use Cases

Use Case 1 - Insurance Coverage Exploration

Auto insurance overview

Home insurance overview

Life insurance basics

Health coverage awareness

Commercial insurance guidance

Use Case 2 - Prospect Qualification & Lead Capture

ZIP code capture

Vehicle/property details collection

Household details

Existing coverage information

Claims history awareness

Use Case 3 - Preliminary Quote Request

Monthly premium estimate (indicative)

Coverage limit selection

Deductible options

Policy term awareness (6-month / 12-month)

Use Case 4 - Appointment Scheduling with Licensed Agent

Consultation booking

Preferred time zone confirmation (PST)

Phone/email confirmation

Rescheduling guidance

Frequently Asked Questions (FAQ)

How do I get an auto insurance quote?

How do I schedule a consultation?

Greetings and Common Messages

Welcome Messages

Welcome to TrustNet Tech Insurance Solutions. How may I assist you today?`;

const DEFAULT_COLOR: ColorRGB = { r: 101, g: 0, b: 179 };

const DEFAULT_BUTTONS: ButtonConfig[] = [
  {
    label: "Account Services",
    intent: "I would like to check my account balance",
  },
  {
    label: "Debit Card Services",
    intent: "I need help with my debit card",
  },
  {
    label: "Transactions & Disputes",
    intent: "I have a transaction issue or dispute",
  },
  {
    label: "Apply for a Loan",
    intent: "I would like to apply for a loan",
  },
];

const sanitizeLines = (text: string) =>
  text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

const toTitleCase = (text: string) =>
  text
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const compactButtonLabel = (text: string) => {
  const cleaned = text
    .replace(/\(.*?\)/g, "")
    .replace(/[^a-zA-Z0-9&\s/-]/g, " ")
    .replace(/[/-]/g, " ")
    .trim();

  const words = cleaned.split(/\s+/).filter(Boolean);
  const stopWords = new Set([
    "and",
    "the",
    "for",
    "with",
    "to",
    "of",
    "a",
    "an",
    "specific",
    "preliminary",
    "additional",
    "demo",
    "simulation",
    "awareness",
    "guidance",
    "handling",
    "information",
    "details",
    "overview",
    "basics",
  ]);

  const filtered = words.filter((word) => !stopWords.has(word.toLowerCase()));
  const picked = (filtered.length >= 2 ? filtered : words).slice(0, 3);
  const compact = toTitleCase(picked.join(" "));

  return compact || "Support";
};

const clampColor = (value: number) => Math.max(0, Math.min(255, Math.round(value)));

const getDomainHint = (lines: string[]) => {
  const joined = lines.join(" ").toLowerCase();
  if (joined.includes("insurance")) return "Insurance";
  if (joined.includes("bank")) return "Retail Banking";
  if (joined.includes("health")) return "Healthcare";
  if (joined.includes("travel")) return "Travel";
  if (joined.includes("telecom")) return "Telecom";
  return "Customer";
};

const pickWelcomeTitle = (lines: string[], domain: string) => {
  const welcomeLine = lines.find((line) => /^(welcome|hello)/i.test(line));
  if (welcomeLine) {
    const firstSentence = welcomeLine.split(/[.!?]/)[0]?.trim();
    if (firstSentence && firstSentence.length > 8) {
      return firstSentence;
    }
  }
  return `Welcome to ${domain} Support`;
};

const pickDescription = (lines: string[], domain: string) => {
  const normalized = lines.join(" ").toLowerCase();
  const phrases: string[] = [];
  const addPhrase = (condition: boolean, text: string) => {
    if (condition && !phrases.includes(text)) {
      phrases.push(text);
    }
  };

  if (domain === "Insurance") {
    addPhrase(/coverage|policy/.test(normalized), "coverage exploration and policy guidance");
    addPhrase(/quote|premium|deductible/.test(normalized), "quote requests and premium awareness");
    addPhrase(/qualification|lead|capture/.test(normalized), "prospect qualification and lead capture");
    addPhrase(/appointment|schedule|consultation/.test(normalized), "consultation scheduling");
    addPhrase(/compliance|privacy|consent/.test(normalized), "compliance and data privacy support");
    addPhrase(/follow-up|status|reminder|document/.test(normalized), "follow-up and status tracking");
  }

  if (domain === "Retail Banking") {
    addPhrase(/account/.test(normalized), "account services");
    addPhrase(/debit|card/.test(normalized), "debit card support");
    addPhrase(/transaction|dispute/.test(normalized), "transaction issue resolution");
    addPhrase(/loan/.test(normalized), "loan-related requests");
    addPhrase(/service request|general/.test(normalized), "general banking queries");
  }

  if (!phrases.length) {
    return `I am your AI Agent. I can assist you with ${domain.toLowerCase()} questions, service requests, and follow-up support.`;
  }

  const limited = phrases.slice(0, 5);
  const capabilityText =
    limited.length === 1
      ? limited[0]
      : `${limited.slice(0, -1).join(", ")}, and ${limited[limited.length - 1]}`;

  return `I am your AI Agent. I can assist you with ${capabilityText}.`;
};

const baseIntentFromLabel = (label: string, sourceText?: string) => {
  const normalized = `${label} ${sourceText ?? ""}`.toLowerCase();

  if (normalized.includes("quote") || normalized.includes("premium") || normalized.includes("deductible")) {
    return "I want to request an insurance quote";
  }
  if (normalized.includes("schedule") || normalized.includes("appointment") || normalized.includes("consultation")) {
    return "I want to schedule a consultation";
  }
  if (normalized.includes("policy") || normalized.includes("plan") || normalized.includes("compare")) {
    return "I want to compare policy options";
  }
  if (normalized.includes("lead") || normalized.includes("qualification") || normalized.includes("prospect")) {
    return "I want to complete a quick qualification check";
  }
  if (normalized.includes("zip") || normalized.includes("vehicle") || normalized.includes("property")) {
    return "I want to share my details for eligibility";
  }
  if (normalized.includes("follow") || normalized.includes("status") || normalized.includes("reference")) {
    return "I want to check my request status";
  }
  if (normalized.includes("document")) return "I need help with document submission";
  if (normalized.includes("compliance") || normalized.includes("privacy")) {
    return "I need help understanding compliance and data privacy";
  }
  if (normalized.includes("claim")) return "I need help with claim-related questions";
  if (normalized.includes("coverage")) return "I want to explore coverage options";
  if (normalized.includes("crm") || normalized.includes("scoring")) {
    return "I want to continue with lead scoring and follow-up";
  }
  if (normalized.includes("account")) return "I would like to check my account balance";
  if (normalized.includes("debit") || normalized.includes("card")) return "I need help with my debit card";
  if (normalized.includes("transaction") || normalized.includes("dispute")) {
    return "I have a transaction issue or dispute";
  }
  if (normalized.includes("loan")) return "I would like to apply for a loan";
  return `I need help with ${label.toLowerCase()}`;
};

const extractButtonPool = (lines: string[]) => {
  const pool: ButtonConfig[] = [];
  const byLabel = new Set<string>();

  const pushItem = (rawText: string) => {
    const label = compactButtonLabel(rawText);
    const labelKey = label.toLowerCase();
    if (!label || byLabel.has(labelKey)) return;

    byLabel.add(labelKey);
    pool.push({
      label,
      intent: baseIntentFromLabel(label, rawText),
    });
  };

  lines
    .filter((line) => /^use case/i.test(line))
    .forEach((line) => {
      const splitByDash = line.split(/[-–]/);
      const rawText = splitByDash[splitByDash.length - 1]?.trim() || line.trim();
      pushItem(rawText.replace(/^\d+\s*/, "").trim());
    });

  lines
    .filter(
      (line) =>
        !/^use case/i.test(line) &&
        !/^additional features/i.test(line) &&
        !/^welcome/i.test(line) &&
        !/^greetings/i.test(line) &&
        !/\?$/.test(line) &&
        line.length >= 8 &&
        line.length <= 40
    )
    .forEach((line) => pushItem(line));

  return pool;
};

const ensureButtonCount = (
  current: ButtonConfig[],
  desiredCount: number,
  storyboardLines: string[]
) => {
  const safeCount = Math.max(1, desiredCount);
  if (current.length >= safeCount) return current.slice(0, safeCount);

  const pool = extractButtonPool(storyboardLines);
  const used = new Set(current.map((button) => button.label.toLowerCase()));
  const nextButtons = [...current];

  for (const buttonOption of pool) {
    if (nextButtons.length >= safeCount) break;
    if (used.has(buttonOption.label.toLowerCase())) continue;
    used.add(buttonOption.label.toLowerCase());
    nextButtons.push(buttonOption);
  }

  while (nextButtons.length < safeCount) {
    const fallbackLabel = `Support ${nextButtons.length + 1}`;
    nextButtons.push({
      label: fallbackLabel,
      intent: baseIntentFromLabel(fallbackLabel),
    });
  }

  return nextButtons;
};

const escapeHtml = (text: string) =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

const escapeJsSingleQuote = (text: string) => text.replace(/\\/g, "\\\\").replace(/'/g, "\\'");

const buildTemplateHtml = ({
  title,
  description,
  buttons,
  color,
}: {
  title: string;
  description: string;
  buttons: ButtonConfig[];
  color: ColorRGB;
}) => {
  const primaryColor = `rgba(${color.r},${color.g},${color.b},1)`;
  const shadowColor = `rgba(${color.r},${color.g},${color.b},0.15)`;
  const buttonBlocks = buttons
    .map(
      (button) => `        <button
            style="flex:1 1 45%;height:42px;border-radius:10px;border:1px solid ${primaryColor};background:rgb(255,255,255);color:${primaryColor};font-size:13px;font-weight:600;cursor:pointer;transition:all 0.2s;"
            onmouseover="this.style.background='${primaryColor}';this.style.color='rgb(255,255,255)'"
            onmouseout="this.style.background='rgb(255,255,255)';this.style.color='${primaryColor}'"
            onclick="Streebo.inAppChatBot.sendMessage('${escapeJsSingleQuote(button.intent)}')">
            ${escapeHtml(button.label)}
        </button>`
    )
    .join("\n\n");

  return `<div style="font-family:Segoe UI,Inter,Roboto,Arial,sans-serif;font-size:14px;background:rgb(255,255,255);border-radius:12px;padding:16px;margin-bottom:12px;border:1px solid ${primaryColor};box-shadow:0 6px 16px ${shadowColor};max-width:420px;">
    <p>
        <span style="font-size:17px;font-weight:700;color:${primaryColor};">
            ${escapeHtml(title)}
        </span>
        <br><br>

        <span style="color:rgb(0,0,0);">
            ${escapeHtml(description)}
        </span>
    </p>

    <div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:10px;">

${buttonBlocks}

    </div>
</div>`;
};

export default function App() {
  const [storyboard, setStoryboard] = useState(DEFAULT_STORYBOARD);
  const [title, setTitle] = useState("Welcome to Retail Banking Support(Tanzania)");
  const [description, setDescription] = useState(
    "I am your AI Agent. I can assist you with account services, debit card support, transaction disputes, service requests, loan applications, and general banking queries."
  );
  const [buttons, setButtons] = useState<ButtonConfig[]>(DEFAULT_BUTTONS);
  const [color, setColor] = useState<ColorRGB>(DEFAULT_COLOR);
  const [buttonMode, setButtonMode] = useState<"2" | "4" | "6" | "8" | "custom">("4");
  const [customCount, setCustomCount] = useState(5);
  const [copyState, setCopyState] = useState("Copy HTML");

  const desiredButtonCount = buttonMode === "custom" ? customCount : Number(buttonMode);
  const storyboardLines = useMemo(() => sanitizeLines(storyboard), [storyboard]);

  const generatedHtml = useMemo(
    () =>
      buildTemplateHtml({
        title,
        description,
        buttons,
        color,
      }),
    [title, description, buttons, color]
  );

  const previewDoc = useMemo(
    () => `<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Welcome Message Preview</title>
  </head>
  <body style="margin:0;padding:24px;background:#f8f6fc;font-family:Segoe UI,Inter,Roboto,Arial,sans-serif;display:flex;justify-content:center;align-items:flex-start;min-height:100vh;">
    ${generatedHtml}
    <script>
      window.Streebo = {
        inAppChatBot: {
          sendMessage: function(message){
            alert(message);
          }
        }
      };
    </script>
  </body>
</html>`,
    [generatedHtml]
  );

  const missingQuestions = [
    !title.trim() ? "What should the welcome title be?" : "",
    !description.trim() ? "What should the bot description say?" : "",
    buttons.some((button) => !button.label.trim()) ? "One or more button labels are missing." : "",
    buttons.some((button) => !button.intent.trim()) ? "One or more button intents are missing." : "",
  ].filter(Boolean);

  const analyzeStoryboard = () => {
    const domain = getDomainHint(storyboardLines);
    const nextTitle = pickWelcomeTitle(storyboardLines, domain);
    const nextDescription = pickDescription(storyboardLines, domain);
    const pool = extractButtonPool(storyboardLines);

    const starterButtons = (pool.length ? pool : DEFAULT_BUTTONS).slice(
      0,
      Math.max(2, desiredButtonCount)
    );

    setTitle(nextTitle);
    setDescription(nextDescription);
    setButtons(ensureButtonCount(starterButtons, desiredButtonCount, storyboardLines));
  };

  const applyButtonCount = (mode: "2" | "4" | "6" | "8" | "custom", custom = customCount) => {
    setButtonMode(mode);
    const nextCount = mode === "custom" ? custom : Number(mode);
    setButtons((prev) => ensureButtonCount(prev, nextCount, storyboardLines));
  };

  const updateButton = (index: number, key: keyof ButtonConfig, value: string) => {
    setButtons((prev) => prev.map((button, i) => (i === index ? { ...button, [key]: value } : button)));
  };

  const autoFillIntent = (index: number) => {
    setButtons((prev) =>
      prev.map((button, i) =>
        i === index
          ? {
              ...button,
              intent: baseIntentFromLabel(button.label),
            }
          : button
      )
    );
  };

  const copyHtml = async () => {
    try {
      await navigator.clipboard.writeText(generatedHtml);
      setCopyState("Copied");
      window.setTimeout(() => setCopyState("Copy HTML"), 1400);
    } catch {
      setCopyState("Clipboard blocked");
      window.setTimeout(() => setCopyState("Copy HTML"), 1600);
    }
  };

  const downloadHtml = () => {
    const blob = new Blob([generatedHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "welcome-message.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#f5f3fb] px-4 py-6 text-slate-900 md:px-8">
      <div className="mx-auto max-w-7xl">
        <header
          className="mb-6 border-b border-violet-200 pb-4"
          style={{ animation: "fadeUp 360ms ease-out" }}
        >
          <h1 className="text-2xl font-semibold text-violet-900">AI Welcome Message Builder</h1>
          <p className="mt-1 text-sm text-slate-600">
            Template-locked local generator for Streebo welcome message HTML.
          </p>
        </header>

        <main className="grid gap-6 lg:grid-cols-[1.05fr_1fr]">
          <section
            className="space-y-4 border border-violet-200 bg-white p-4"
            style={{ animation: "fadeUp 450ms ease-out" }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Storyboard Input</h2>
              <button
                type="button"
                onClick={analyzeStoryboard}
                className="cursor-pointer border border-violet-700 px-3 py-2 text-sm font-semibold text-violet-700 transition hover:bg-violet-700 hover:text-white"
              >
                Analyze Storyboard
              </button>
            </div>

            <textarea
              value={storyboard}
              onChange={(event) => setStoryboard(event.target.value)}
              className="h-80 w-full resize-y border border-slate-300 p-3 font-mono text-xs leading-5 outline-none transition focus:border-violet-700"
              placeholder="Paste your storyboard here"
            />

            <div className="space-y-3 border-t border-slate-200 pt-3">
              <h3 className="text-sm font-semibold text-slate-800">Customization Panel</h3>
              <label className="block text-xs font-medium text-slate-700">Welcome Title</label>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="w-full border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-violet-700"
              />

              <label className="block text-xs font-medium text-slate-700">Description</label>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="h-24 w-full resize-y border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-violet-700"
              />

              <div className="grid gap-2 sm:grid-cols-3">
                <label className="text-xs font-medium text-slate-700">
                  R
                  <input
                    type="number"
                    min={0}
                    max={255}
                    value={color.r}
                    onChange={(event) =>
                      setColor((prev) => ({ ...prev, r: clampColor(Number(event.target.value) || 0) }))
                    }
                    className="mt-1 w-full border border-slate-300 px-2 py-2 text-sm outline-none transition focus:border-violet-700"
                  />
                </label>
                <label className="text-xs font-medium text-slate-700">
                  G
                  <input
                    type="number"
                    min={0}
                    max={255}
                    value={color.g}
                    onChange={(event) =>
                      setColor((prev) => ({ ...prev, g: clampColor(Number(event.target.value) || 0) }))
                    }
                    className="mt-1 w-full border border-slate-300 px-2 py-2 text-sm outline-none transition focus:border-violet-700"
                  />
                </label>
                <label className="text-xs font-medium text-slate-700">
                  B
                  <input
                    type="number"
                    min={0}
                    max={255}
                    value={color.b}
                    onChange={(event) =>
                      setColor((prev) => ({ ...prev, b: clampColor(Number(event.target.value) || 0) }))
                    }
                    className="mt-1 w-full border border-slate-300 px-2 py-2 text-sm outline-none transition focus:border-violet-700"
                  />
                </label>
              </div>

              <div className="space-y-2 border-t border-slate-200 pt-3">
                <p className="text-xs font-medium text-slate-700">Button Count</p>
                <div className="flex flex-wrap gap-2">
                  {(["2", "4", "6", "8", "custom"] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => applyButtonCount(mode)}
                      className={`cursor-pointer border px-3 py-1 text-xs font-semibold transition ${
                        buttonMode === mode
                          ? "border-violet-700 bg-violet-700 text-white"
                          : "border-slate-300 text-slate-700 hover:border-violet-700 hover:text-violet-700"
                      }`}
                    >
                      {mode === "custom" ? "Custom" : mode}
                    </button>
                  ))}
                </div>

                {buttonMode === "custom" ? (
                  <label className="block text-xs font-medium text-slate-700">
                    Custom Count
                    <input
                      type="number"
                      min={1}
                      max={16}
                      value={customCount}
                      onChange={(event) => {
                        const nextCustom = Math.max(1, Number(event.target.value) || 1);
                        setCustomCount(nextCustom);
                        applyButtonCount("custom", nextCustom);
                      }}
                      className="mt-1 w-32 border border-slate-300 px-2 py-1 text-sm outline-none transition focus:border-violet-700"
                    />
                  </label>
                ) : null}
              </div>

              <div className="space-y-3 border-t border-slate-200 pt-3">
                <h4 className="text-xs font-semibold text-slate-700">Buttons and Intents</h4>
                {buttons.map((button, index) => (
                  <div key={`${button.label}-${index}`} className="space-y-1 border border-slate-200 p-2">
                    <input
                      value={button.label}
                      onChange={(event) => updateButton(index, "label", event.target.value)}
                      className="w-full border border-slate-300 px-2 py-1 text-sm outline-none transition focus:border-violet-700"
                      placeholder={`Button ${index + 1} Label`}
                    />
                    <div className="flex gap-2">
                      <input
                        value={button.intent}
                        onChange={(event) => updateButton(index, "intent", event.target.value)}
                        className="w-full border border-slate-300 px-2 py-1 text-sm outline-none transition focus:border-violet-700"
                        placeholder={`Button ${index + 1} Intent`}
                      />
                      <button
                        type="button"
                        onClick={() => autoFillIntent(index)}
                        className="cursor-pointer border border-slate-300 px-2 text-xs font-semibold text-slate-700 transition hover:border-violet-700 hover:text-violet-700"
                      >
                        Auto
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="space-y-4" style={{ animation: "fadeUp 520ms ease-out" }}>
            <div className="border border-violet-200 bg-white p-4">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Generated HTML</h2>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={copyHtml}
                    className="cursor-pointer border border-violet-700 px-3 py-2 text-xs font-semibold text-violet-700 transition hover:bg-violet-700 hover:text-white"
                  >
                    {copyState}
                  </button>
                  <button
                    type="button"
                    onClick={downloadHtml}
                    className="cursor-pointer border border-violet-700 px-3 py-2 text-xs font-semibold text-violet-700 transition hover:bg-violet-700 hover:text-white"
                  >
                    Download HTML
                  </button>
                </div>
              </div>

              <textarea
                readOnly
                value={generatedHtml}
                className="h-72 w-full resize-y border border-slate-300 p-3 font-mono text-xs leading-5 text-slate-800"
              />
            </div>

            <div className="border border-violet-200 bg-white p-4">
              <h2 className="mb-3 text-lg font-semibold">Live Preview</h2>
              <iframe
                key={generatedHtml}
                srcDoc={previewDoc}
                title="Welcome Message Preview"
                className="h-[430px] w-full border border-slate-200"
                sandbox="allow-scripts"
              />
            </div>

            <div className="border border-slate-300 bg-white p-4 text-xs text-slate-700">
              <p className="font-semibold text-slate-800">Template Protection Rules</p>
              <p className="mt-1">
                Locked: HTML structure, inline CSS layout, hover behavior, font settings, border radius, and
                Streebo onclick pattern.
              </p>
              <p className="mt-1">
                Allowed: title, description, button count, button labels, intents, and primary RGB color.
              </p>
              {missingQuestions.length ? (
                <p className="mt-2 text-amber-700">Missing input: {missingQuestions.join(" ")}</p>
              ) : (
                <p className="mt-2 text-emerald-700">All required dynamic fields are complete.</p>
              )}
            </div>
          </section>
        </main>
      </div>

      <style>{`@keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <footer className="mx-auto mt-6 max-w-7xl border-t border-violet-200 pt-4 text-center text-xs text-slate-600">
        <a
          href="https://faizankhimani.netlify.app/"
          target="_blank"
          rel="noreferrer"
          className="font-medium text-violet-700 underline-offset-2 transition hover:underline"
        >
          Developed and Designed by Faizan Khimani
        </a>
      </footer>
    </div>
  );
}
