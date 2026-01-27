import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Code2, Zap, Trophy, Users } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="w-full px-4 relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Master{" "}
              <span className="text-primary">Coding Interviews</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              Practice algorithmic problems, sharpen your skills, and ace your
              next technical interview. Join thousands of developers preparing
              with AlgoCrack.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button asChild size="lg" className="text-base">
                <Link href="/problems">
                  Start Practicing
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-base">
                <Link href="/about">
                  Learn More
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t bg-muted/30 py-20">
        <div className="w-full px-4">
          <h2 className="text-center text-3xl font-bold">
            Why Choose AlgoCrack?
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={<Code2 className="h-8 w-8" />}
              title="Real Interview Problems"
              description="Practice with problems asked at top tech companies like Google, Meta, and Amazon."
            />
            <FeatureCard
              icon={<Zap className="h-8 w-8" />}
              title="Instant Feedback"
              description="Get real-time results with detailed execution metrics and test case analysis."
            />
            <FeatureCard
              icon={<Trophy className="h-8 w-8" />}
              title="Track Progress"
              description="Monitor your improvement with submission history and statistics."
            />
            <FeatureCard
              icon={<Users className="h-8 w-8" />}
              title="Multi-Language Support"
              description="Code in Java, Python, and more languages with full syntax highlighting."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="w-full px-4">
          <div className="mx-auto max-w-2xl rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 p-8 text-center md:p-12">
            <h2 className="text-2xl font-bold md:text-3xl">
              Ready to Level Up?
            </h2>
            <p className="mt-4 text-muted-foreground">
              Start solving problems today and take your coding skills to the
              next level.
            </p>
            <Button asChild size="lg" className="mt-6">
              <Link href="/problems">
                Browse Problems
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-6 transition-shadow hover:shadow-md">
      <div className="text-primary">{icon}</div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
