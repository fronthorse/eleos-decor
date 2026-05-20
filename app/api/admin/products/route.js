import {
  getStoragePathFromPublicUrl,
  jsonError,
  PRODUCTS_STORAGE_BUCKET,
  requireAdmin,
  withApiTimeout,
} from "../_adminSupabase";

function cleanProductPayload(product = {}) {
  const cleaned = {
    title: String(product.title || "").trim(),
    category: String(product.category || "").trim(),
    price: String(product.price || "").trim(),
    description: String(product.description || "").trim(),
  };

  if (product.image_url) {
    cleaned.image_url = String(product.image_url);
  }

  if (Array.isArray(product.gallery_images)) {
    cleaned.gallery_images = product.gallery_images.map(String);
  }

  return cleaned;
}

function cleanVariantRows(productId, variants = []) {
  return variants
    .filter((variant) => variant?.variant_label && variant?.image_url)
    .map((variant) => ({
      product_id: Number(productId),
      variant_label: String(variant.variant_label).trim(),
      variant_type: "print",
      image_url: String(variant.image_url),
      gallery: Array.isArray(variant.gallery) ? variant.gallery.map(String) : [],
      price_override: variant.price_override
        ? String(variant.price_override).trim()
        : null,
      sku: variant.sku ? String(variant.sku).trim() : null,
      is_default: Boolean(variant.is_default),
    }));
}

async function saveVariants(adminSupabase, productId, variants) {
  const rows = cleanVariantRows(productId, variants);

  if (rows.length === 0) {
    return;
  }

  if (rows.some((variant) => variant.is_default)) {
    const { error: defaultError } = await withApiTimeout(
      adminSupabase
        .from("product_variants")
        .update({ is_default: false })
        .eq("product_id", Number(productId)),
      "Timed out while preparing product variants."
    );

    if (defaultError) {
      throw new Error(`Variant default update failed: ${defaultError.message}`);
    }
  }

  const { error } = await withApiTimeout(
    adminSupabase.from("product_variants").insert(rows),
    "Timed out while saving product variants."
  );

  if (error) {
    throw new Error(`Variant save failed: ${error.message}`);
  }
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export async function POST(request) {
  const { adminSupabase, errorResponse } = await requireAdmin(request);

  if (errorResponse) return errorResponse;

  const body = await readJson(request);

  if (!body?.product) {
    return jsonError("Product data is required.", 400);
  }

  try {
    const { data: insertedProduct, error } = await withApiTimeout(
      adminSupabase
        .from("products")
        .insert([cleanProductPayload(body.product)])
        .select("id")
        .single(),
      "Timed out while saving product."
    );

    if (error) {
      throw new Error(`Product save failed: ${error.message}`);
    }

    await saveVariants(adminSupabase, insertedProduct.id, body.variants || []);

    return Response.json({ productId: insertedProduct.id });
  } catch (error) {
    return jsonError(error.message || "Unable to save product.", 500);
  }
}

export async function PATCH(request) {
  const { adminSupabase, errorResponse } = await requireAdmin(request);

  if (errorResponse) return errorResponse;

  const body = await readJson(request);
  const productId = Number(body?.productId);

  if (!Number.isFinite(productId) || !body?.product) {
    return jsonError("Product ID and product data are required.", 400);
  }

  try {
    const { error } = await withApiTimeout(
      adminSupabase
        .from("products")
        .update(cleanProductPayload(body.product))
        .eq("id", productId),
      "Timed out while updating product."
    );

    if (error) {
      throw new Error(`Product update failed: ${error.message}`);
    }

    await saveVariants(adminSupabase, productId, body.variants || []);

    return Response.json({ productId });
  } catch (error) {
    return jsonError(error.message || "Unable to update product.", 500);
  }
}

export async function DELETE(request) {
  const { adminSupabase, errorResponse } = await requireAdmin(request);

  if (errorResponse) return errorResponse;

  const body = await readJson(request);
  const productId = Number(body?.productId);

  if (!Number.isFinite(productId)) {
    return jsonError("Product ID is required.", 400);
  }

  try {
    const imageUrls = Array.isArray(body.imageUrls) ? body.imageUrls : [];
    const filePaths = imageUrls.map(getStoragePathFromPublicUrl).filter(Boolean);

    if (filePaths.length > 0) {
      const { error: storageError } = await withApiTimeout(
        adminSupabase.storage.from(PRODUCTS_STORAGE_BUCKET).remove(filePaths),
        "Timed out while deleting product images."
      );

      if (storageError) {
        throw new Error(`Image cleanup failed: ${storageError.message}`);
      }
    }

    const { error } = await withApiTimeout(
      adminSupabase.from("products").delete().eq("id", productId),
      "Timed out while deleting product."
    );

    if (error) {
      throw new Error(`Product delete failed: ${error.message}`);
    }

    return Response.json({ productId });
  } catch (error) {
    return jsonError(error.message || "Unable to delete product.", 500);
  }
}
