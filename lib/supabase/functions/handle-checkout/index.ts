// supabase/functions/handle-checkout/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CheckoutItem {
  product_id: number
  quantity: number
  harga_jual: number
  harga_beli: number
}

interface CheckoutRequest {
  user_id: string
  items: CheckoutItem[]
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { user_id, items }: CheckoutRequest = await req.json()

    // Validate request
    if (!user_id || !items || items.length === 0) {
      throw new Error('Invalid request: user_id and items are required')
    }

    // Calculate totals
    let total_amount = 0
    let total_hpp = 0

    for (const item of items) {
      total_amount += item.harga_jual * item.quantity
      total_hpp += item.harga_beli * item.quantity
    }

    // Start transaction
    // 1. Create transaction record
    const { data: transaction, error: transactionError } = await supabaseClient
      .from('transactions')
      .insert({
        user_id,
        total_amount,
        total_hpp,
      })
      .select()
      .single()

    if (transactionError) throw transactionError

    // 2. Insert transaction items and update stock
    for (const item of items) {
      // Insert transaction item
      const { error: itemError } = await supabaseClient
        .from('transaction_items')
        .insert({
          transaction_id: transaction.id,
          product_id: item.product_id,
          quantity: item.quantity,
          harga_jual_saat_itu: item.harga_jual,
          harga_beli_saat_itu: item.harga_beli,
        })

      if (itemError) throw itemError

      // Update product stock
      const { data: product, error: productError } = await supabaseClient
        .from('products')
        .select('stock')
        .eq('id', item.product_id)
        .single()

      if (productError) throw productError

      const new_stock = product.stock - item.quantity

      if (new_stock < 0) {
        throw new Error(`Insufficient stock for product ID ${item.product_id}`)
      }

      const { error: updateError } = await supabaseClient
        .from('products')
        .update({ stock: new_stock })
        .eq('id', item.product_id)

      if (updateError) throw updateError
    }

    return new Response(
      JSON.stringify({
        success: true,
        transaction_id: transaction.id,
        message: 'Checkout completed successfully',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Checkout error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})