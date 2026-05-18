import type { CreateAddressInput, UpdateAddressInput } from "@wastegrab/shared";

type Payload = Record<string, unknown>;

type GooglePlaceCreateFields = {
  formattedAddress?: string;
  googlePlaceId?: string;
  latitude?: number;
  longitude?: number;
};

type GooglePlaceUpdateFields = {
  formattedAddress?: string | null;
  googlePlaceId?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

export type CollectionLocationCreateInput = {
  name: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  googlePlaceId?: string;
  latitude?: number;
  longitude?: number;
};

export function readTrimmedString(payload: Payload, key: string): string {
  const value = payload[key];
  return typeof value === "string" ? value.trim() : "";
}

export function readOptionalTrimmedString(payload: Payload, key: string): string | undefined {
  const value = readTrimmedString(payload, key);
  return value || undefined;
}

export function readNullableTrimmedString(payload: Payload, key: string): string | null | undefined {
  const value = payload[key];
  if (value === null) return null;
  if (typeof value !== "string") return undefined;
  return value.trim() || null;
}

export function readFiniteNumber(payload: Payload, key: string): number | undefined {
  const value = payload[key];
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

export function readNullableFiniteNumber(payload: Payload, key: string): number | null | undefined {
  const value = payload[key];
  if (value === null) return null;
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

export function parseGooglePlaceCreateFields(payload: Payload, includeFormattedAddress = true): GooglePlaceCreateFields {
  const fields: GooglePlaceCreateFields = {};
  const formattedAddress = includeFormattedAddress ? readOptionalTrimmedString(payload, "formattedAddress") : undefined;
  const googlePlaceId = readOptionalTrimmedString(payload, "googlePlaceId");
  const latitude = readFiniteNumber(payload, "latitude");
  const longitude = readFiniteNumber(payload, "longitude");

  if (formattedAddress) fields.formattedAddress = formattedAddress;
  if (googlePlaceId) fields.googlePlaceId = googlePlaceId;
  if (latitude !== undefined) fields.latitude = latitude;
  if (longitude !== undefined) fields.longitude = longitude;

  return fields;
}

export function parseGooglePlaceUpdateFields(payload: Payload, includeFormattedAddress = true): GooglePlaceUpdateFields {
  const fields: GooglePlaceUpdateFields = {};
  const formattedAddress = includeFormattedAddress ? readNullableTrimmedString(payload, "formattedAddress") : undefined;
  const googlePlaceId = readNullableTrimmedString(payload, "googlePlaceId");
  const latitude = readNullableFiniteNumber(payload, "latitude");
  const longitude = readNullableFiniteNumber(payload, "longitude");

  if (formattedAddress !== undefined) fields.formattedAddress = formattedAddress;
  if (googlePlaceId !== undefined) fields.googlePlaceId = googlePlaceId;
  if (latitude !== undefined) fields.latitude = latitude;
  if (longitude !== undefined) fields.longitude = longitude;

  return fields;
}

export function parseCreateAddressInput(payload: Payload): CreateAddressInput {
  return {
    label: readTrimmedString(payload, "label"),
    street: readTrimmedString(payload, "street"),
    city: readTrimmedString(payload, "city"),
    state: readTrimmedString(payload, "state"),
    postalCode: readTrimmedString(payload, "postalCode"),
    notes: readOptionalTrimmedString(payload, "notes"),
    ...parseGooglePlaceCreateFields(payload),
  };
}

export function parseUpdateAddressInput(payload: Payload): UpdateAddressInput {
  const updates: UpdateAddressInput = {};
  const fieldNames = ["label", "street", "city", "state", "postalCode"] as const;

  for (const fieldName of fieldNames) {
    if (typeof payload[fieldName] === "string") {
      updates[fieldName] = readTrimmedString(payload, fieldName);
    }
  }

  if (typeof payload["notes"] === "string") updates.notes = readTrimmedString(payload, "notes");
  if (typeof payload["isDefault"] === "boolean") updates.isDefault = payload["isDefault"];

  return {
    ...updates,
    ...parseGooglePlaceUpdateFields(payload),
  };
}

export function hasRequiredAddressFields(input: Pick<CreateAddressInput, "label" | "street" | "city" | "state" | "postalCode">): boolean {
  return Boolean(input.label && input.street && input.city && input.state && input.postalCode);
}

export function parseCreateCollectionLocationInput(payload: Payload): CollectionLocationCreateInput {
  return {
    name: readTrimmedString(payload, "name"),
    address: readOptionalTrimmedString(payload, "address"),
    city: readOptionalTrimmedString(payload, "city"),
    state: readOptionalTrimmedString(payload, "state"),
    postalCode: readOptionalTrimmedString(payload, "postalCode"),
    ...parseGooglePlaceCreateFields(payload, false),
  };
}

export function parseUpdateCollectionLocationInput(payload: Payload): Record<string, string | number | null> {
  const updates: Record<string, string | number | null> = {};
  const stringFields = ["name", "address", "city", "state", "postalCode"] as const;

  for (const fieldName of stringFields) {
    if (typeof payload[fieldName] === "string") {
      updates[fieldName] = readTrimmedString(payload, fieldName);
    }
  }

  const placeFields = parseGooglePlaceUpdateFields(payload, false);
  if (placeFields.googlePlaceId !== undefined) updates["googlePlaceId"] = placeFields.googlePlaceId;
  if (placeFields.latitude !== undefined) updates["latitude"] = placeFields.latitude;
  if (placeFields.longitude !== undefined) updates["longitude"] = placeFields.longitude;

  return updates;
}
