export type CollectionLocation = {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  latitude: number | null;
  longitude: number | null;
  googlePlaceId: string | null;
  imageUrl: string | null;
  createdAt: string;
  createdBy: string | null;
};

export type CreateCollectionLocationInput = {
  name: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  googlePlaceId?: string;
  latitude?: number | null;
  longitude?: number | null;
  imageUrl?: string | null;
};

export type UpdateCollectionLocationInput = Partial<{
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  googlePlaceId: string | null;
  latitude: number | null;
  longitude: number | null;
  imageUrl: string | null;
}>;
