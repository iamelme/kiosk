import { Direction, InventoryType } from "../../../shared/utils/types"

export type InventoryMovement = {
  id: number
  movement_type: number
  reference_type: ''
}

export type InventoryMovementParams = {
  startDate?: string
  endDate?: string
  pageSize: number
  id: number
  cursorId: number
  direction?: Direction
}

export type InventoryMovementReturn = InventoryType & {
  created_at: string
}
