import { useState } from "react";
import { ApiError } from "@/lib/api";

type Resource<T, TInput> = {
  create: (wsId: string, data: TInput) => Promise<T>;
  update: (wsId: string, id: string, data: TInput) => Promise<T>;
  remove: (wsId: string, id: string) => Promise<void>;
};

// Shared create/edit/delete flow for the four CRM tabs (Deals, Companies,
// People, Team) — same pattern, same API shape (api.ts's crud<T, TInput>()),
// so one hook replaces four copies of identical state wiring.
export function useEditableList<T extends { id: string }, TInput>(
  wsId: string,
  items: T[],
  setItems: (items: T[]) => void,
  resource: Resource<T, TInput>,
  empty: TInput,
  toInput: (item: T) => TInput,
) {
  const [form, setForm] = useState<TInput>(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const edit = (item: T) => {
    setEditingId(item.id);
    setForm(toInput(item));
  };
  const cancel = () => {
    setEditingId(null);
    setForm(empty);
  };

  // Returns whether the save succeeded, so a caller driving a drawer can
  // close it on success and leave it open (with `error` shown) on failure.
  const submit = async (e: React.FormEvent): Promise<boolean> => {
    e.preventDefault();
    setError(null);
    try {
      if (editingId) {
        const updated = await resource.update(wsId, editingId, form);
        setItems(items.map((i) => (i.id === editingId ? updated : i)));
        cancel();
      } else {
        const created = await resource.create(wsId, form);
        setItems([...items, created]);
        setForm(empty);
      }
      return true;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
      return false;
    }
  };

  const remove = async (id: string) => {
    setError(null);
    try {
      await resource.remove(wsId, id);
      setItems(items.filter((i) => i.id !== id));
      if (editingId === id) cancel();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not remove.");
    }
  };

  return { form, setForm, editingId, edit, cancel, submit, remove, error };
}
