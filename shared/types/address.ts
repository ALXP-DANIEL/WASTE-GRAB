export type Address = {
  id: string;
  userId: string;
  label: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  formattedAddress: string | null;
  googlePlaceId: string | null;
  latitude: number | null;
  longitude: number | null;
  notes: string | null;
  isDefault: boolean;
  createdAt: string;
};

export type CreateAddressInput = {
  label: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  formattedAddress?: string | null;
  googlePlaceId?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  notes?: string;
};

export type UpdateAddressInput = Partial<CreateAddressInput & { isDefault?: boolean }>;
