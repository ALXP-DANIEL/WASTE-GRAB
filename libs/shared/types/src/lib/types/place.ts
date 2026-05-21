export type PlacePrediction = {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
};

export type GooglePlaceSelection = {
  name: string;
  formattedAddress: string;
  addressLine: string;
  city: string;
  state: string;
  postalCode: string;
  latitude: number | null;
  longitude: number | null;
  placeId: string;
};
