import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AddressForm } from "@/components/address-form";
import { countryName } from "@/lib/address";
import { deleteAddress, setDefaultAddress } from "@/lib/actions/account";
import { requireUser } from "@/lib/auth-session";
import { getAddressesForUser, type SavedAddress } from "@/lib/db/queries/addresses";

export const metadata: Metadata = { title: "My addresses" };

export default function AddressesPage({ searchParams }: PageProps<"/account/addresses">) {
  return (
    <Suspense
      fallback={<div aria-busy="true" aria-label="Loading your addresses" className="h-64 animate-pulse bg-muted" />}
    >
      <AddressBook searchParams={searchParams} />
    </Suspense>
  );
}

async function AddressBook({ searchParams }: Pick<PageProps<"/account/addresses">, "searchParams">) {
  const user = await requireUser("/account/addresses");
  const saved = await getAddressesForUser(user.id);
  const { edit } = await searchParams;
  const editing = typeof edit === "string" ? saved.find((address) => String(address.id) === edit) : undefined;

  return (
    <div className="flex flex-col gap-14">
      <section aria-labelledby="saved-addresses-title">
        <h2 id="saved-addresses-title" className="heading-3 mb-5">
          Saved addresses
        </h2>
        {saved.length === 0 ? (
          <p className="text-muted-foreground">You haven&apos;t saved an address yet.</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {saved.map((address) => (
              <li key={address.id}>
                <AddressCard address={address} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="address-form-title">
        <h2 id="address-form-title" className="heading-3 mb-5">
          {editing ? "Edit address" : "Add an address"}
        </h2>
        <AddressForm
          // Remount when switching between addresses so the fields take the new defaults.
          key={editing?.id ?? "new"}
          id={editing?.id}
          isDefault={editing?.isDefault}
          initialValues={
            editing && {
              fullName: editing.fullName,
              line1: editing.line1,
              line2: editing.line2 ?? "",
              city: editing.city,
              region: editing.region ?? "",
              postalCode: editing.postalCode,
              country: editing.country,
              phone: editing.phone ?? "",
            }
          }
        />
      </section>
    </div>
  );
}

function AddressCard({ address }: { address: SavedAddress }) {
  return (
    <div className="flex h-full flex-col gap-4 border p-5">
      <address className="space-y-0.5 not-italic text-muted-foreground">
        <p className="flex items-center gap-2 text-foreground">
          {address.fullName}
          {address.isDefault && <span className="eyebrow text-2xs text-muted-foreground">Default</span>}
        </p>
        <p>{address.line1}</p>
        {address.line2 && <p>{address.line2}</p>}
        <p>
          {address.city}
          {address.region && `, ${address.region}`} {address.postalCode}
        </p>
        <p>{countryName(address.country)}</p>
        {address.phone && <p>{address.phone}</p>}
      </address>
      <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2">
        <Link href={`/account/addresses?edit=${address.id}`} className="link">
          Edit
        </Link>
        {!address.isDefault && (
          <form action={setDefaultAddress}>
            <input type="hidden" name="id" value={address.id} />
            <button type="submit" className="link-muted">
              Make default
            </button>
          </form>
        )}
        <form action={deleteAddress}>
          <input type="hidden" name="id" value={address.id} />
          <button type="submit" className="link-muted" aria-label={`Delete address for ${address.fullName}`}>
            Delete
          </button>
        </form>
      </div>
    </div>
  );
}
