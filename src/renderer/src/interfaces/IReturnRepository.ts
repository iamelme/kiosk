import { ErrorType, ReturnType } from '../shared/utils/types'

export type Return = {
  data: null
  error: ErrorType
}

export interface IReturnRepository {
  create({ sale_id, user_id, items, refund_amount }: ReturnType): Return
}
