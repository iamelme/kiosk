import { ProductType } from "@renderer/shared/utils/types";

export type ReturnType = Array<ProductType & { quantity: number; category_name: string }> | null
