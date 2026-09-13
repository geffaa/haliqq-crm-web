"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError, type Account, type Contact, type Rep, type Deal, type Stage, type Source, type Workspace } from "@/lib/api";
import { Sidebar, type SpaceId, type SubId } from "@/components/Sidebar";
import { NotBuiltYet } from "@/components/NotBuiltYet";
import { TeamTab } from "./TeamTab";
import { CompaniesTab } from "./CompaniesTab";
import { ContactsTab } from "./ContactsTab";
import { DealsTab } from "./DealsTab";
import { OverviewTab } from "./OverviewTab";

export default function WorkspaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: wsId } = use(params);
  const router = useRouter();
  const [space, setSpace] = useState<SpaceId>("exec");
  const [sub, setSub] = useState<SubId>("dash");
  const [loading, setLoading] = useState(true);

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [reps, setReps] = useState<Rep[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [sources, setSources] = useState<Source[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [wsList, acc, con, rep, deal, stg, src] = await Promise.all([
          api.listWorkspaces(),
          api.accounts.list(wsId),
          api.contacts.list(wsId),
          api.reps.list(wsId),
          api.deals.list(wsId),
          api.listStages(wsId),
          api.listSources(wsId),
        ]);
        const ws = wsList.find((w) => w.id === wsId);
        if (!ws) return router.push("/workspaces");
        setWorkspace(ws);
        setAccounts(acc);
        setContacts(con);
        setReps(rep);
        setDeals(deal);
        setStages(stg);
        setSources(src);
      } catch (err) {
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          router.push(err.status === 401 ? "/sign-in" : "/workspaces");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [wsId, router]);

  if (loading || !workspace) {
    return <div className="min-h-screen grid place-items-center text-[#7B7589] bg-[#F4F2F8]">Loading…</div>;
  }

  const milestoneFor = (s: SpaceId) => (s === "marketing" ? "Milestone 3 (content, ads, creative library)" : "a later milestone");

  return (
    <div className="min-h-screen flex bg-[#F4F2F8]">
      <Sidebar
        workspaceName={workspace.name}
        workspaceIndustry={workspace.industry}
        space={space}
        sub={sub}
        onNavigate={(s, sb) => {
          setSpace(s);
          setSub(sb);
        }}
      />

      <main className="flex-1 min-w-0 px-10 py-8">
        <div className="max-w-[1600px] flex flex-col gap-7">
          {space === "exec" && sub === "dash" && (
            <OverviewTab accounts={accounts} deals={deals} stages={stages} sources={sources} />
          )}
          {space === "sales" && sub === "deals" && (
            <DealsTab wsId={wsId} deals={deals} setDeals={setDeals} accounts={accounts} contacts={contacts} reps={reps} stages={stages} sources={sources} />
          )}
          {space === "sales" && sub === "companies" && (
            <CompaniesTab wsId={wsId} accounts={accounts} setAccounts={setAccounts} reps={reps} />
          )}
          {space === "sales" && sub === "people" && (
            <ContactsTab wsId={wsId} contacts={contacts} setContacts={setContacts} accounts={accounts} />
          )}
          {space === "sales" && sub === "team" && <TeamTab wsId={wsId} reps={reps} setReps={setReps} />}

          {!(space === "exec" && sub === "dash") &&
            !(space === "sales" && ["deals", "companies", "people", "team"].includes(sub)) && (
              <NotBuiltYet label={space === "ask" ? "Ask" : space} milestone={milestoneFor(space)} />
            )}
        </div>
      </main>
    </div>
  );
}
