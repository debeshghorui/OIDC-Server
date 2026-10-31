import { SignInForm } from "../ui";

type Search = Promise<Record<string, string | string[] | undefined>>;

export default async function SignInPage({ searchParams }: { searchParams: Search }) {
  const query = await searchParams;
  const error = query.error_description ?? query.error;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (Array.isArray(value)) value.forEach((item) => params.append(key, item));
    else if (value !== undefined) params.append(key, value);
  }
  return <SignInForm oauthQuery={params.toString()} initialError={Array.isArray(error) ? error[0] : error} />;
}
