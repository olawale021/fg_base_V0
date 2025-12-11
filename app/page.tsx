import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, FileText, BarChart3 } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <main className="flex flex-col items-center text-center max-w-2xl">
        <div className="mb-8 animate-float-slow">
          <Badge variant="secondary" className="text-sm px-4 py-2 shadow-sm">
            1 minute to clarity
          </Badge>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 animate-fade-in">
          <span className="md:hidden">Take the founder<br />Readiness Test</span>
          <span className="hidden md:block">Take the Founder Readiness Test</span>
        </h1>

        <p className="text-xl text-muted-foreground mb-12 max-w-lg animate-fade-in-delay-1">
          Find out how close you are to becoming a founder.
        </p>

        <Button
          asChild
          size="lg"
          className="text-lg px-8 py-6 rounded-full hover:shadow-xl transition-all hover:scale-105 animate-pulse-glow animate-fade-in-delay-2"
        >
          <Link href="/test">
            Start Test
          </Link>
        </Button>

        <div className="mt-16 flex items-center justify-center gap-6 md:gap-8 text-sm text-foreground flex-wrap">
          <div className="flex items-center gap-2 animate-float" style={{ animationDelay: '0s' }}>
            <Clock className="w-5 h-5" />
            <span>1 minute</span>
          </div>
          <div className="flex items-center gap-2 animate-float" style={{ animationDelay: '0.2s' }}>
            <FileText className="w-5 h-5" />
            <span>9 questions</span>
          </div>
          <div className="flex items-center gap-2 animate-float" style={{ animationDelay: '0.4s' }}>
            <BarChart3 className="w-5 h-5" />
            <span>Instant results</span>
          </div>
        </div>
      </main>
    </div>
  );
}
