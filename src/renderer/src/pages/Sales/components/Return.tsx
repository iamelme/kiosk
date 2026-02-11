import { SaleItemType } from '../../../utils/types'
import Items from '../../../components/Items'
import Dialog from '../../../components/ui/Dialog'
import { ChangeEvent, ReactNode, RefObject } from 'react'
import { Link } from 'react-router-dom'
import { NumericFormat } from 'react-number-format'
import Input from '../../../components/ui/Input'
import Alert from '../../../components/ui/Alert'
import Button from '../../../components/ui/Button'
import { numericFormatLimit } from '../../../utils'

type ReturnProp = {
  ref: RefObject<HTMLButtonElement | null>
  items: SaleItemType[]
  onToggleAll: (e: ChangeEvent<HTMLInputElement>) => void
  onToggleSelect: (id: string | number) => (e: ChangeEvent<HTMLInputElement>) => void
  selectedItems: Map<string, { isChecked: boolean; price: number; newQty: number }>
  onSelectedItems: (v: Map<string, { isChecked: boolean; price: number; newQty: number }>) => void
  errorMessage?: string
  onReturn: () => void
}

export default function Return({
  ref,
  items,
  onToggleAll,
  onToggleSelect,
  selectedItems,
  onSelectedItems,
  errorMessage,
  onReturn
}: ReturnProp): ReactNode {
  return (
    <Dialog>
      <Dialog.Trigger ref={ref} size="sm" variant="outline">
        Return
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Header>
          <h3 className="text-lg">Return</h3>
        </Dialog.Header>
        <Dialog.Body>
          <Items
            items={items}
            headers={[
              { label: 'Name' },
              { label: 'Sold', className: 'text-right' },
              { label: 'Returned', className: 'text-right' },
              { label: 'Available', className: 'text-right' }
            ]}
            hasCheckBox
            onSelectAll={onToggleAll}
            onSelect={onToggleSelect}
            selected={selectedItems}
            renderItems={(item) => (
              <>
                <td className="text-left">
                  <Link to={`/products/${item.product_id}`}>
                    {item.name} - {item.code}
                  </Link>
                </td>
                <td>{item.quantity}</td>
                <td className="text-right">{item.return_qty}</td>
                <td>
                  <NumericFormat
                    displayType={
                      selectedItems.get(`${item.id}`) && item.available_qty > 0 ? 'input' : 'text'
                    }
                    customInput={Input}
                    value={item.available_qty}
                    isAllowed={numericFormatLimit(item.available_qty)}
                    className="text-right"
                    onValueChange={(values) => {
                      const { floatValue } = values
                      console.log({ floatValue })
                      const items = new Map(selectedItems)
                      if (floatValue) {
                        onSelectedItems(
                          items.set(`${item.id}`, {
                            isChecked: true,
                            price: item.unit_price,
                            newQty: floatValue
                          })
                        )
                      } else {
                        items.delete(`${item.id}`)
                        onSelectedItems(items)
                      }
                    }}
                  />
                </td>
              </>
            )}
          />
          {errorMessage && (
            <Alert variant="danger" className="text-left">
              {errorMessage}
            </Alert>
          )}
        </Dialog.Body>
        <Dialog.Footer>
          <Dialog.Close variant="outline">Cancel</Dialog.Close>
          <Button onClick={() => onReturn()}>Return</Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  )
}
