import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { isAdminEmail } from "../../../../lib/adminAuth";

const PRODUCTS_STORAGE_BUCKET = "products";
const VALID_UPLOAD_TYPES = new Set(["product", "gallery", "variant"]);
const VALID_IMAGE_EXTENSIONS = new Set([
  "avif",
  "gif",
  "heic",
  "heif",
  "jpeg",
  "jpg",
  "png",
  "webp",
]);

function getBearerToken(request) {
  const authorization = request.headers.get("authorization") || "";
  const [scheme, token] = authorization.split(" ");

  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return "";
  }

  return token;
}

function getFileExtension(filename, contentType) {
  const fileExtension = String(filename || "")
    .toLowerCase()
    .split(".")
    .pop();

  if (VALID_IMAGE_EXTENSIONS.has(fileExtension)) {
    return fileExtension === "jpeg" ? "jpg" : fileExtension;
  }

  const typeExtension = String(contentType || "").toLowerCase().split("/").pop();

  if (VALID_IMAGE_EXTENSIONS.has(typeExtension)) {
    return typeExtension === "jpeg" ? "jpg" : typeExtension;
  }

  return "";
}

function getImageContentType(filename, contentType) {
  const fileType = String(contentType || "").toLowerCase();

  if (fileType.startsWith("image/")) return fileType;

  const extension = getFileExtension(filename, contentType);

  if (extension === "png") return "image/png";
  if (extension === "webp") return "image/webp";
  if (extension === "gif") return "image/gif";
  if (extension === "avif") return "image/avif";
  if (extension === "heic") return "image/heic";
  if (extension === "heif") return "image/heif";
  if (extension === "jpg") return "image/jpeg";

  return "";
}

function createSafeStoragePath(filename, contentType, uploadType) {
  const extension = getFileExtension(filename, contentType) || "jpg";
  const date = new Date();
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const randomId =
    typeof globalThis.crypto?.randomUUID === "function"
      ? globalThis.crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return `${uploadType}/${year}/${month}/${randomId}.${extension}`;
}

function jsonError(message, status) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request) {
  const accessToken = getBearerToken(request);

  if (!accessToken) {
    return jsonError("Not authenticated. Please log in again.", 401);
  }

  const userSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    }
  );

  const {
    data: { user },
    error: userError,
  } = await userSupabase.auth.getUser(accessToken);

  if (userError || !user) {
    return jsonError("Not authenticated. Please log in again.", 401);
  }

  if (!isAdminEmail(user.email)) {
    return jsonError("You are not authorized to upload products.", 403);
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return jsonError("Storage upload service is not configured.", 500);
  }

  let metadata;

  try {
    metadata = await request.json();
  } catch {
    return jsonError("Invalid upload request.", 400);
  }

  const filename = String(metadata?.filename || "");
  const contentType = getImageContentType(filename, metadata?.contentType);
  const uploadType = VALID_UPLOAD_TYPES.has(metadata?.uploadType)
    ? metadata.uploadType
    : "";

  if (!filename.trim()) {
    return jsonError("A filename is required to create an upload URL.", 400);
  }

  if (!contentType) {
    return jsonError(
      "Invalid file. Please choose a JPG, PNG, WebP, GIF, AVIF, or HEIC image.",
      400
    );
  }

  if (!uploadType) {
    return jsonError("Invalid upload type.", 400);
  }

  const path = createSafeStoragePath(filename, contentType, uploadType);
  const storageSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
  const { data: signedUpload, error: signedUploadError } =
    await storageSupabase.storage
      .from(PRODUCTS_STORAGE_BUCKET)
      .createSignedUploadUrl(path);

  if (signedUploadError || !signedUpload?.token) {
    return jsonError(
      `Unable to create upload URL: ${
        signedUploadError?.message || "Storage returned no upload token."
      }`,
      500
    );
  }

  const { data: publicUrlData } = storageSupabase.storage
    .from(PRODUCTS_STORAGE_BUCKET)
    .getPublicUrl(path);

  return NextResponse.json({
    bucket: PRODUCTS_STORAGE_BUCKET,
    path,
    token: signedUpload.token,
    publicUrl: publicUrlData.publicUrl,
  });
}
