import { render, screen } from '@testing-library/react'
import Summary from './Summary'
import { describe, it, expect } from 'vitest'
import '@testing-library/jest-dom/vitest'

const data = {
  id: 1,
  sub_total: 9200,
  discount: 0,
  total: 9200,
  items: [
    {
      id: 183,
      quantity: 6,
      cart_id: 1,
      product_id: 44,
      user_id: 3,
      price: 1200,
      cost: 1000,
      name: 'Ariel',
      sku: 'ARIEL',
      code: 11111,
      product_quantity: 6
    },
    {
      id: 184,
      quantity: 2,
      cart_id: 1,
      product_id: 30,
      user_id: 3,
      price: 1000,
      cost: 850,
      name: 'Sunsilk red',
      sku: 'SUNSILK-RED',
      code: 2222,
      product_quantity: 7
    }
  ]
}

describe('Summary', () => {
  it('Check items quantity', () => {
    render(
      <Summary
        data={data}
        onChangeDiscount={(v) => {
          console.log('on change summary', v)
        }}
      >
        <Summary.NoOfItems />
        <Summary.SubTotal />
        <Summary.Discount />
        <Summary.Tax />
        <Summary.Total />
      </Summary>
    )
    expect(screen.getByTestId('noOfItems').textContent).toBe('8')
  })

  it('Check sub total', () => {
    expect(screen.getByTestId('subTotal').textContent).toBe('₱92.00')
  })
  it('Check total', () => {
    expect(screen.getByTestId('total').textContent).toBe('₱92.00')
  })
})
