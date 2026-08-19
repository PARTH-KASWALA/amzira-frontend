import { z } from "zod";
import { browserApi } from "@/lib/api/browser-client";
import type { Address, AddressInput, Customer } from "@/lib/api/types";

const customerSchema = z.object({
  id: z.coerce.number(),
  email: z.string().email(),
  full_name: z.string().nullish(),
  phone: z.string().nullish(),
  role: z.union([z.string(), z.object({ value: z.string() })]).optional()
});

const addressSchema = z.object({
  id: z.coerce.number(),
  user_id: z.coerce.number(),
  full_name: z.string(),
  phone: z.string(),
  address_line1: z.string(),
  address_line2: z.string().nullish(),
  city: z.string(),
  state: z.string(),
  pincode: z.string(),
  country: z.string().default("India"),
  address_type: z.string().default("home"),
  is_default: z.boolean().default(false)
});

function mapCustomer(input: unknown): Customer {
  const value = customerSchema.parse(input);
  return {
    id: value.id,
    email: value.email,
    fullName: value.full_name || "",
    phone: value.phone || "",
    role: typeof value.role === "string" ? value.role : value.role?.value || "customer"
  };
}

function mapAddress(input: unknown): Address {
  const value = addressSchema.parse(input);
  return {
    id: value.id,
    userId: value.user_id,
    fullName: value.full_name,
    phone: value.phone,
    addressLine1: value.address_line1,
    addressLine2: value.address_line2 || "",
    city: value.city,
    state: value.state,
    pincode: value.pincode,
    country: value.country,
    addressType: value.address_type,
    isDefault: value.is_default
  };
}

function addressPayload(input: AddressInput) {
  return {
    full_name: input.fullName,
    phone: input.phone,
    address_line1: input.addressLine1,
    address_line2: input.addressLine2 || null,
    city: input.city,
    state: input.state,
    pincode: input.pincode,
    country: input.country,
    address_type: input.addressType,
    is_default: input.isDefault
  };
}

export async function getCurrentCustomer() {
  return mapCustomer(await browserApi<unknown>("/users/me"));
}

export async function updateCurrentCustomer(input: { fullName: string; phone: string }) {
  return mapCustomer(
    await browserApi<unknown>("/users/me", {
      method: "PUT",
      body: JSON.stringify({ full_name: input.fullName, phone: input.phone })
    })
  );
}

export async function getAddresses() {
  const values = await browserApi<unknown[]>("/users/me/addresses");
  return z.array(addressSchema).parse(values).map(mapAddress);
}

export async function createAddress(input: AddressInput) {
  return mapAddress(
    await browserApi<unknown>("/users/me/addresses", {
      method: "POST",
      body: JSON.stringify(addressPayload(input))
    })
  );
}

export async function updateAddress(id: number, input: AddressInput) {
  return mapAddress(
    await browserApi<unknown>(`/users/me/addresses/${id}`, {
      method: "PUT",
      body: JSON.stringify(addressPayload(input))
    })
  );
}

export async function deleteAddress(id: number) {
  await browserApi(`/users/me/addresses/${id}`, { method: "DELETE" });
}
