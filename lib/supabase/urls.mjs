// Keep image loading and uploads on the project selected for this deployment.
export function getSupabaseImagePatterns(supabaseUrl) {
  if (!supabaseUrl) return [];
  const url = new URL(supabaseUrl);
  return ["/storage/v1/object/public/**", "/storage/v1/render/image/public/**"].map(
    (pathname) => ({
      protocol: url.protocol.slice(0, -1),
      hostname: url.hostname,
      port: url.port,
      pathname,
    })
  );
}

export function getResumableUploadEndpoint(supabaseUrl) {
  const url = new URL(supabaseUrl);
  // Hosted Supabase uses a direct storage host; local/custom hosts keep theirs.
  if (/^[^.]+\.supabase\.co$/.test(url.hostname)) {
    url.hostname = url.hostname.replace(".supabase.co", ".storage.supabase.co");
  }
  return new URL("/storage/v1/upload/resumable", url.origin).href;
}
