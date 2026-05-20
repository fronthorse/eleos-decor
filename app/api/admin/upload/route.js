import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { isAdminEmail } from "../../../../lib/adminAuth";

const PRODUCTS_STORAGE_BUCKET = "products";

function getBearerToken(request) {
  const authorization = request.headers.get("authorization") || "";
  const [scheme, token] = authorization.split(" ");

  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return "";
  }

  return token;
}

function getImageContentType(file) {
  const fileType = String(file?.type || "");
  const fileName = String(file?.name || "").toLowerCase();

  if (fileType.startsWith("image/")) return fileType;
  if (fileName.endsWith(".png")) return "image/png";
  if (fileName.endsWith(".webp")) return "image/webp";
  if (fileName.endsWith(".gif")) return "image/gif";
  if (fileName.endsWith(".avif")) return "image/avif";
  if (fileName.endsWith(".heic")) return "image/heic";
  if (fileName.endsWith(".heif")) return "image/heif";
  if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) {
    return "image/jpeg";
  }

  return "";
}

function createSafeFileName(fileName) {
  const fallbackName = `product-image-${Date.now()}.jpg`;
  const safeName = String(fileName || fallbackName)
    .replaceAll(" ", "-")
    .replace(/[^a-zA-Z0-9._-]/g, "-");

  return `${Date.now()}-${safeName}`;
}

function jsonError(message, status) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request) {
  const accessToken = getBearerToken(request);

  if (!accessToken) {
    return jsonError("Not authenticated. Please log in again.", 401);
  }

  const supabase = createClient(
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
  } = await supabase.auth.getUser(accessToken);

  if (userError || !user) {
    return jsonError("Not authenticated. Please log in again.", 401);
  }

  if (!isAdminEmail(user.email)) {
    return jsonError("You are not authorized to upload products.", 403);
  }

  let formData;

  try {
    formData = await request.formData();
  } catch {
    return jsonError("Invalid upload request.", 400);
  }

  const file = formData.get("file");

  if (!file || typeof file.arrayBuffer !== "function") {
    return jsonError("Invalid file. Please choose an image to upload.", 400);
  }

  const contentType = getImageContentType(file);

  if (!contentType) {
    return jsonError(
      "Invalid file. Please choose a JPG, PNG, WebP, GIF, AVIF, or HEIC image.",
      400
    );
  }

  let fileBuffer;

  try {
    fileBuffer = await file.arrayBuffer();
  } catch {
    return jsonError("Invalid file. Please choose the image again.", 400);
  }
  const filePath = createSafeFileName(file.name);
  const { error: uploadError } = await supabase.storage
    .from(PRODUCTS_STORAGE_BUCKET)
    .upload(filePath, fileBuffer, {
      cacheControl: "3600",
      contentType,
      upsert: false,
    });

  if (uploadError) {
    return jsonError(`Storage upload failed: ${uploadError.message}`, 500);
  }

  const { data: imageData } = supabase.storage
    .from(PRODUCTS_STORAGE_BUCKET)
    .getPublicUrl(filePath);

  return NextResponse.json({
    bucket: PRODUCTS_STORAGE_BUCKET,
    path: filePath,
    publicUrl: imageData.publicUrl,
  });
}
