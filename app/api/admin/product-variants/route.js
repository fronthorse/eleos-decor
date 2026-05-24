import { jsonError, requireAdmin, withApiTimeout } from "../_adminSupabase";

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
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

export async function POST(request) {
  const { adminSupabase, errorResponse } = await requireAdmin(request);

  if (errorResponse) return errorResponse;

  const body = await readJson(request);
  const productId = Number(body?.productId);
  const variantRows = cleanVariantRows(productId, body?.variants || []);

  if (!Number.isFinite(productId)) {
    return jsonError("Product ID is required.", 400);
  }

  if (variantRows.length === 0) {
    return Response.json({ saved: 0 });
  }

  try {
    const labels = variantRows.map((variant) => variant.variant_label);
    const { data: existingVariants, error: existingError } =
      await withApiTimeout(
        adminSupabase
          .from("product_variants")
          .select("variant_label")
          .eq("product_id", productId)
          .in("variant_label", labels),
        "Timed out while checking existing product variants."
      );

    if (existingError) {
      throw new Error(
        `Variant duplicate check failed: ${existingError.message}`
      );
    }

    const existingLabels = new Set(
      (existingVariants || []).map((variant) => variant.variant_label)
    );
    const rowsToInsert = variantRows.filter(
      (variant) => !existingLabels.has(variant.variant_label)
    );

    if (rowsToInsert.length === 0) {
      return Response.json({ saved: 0, skippedExisting: variantRows.length });
    }

    if (rowsToInsert.some((variant) => variant.is_default)) {
      const { error: defaultError } = await withApiTimeout(
        adminSupabase
          .from("product_variants")
          .update({ is_default: false })
          .eq("product_id", productId),
        "Timed out while preparing product variants."
      );

      if (defaultError) {
        throw new Error(`Variant default update failed: ${defaultError.message}`);
      }
    }

    const { error } = await withApiTimeout(
      adminSupabase.from("product_variants").insert(rowsToInsert),
      "Timed out while saving product variants."
    );

    if (error) {
      throw new Error(`Variant save failed: ${error.message}`);
    }

    return Response.json({
      saved: rowsToInsert.length,
      skippedExisting: variantRows.length - rowsToInsert.length,
    });
  } catch (error) {
    return jsonError(error.message || "Unable to save product variants.", 500);
  }
}

export async function DELETE(request) {
  const { adminSupabase, errorResponse } = await requireAdmin(request);

  if (errorResponse) return errorResponse;

  const body = await readJson(request);
  const variantId = String(body?.variantId || "");

  if (!variantId) {
    return jsonError("Variant ID is required.", 400);
  }

  try {
    const { error } = await withApiTimeout(
      adminSupabase.from("product_variants").delete().eq("id", variantId),
      "Timed out while deleting product variant."
    );

    if (error) {
      throw new Error(`Variant delete failed: ${error.message}`);
    }

    return Response.json({ variantId });
  } catch (error) {
    return jsonError(error.message || "Unable to delete product variant.", 500);
  }
}
