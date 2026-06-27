import { PageHeader } from "@/components/layout/page-header";
import { PlaceholderPanel } from "@/components/ui-state/placeholder-panel";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function LoginPlaceholder() {
  return (
    <>
      <PageHeader
        eyebrow="Facilitator access"
        title="Sign in"
        description="Facilitators will authenticate here to manage sessions, teams, and action boards."
        badge="Placeholder"
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Email sign-in</CardTitle>
            <CardDescription>
              Authentication will be added in a later milestone.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Email input placeholder</p>
            <p>Magic link or password placeholder</p>
            <Button disabled className="w-full sm:w-auto">
              Continue
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Why sign in?</CardTitle>
            <CardDescription>
              Facilitators need a home for recurring teams and historical retros.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Create and reuse retro templates</p>
            <p>Track action items over time</p>
            <p>Invite workspace members later</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <PlaceholderPanel
          title="Auth not implemented"
          description="Supabase authentication will plug into this route without changing the overall app shell."
          highlights={[
            "Facilitator accounts",
            "Secure session management",
            "Protected dashboard routes",
            "Future participant login",
          ]}
        />
      </div>
    </>
  );
}
