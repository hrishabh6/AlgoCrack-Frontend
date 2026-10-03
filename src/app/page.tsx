import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, FlaskConical, History, Languages, Play, Send, ShieldCheck } from "lucide-react";
import { SUPPORTED_LANGUAGES } from "@/lib/constants";
import { Container } from "@/components/shared";
import { DailyChallengeCard } from "@/components/daily-challenge/DailyChallengeCard";
import { getTodayDailyChallenge } from "@/lib/api/daily-challenge-service";

const languageList = SUPPORTED_LANGUAGES.map((l) => l.label).join(" and ");

const features = [
  {
    icon: FlaskConical,
    title: "Run against sample cases",
    description:
      "Execute your code on the problem's sample inputs, edit them, or add your own cases before submitting.",
  },
  {
    icon: ShieldCheck,
    title: "Judged on hidden tests",
    description:
      "Submissions are graded against hidden test cases with runtime and memory reported per run.",
  },
  {
    icon: Languages,
    title: `${languageList} support`,
    description:
      "Write solutions in a Monaco-powered editor with syntax highlighting, formatting, and saved drafts.",
  },
  {
    icon: History,
    title: "Track your history",
    description:
      "Review every submission, see solved counts by difficulty, and follow your activity over the year.",
  },
];

const steps = [
  { label: "Pick a problem", detail: "Filter by difficulty, tag, or search by title." },
  { label: "Run your code", detail: "Iterate quickly on sample and custom inputs." },
  { label: "Submit", detail: "Get an official verdict with runtime and memory." },
];

export default async function HomePage() {
  const dailyChallenge = await getTodayDailyChallenge({ server: true });

  return (
    <div className="flex flex-col">
      <section className="border-b">
        <Container className="grid items-center gap-12 py-16 md:py-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] xl:gap-20 2xl:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
          <div className="max-w-xl">
            <p className="mb-4 inline-flex items-center gap-2 rounded-md border bg-surface px-2 py-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
              Interview practice
            </p>
            <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-5xl">
              Solve problems.
              <br />
              <span className="text-primary">Ship clean solutions.</span>
            </h1>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
              Practice algorithmic problems in a focused editor, run them against test cases, and
              get judged on hidden tests — all in one workspace.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/problems">
                  Start practicing
                  <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/auth/signup">Create an account</Link>
              </Button>
            </div>
          </div>

          <EditorPreview />
        </Container>
      </section>

      <section className="border-b bg-surface/30">
        <Container className="py-10 md:py-12">
          <DailyChallengeCard challenge={dailyChallenge} />
        </Container>
      </section>

      <section className="border-b">
        <Container className="py-16">
          <div className="max-w-2xl">
            <h2 className="text-xl font-semibold tracking-tight">Built around the practice loop</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Everything you need to go from reading a problem to an accepted solution.
            </p>
          </div>
          <div className="mt-10 grid gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.title} className="bg-card p-5">
                <feature.icon className="size-5 text-primary" aria-hidden="true" />
                <h3 className="mt-4 text-sm font-semibold">{feature.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section>
        <Container className="flex flex-col gap-10 py-16 lg:flex-row lg:items-center lg:justify-between xl:gap-16">
          <ol className="grid max-w-5xl flex-1 gap-6 sm:grid-cols-3 xl:gap-10">
            {steps.map((step, index) => (
              <li key={step.label} className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-md border bg-surface font-mono text-xs text-primary">
                  {index + 1}
                </span>
                <div>
                  <p className="text-sm font-medium">{step.label}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{step.detail}</p>
                </div>
              </li>
            ))}
          </ol>
          <Button asChild size="lg" className="self-start lg:self-auto">
            <Link href="/problems">
              Browse problems
              <ArrowRight />
            </Link>
          </Button>
        </Container>
      </section>
    </div>
  );
}

const previewLines: Array<Array<[string, string?]>> = [
  [["class ", "text-selected"], ["Solution", "text-warning"], [" {"]],
  [["  public int", "text-selected"], ["[] "], ["twoSum", "text-info"], ["(int[] nums, int target) {"]],
  [["    Map", "text-warning"], ["<Integer, Integer> seen = "], ["new ", "text-selected"], ["HashMap<>();"]],
  [["    for ", "text-selected"], ["(int i = 0; i < nums.length; i++) {"]],
  [["      int ", "text-selected"], ["need = target - nums[i];"]],
  [["      if ", "text-selected"], ["(seen.containsKey(need))"]],
  [["        return ", "text-selected"], ["new int", "text-selected"], ["[]{seen.get(need), i};"]],
  [["      seen.put(nums[i], i);"]],
  [["    }"]],
  [["    return ", "text-selected"], ["new int", "text-selected"], ["[0];"]],
  [["  }"]],
  [["}"]],
];

function EditorPreview() {
  return (
    <div
      aria-hidden="true"
      className="relative overflow-hidden rounded-lg border bg-card shadow-[0_24px_60px_-30px_rgba(0,0,0,0.6)]"
    >
      <div className="flex h-10 items-center justify-between border-b bg-surface-2 px-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded border bg-muted px-1.5 py-0.5 font-mono">Java</span>
          <span className="font-mono">Solution.java</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-flex h-6 items-center gap-1 rounded-md border px-2 text-[11px] text-muted-foreground">
            <Play className="size-3" /> Run
          </span>
          <span className="inline-flex h-6 items-center gap-1 rounded-md bg-primary px-2 text-[11px] font-medium text-primary-foreground">
            <Send className="size-3" /> Submit
          </span>
        </div>
      </div>
      <pre className="overflow-x-auto px-0 py-3 font-mono text-[12.5px] leading-6 2xl:py-4 2xl:text-[13.5px] 2xl:leading-7">
        {previewLines.map((tokens, i) => (
          <div key={i} className="flex">
            <span className="w-10 shrink-0 select-none pr-3 text-right text-subtle-foreground">
              {i + 1}
            </span>
            <code className="whitespace-pre text-foreground/90">
              {tokens.map(([text, cls], j) => (
                <span key={j} className={cls}>
                  {text}
                </span>
              ))}
            </code>
          </div>
        ))}
      </pre>
      <div className="flex items-center gap-3 border-t bg-surface-2 px-3 py-2 font-mono text-[11px]">
        <span className="inline-flex items-center gap-1.5 text-success">
          <span className="size-1.5 rounded-full bg-success" />
          Accepted
        </span>
        <span className="text-muted-foreground">runtime 2 ms</span>
        <span className="text-muted-foreground">memory 44.1 MB</span>
      </div>
    </div>
  );
}
