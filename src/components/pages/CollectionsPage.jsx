// @ts-nocheck
import { useState } from "react";
import { CollectionCard } from "@/components/icons/CollectionCard";
import { Button } from "@/components/ui/button";
import { collections } from "@/data/collections";
import { useCollections } from "@/lib/collections";
import { useCatalog } from "@/lib/use-catalog";

const fieldClass =
  "h-11 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground shadow-border outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring";

export function CollectionsPage() {
  useCatalog();
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Collections</h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Curated groups for common product surfaces, plus collections you name and fill on this device.
      </p>
      <YourCollections />
      <h2 className="mt-10 text-xl font-semibold tracking-tight">Curated</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((collection) => (
          <CollectionCard key={collection.slug} collection={collection} />
        ))}
      </div>
    </div>
  );
}

function YourCollections() {
  const mine = useCollections();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  function onSubmit(event) {
    event.preventDefault();
    if (!name.trim()) {
      setError("Name the collection.");
      return;
    }
    mine.create(name, description);
    setName("");
    setDescription("");
    setError("");
  }

  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold tracking-tight">Yours</h2>
      <p className="mt-1 text-sm text-muted-foreground">Stored in this browser. Open one, then add icons from its page or from an icon.</p>
      <form onSubmit={onSubmit} className="mt-4 grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-[1fr_1.4fr_auto] sm:items-end">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground">Name</span>
          <input value={name} onChange={(event) => setName(event.target.value)} maxLength={48} className={fieldClass} placeholder="Marketing set" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground">Description</span>
          <input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={160}
            className={fieldClass}
            placeholder="Optional"
          />
        </label>
        <Button type="submit">Create</Button>
        {error ? (
          <p className="text-sm text-destructive sm:col-span-3" role="alert">
            {error}
          </p>
        ) : null}
      </form>
      {mine.ready && mine.items.length ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {mine.items.map((collection) => (
            <CollectionCard key={collection.slug} collection={collection} badge="Yours" />
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">{mine.ready ? "No collections yet." : "Loading your collections…"}</p>
      )}
    </section>
  );
}
