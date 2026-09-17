"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { api, ApiError, type Account, type Contact, type Rep, type Deal, type Stage, type Source, type Workspace } from "@/lib/api";
import { Sidebar, SPACES, type SpaceId, type SubId } from "@/components/Sidebar";
import { NotBuiltYet } from "@/components/NotBuiltYet";
import { TeamTab } from "./TeamTab";
import { CompaniesTab } from "./CompaniesTab";
import { ContactsTab } from "./ContactsTab";
import { DealsTab } from "./DealsTab";
import { OverviewTab } from "./OverviewTab";
import { SalesOverviewTab } from "./SalesOverviewTab";

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

  const currentSpace = SPACES.find((s) => s.id === space)!;
  const currentSub = currentSpace.subs.find((s) => s.id === sub)!;

  return (
    <div className="min-h-screen flex bg-[#F4F2F8]">
      <Sidebar
        space={space}
        sub={sub}
        onNavigate={(s, sb) => {
          setSpace(s);
          setSub(sb);
        }}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-[52px] shrink-0 flex items-center gap-2 px-10 bg-white border-b border-[#E9E4F2] sticky top-0 z-10 text-[13.5px]">
          <Link href="/workspaces" className="font-semibold text-[#7B7589] hover:text-[#141220] transition-colors">
            Clients
          </Link>
          <ChevronRight size={13} className="text-[#C7C2D6]" />
          <span className="font-semibold text-[#141220]">{workspace.name}</span>
          <ChevronRight size={13} className="text-[#C7C2D6]" />
          <span className="text-[#7B7589]">{currentSpace.label}</span>
          <ChevronRight size={13} className="text-[#C7C2D6]" />
          <span className="text-[#7B7589]">{currentSub.label}</span>
        </header>

        <main className="flex-1 min-w-0 px-10 py-8">
        <div className="max-w-[1600px] flex flex-col gap-7">
          {space === "exec" && sub === "dash" && (
            <OverviewTab
              wsId={wsId}
              workspace={workspace}
              setWorkspace={setWorkspace}
              accounts={accounts}
              deals={deals}
              stages={stages}
              sources={sources}
            />
          )}
          {space === "sales" && sub === "dash" && <SalesOverviewTab deals={deals} stages={stages} />}
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
            !(space === "sales" && ["dash", "deals", "companies", "people", "team"].includes(sub)) && (
              <NotBuiltYet label={currentSpace.label} />
            )}
        </div>
        </main>
      </div>
    </div>
  );
}
