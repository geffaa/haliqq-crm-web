"use client";

import { api, type Contact, type ContactInput, type Account } from "@/lib/api";
import { inputCls, primaryBtnCls, ghostBtnCls, dangerBtnCls } from "@/lib/ui";
import { useEditableList } from "@/lib/useEditableList";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";

const empty: ContactInput = { accountId: null, name: "", role: "", email: "", phone: "", note: "" };
const toInput = (c: Contact): ContactInput => ({
  accountId: c.accountId,
  name: c.name,
  role: c.role,
  email: c.email,
  phone: c.phone,
  note: c.note,
});

export function ContactsTab({
  wsId,
  contacts,
  setContacts,
  accounts,
}: {
  wsId: string;
  contacts: Contact[];
  setContacts: (c: Contact[]) => void;
  accounts: Account[];
}) {
  const { form, setForm, editingId, edit, cancel, submit, remove, error } = useEditableList(
    wsId,
    contacts,
    setContacts,
    api.contacts,
    empty,
    toInput,
  );

  const accountName = (id: string | null) => accounts.find((a) => a.id === id)?.name ?? "—";

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="People" count={contacts.length} />

      <Card title={editingId ? "Edit contact" : "New contact"}>
        <form onSubmit={submit} className="flex flex-wrap gap-4 items-end">
          <label className="flex flex-col gap-1 text-[13px] font-semibold text-[#7B7589]">
            Name
            <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1 text-[13px] font-semibold text-[#7B7589]">
            Company
            <select
              className={inputCls}
              value={form.accountId ?? ""}
              onChange={(e) => setForm({ ...form, accountId: e.target.value || null })}
            >
              <option value="">None</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-[13px] font-semibold text-[#7B7589]">
            Role
            <input className={inputCls} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="CFO" />
          </label>
          <label className="flex flex-col gap-1 text-[13px] font-semibold text-[#7B7589]">
            Email
            <input className={inputCls} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1 text-[13px] font-semibold text-[#7B7589]">
            Phone
            <input className={inputCls} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </label>
          <button type="submit" className={primaryBtnCls} disabled={!form.name.trim()}>
            {editingId ? "Save changes" : "Create"}
          </button>
          {editingId && (
            <button type="button" className={ghostBtnCls} onClick={cancel}>
              Cancel
            </button>
          )}
        </form>
      </Card>

      {error && <p className="text-sm text-[#E0517A]">{error}</p>}

      <Card title="All people" note={`${contacts.length} ${contacts.length === 1 ? "contact" : "contacts"}`}>
        <div className="-mx-6 overflow-x-auto">
          <table className="w-full text-[15px] text-[#141220]">
            <thead className="bg-[#FAF9FC] text-[11px] uppercase tracking-wide text-[#7B7589]">
              <tr>
                <th className="text-left px-6 py-3.5">Name</th>
                <th className="text-left px-6 py-3.5">Company</th>
                <th className="text-left px-6 py-3.5">Role</th>
                <th className="text-left px-6 py-3.5">Email</th>
                <th className="px-6 py-3.5" />
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => edit(c)}
                  className={`border-t border-[#F0ECF7] cursor-pointer transition-colors hover:bg-[#FAF9FC] ${editingId === c.id ? "bg-[#7C40D4]/5" : ""}`}
                >
                  <td className="px-6 py-3.5 font-semibold">{c.name}</td>
                  <td className="px-6 py-3.5 text-[#7B7589]">{accountName(c.accountId)}</td>
                  <td className="px-6 py-3.5 text-[#7B7589]">{c.role || "—"}</td>
                  <td className="px-6 py-3.5 text-[#7B7589]">{c.email || "—"}</td>
                  <td className="px-6 py-3.5 text-right">
                    <button className={dangerBtnCls} onClick={(e) => { e.stopPropagation(); remove(c.id); }}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
              {!contacts.length && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-[#7B7589]">
                    No contacts yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
