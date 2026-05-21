import { config } from "../config.js";
import type { GooglePlaceSelection, PlacePrediction } from "@wastegrab/shared";

type GoogleAutocompleteResponse = {
  predictions?: Array<{
    description?: string;
    place_id?: string;
    structured_formatting?: {
      main_text?: string;
      secondary_text?: string;
    };
  }>;
  status?: string;
  error_message?: string;
};

type GooglePlaceDetailsResponse = {
  result?: {
    name?: string;
    formatted_address?: string;
    place_id?: string;
    address_components?: Array<{
      long_name?: string;
      types?: string[];
    }>;
    geometry?: {
      location?: {
        lat?: number;
        lng?: number;
      };
    };
  };
  status?: string;
  error_message?: string;
};

type AddressComponents = {
  streetNumber: string;
  route: string;
  premise: string;
  city: string;
  state: string;
  postalCode: string;
};

export async function autocompletePlaces(input: string, country: string): Promise<PlacePrediction[]> {
  const trimmedInput = input.trim();

  if (trimmedInput.length < 2) {
    return [];
  }

  const url = new URL("https://maps.googleapis.com/maps/api/place/autocomplete/json");
  url.searchParams.set("input", trimmedInput);
  url.searchParams.set("key", getGoogleMapsApiKey());

  const normalizedCountry = normalizeCountry(country);
  if (normalizedCountry) {
    url.searchParams.set("components", `country:${normalizedCountry}`);
  }

  const response = await fetchGoogle<GoogleAutocompleteResponse>(url);
  assertGoogleStatus(response.status, response.error_message);

  return (response.predictions ?? [])
    .map((prediction) => ({
      placeId: prediction.place_id ?? "",
      description: prediction.description ?? "",
      mainText: prediction.structured_formatting?.main_text ?? prediction.description ?? "",
      secondaryText: prediction.structured_formatting?.secondary_text ?? "",
    }))
    .filter((prediction) => prediction.placeId && prediction.description);
}

export async function getPlaceDetails(placeId: string): Promise<GooglePlaceSelection> {
  const normalizedPlaceId = placeId.trim();

  if (!normalizedPlaceId) {
    throw new Error("placeId is required.");
  }

  const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
  url.searchParams.set("place_id", normalizedPlaceId);
  url.searchParams.set("fields", "address_component,formatted_address,geometry,name,place_id");
  url.searchParams.set("key", getGoogleMapsApiKey());

  const response = await fetchGoogle<GooglePlaceDetailsResponse>(url);
  assertGoogleStatus(response.status, response.error_message);

  if (!response.result) {
    throw new Error("Place details were not found.");
  }

  return toPlaceSelection(response.result);
}

function getGoogleMapsApiKey(): string {
  if (!config.googleMapsApiKey) {
    throw new Error("GOOGLE_MAPS_API_KEY is required.");
  }

  return config.googleMapsApiKey;
}

async function fetchGoogle<T>(url: URL): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Google Places request failed with status ${response.status}.`);
  }

  return response.json() as Promise<T>;
}

function assertGoogleStatus(status: string | undefined, errorMessage: string | undefined): void {
  if (status === "OK" || status === "ZERO_RESULTS") {
    return;
  }

  throw new Error(errorMessage || `Google Places returned ${status || "an unknown status"}.`);
}

function normalizeCountry(country: string): string {
  return country.replace(/[^a-z]/gi, "").slice(0, 2).toLowerCase();
}

function toPlaceSelection(place: NonNullable<GooglePlaceDetailsResponse["result"]>): GooglePlaceSelection {
  const components = getComponents(place.address_components ?? []);
  const formattedAddress = place.formatted_address ?? "";
  const name = place.name ?? "";
  const addressLine = buildAddressLine(components, name, formattedAddress);

  return {
    name,
    formattedAddress,
    addressLine,
    city: components.city,
    state: components.state,
    postalCode: components.postalCode,
    latitude: place.geometry?.location?.lat ?? null,
    longitude: place.geometry?.location?.lng ?? null,
    placeId: place.place_id ?? "",
  };
}

function getComponents(addressComponents: NonNullable<GooglePlaceDetailsResponse["result"]>["address_components"]): AddressComponents {
  const result: AddressComponents = {
    streetNumber: "",
    route: "",
    premise: "",
    city: "",
    state: "",
    postalCode: "",
  };

  for (const component of addressComponents ?? []) {
    const types = component.types ?? [];
    const longName = component.long_name ?? "";

    if (types.includes("street_number")) result.streetNumber = longName;
    if (types.includes("route")) result.route = longName;
    if (types.includes("premise") || types.includes("establishment")) result.premise = longName;
    if (types.includes("locality")) result.city = longName;
    if (!result.city && types.includes("postal_town")) result.city = longName;
    if (!result.city && types.includes("administrative_area_level_2")) result.city = longName;
    if (!result.city && types.includes("sublocality_level_1")) result.city = longName;
    if (types.includes("administrative_area_level_1")) result.state = longName;
    if (types.includes("postal_code")) result.postalCode = longName;
    if (types.includes("postal_code_suffix")) result.postalCode = `${result.postalCode}-${longName}`;
  }

  return result;
}

function buildAddressLine(components: Pick<AddressComponents, "streetNumber" | "route" | "premise">, name: string, formattedAddress: string): string {
  const street = [components.streetNumber, components.route].filter(Boolean).join(" ");
  if (street) return street;
  if (components.premise) return components.premise;
  if (name) return name;
  return formattedAddress;
}
