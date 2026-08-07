import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/AppShell";
export default async function Reports({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string }>;
}) {
  const { submitted } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const [{ data: p }, { data: reports }] = await Promise.all([
    supabase
      .from("profiles")
      .select("username,display_name,avatar_url")
      .eq("id", user.id)
      .single(),
    supabase
      .from("reports")
      .select("id,target_type,reason,details,status,created_at,reviewed_at")
      .eq("reporter_id", user.id)
      .order("created_at", { ascending: false }),
  ]);
  return (
    <AppShell
      profile={p || { username: null, display_name: null, avatar_url: null }}
    >
      <div className="settings-page">
        <p className="eyebrow">REPORTS &amp; MODERATION</p>
        <h1>No black holes.</h1>
        <p className="lede">
          See whether a report is open, under review, resolved, or dismissed.
          Details stay between you and moderators.
        </p>
        {submitted && (
          <p className="form-success account-result" role="status">
            Report received. Its status is now Open.
          </p>
        )}
        {reports?.length ? (
          reports.map((report) => (
            <article className="report-card" key={report.id}>
              <div>
                <span className={`report-status status-${report.status}`}>
                  {report.status}
                </span>
                <time>{new Date(report.created_at).toLocaleString()}</time>
              </div>
              <h2>{report.reason}</h2>
              <p>{report.details}</p>
              {report.reviewed_at && (
                <small>
                  Last moderation update:{" "}
                  {new Date(report.reviewed_at).toLocaleString()}
                </small>
              )}
            </article>
          ))
        ) : (
          <div className="empty">
            <b>No reports submitted.</b>
            <p>That is either excellent news or a very quiet week.</p>
          </div>
        )}
        <Link href="/account">← Account &amp; Safety</Link>
      </div>
    </AppShell>
  );
}
