import { ConsentForm } from "../ui";

type Search = Promise<Record<string, string | string[] | undefined>>;

export default async function ConsentPage({ searchParams }: { searchParams: Search }) {
  const query = await searchParams;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (Array.isArray(value)) value.forEach((item) => params.append(key, item));
    else if (value !== undefined) params.append(key, value);
  }
  const encodedQuery = params.toString();
  const scopes = (typeof query.scope === "string" ? query.scope : "").split(/\s+/).filter(Boolean);
  const error = query.error_description ?? query.error;
  return <ConsentForm oauthQuery={encodedQuery} clientId={typeof query.client_id === "string" ? query.client_id : "An application"} scopes={scopes} initialError={Array.isArray(error) ? error[0] : error} />;
}
