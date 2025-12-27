// supabase/functions/handle-restock/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RestockRequest {
  user_id: string
  product_id: number
  quantity: number
  harga_beli_baru: number
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

    const { user_id, product_id, quantity, harga_beli_baru }: RestockRequest = await req.json()

    // Validate request
    if (!user_id || !product_id || !quantity || quantity <= 0 || !harga_beli_baru || harga_beli_baru <= 0) {
      throw new Error('Invalid request: all fields are required and must be valid')
    }

    // Get current product data
    const { data: product, error: productError } = await supabaseClient
      .from('products')
      .select('stock, harga_beli')
      .eq('id', product_id)
      .eq('user_id', user_id)
      .single()

    if (productError) throw productError
    if (!product) throw new Error('Product not found')

    // Calculate new HPP using Weighted Average method
    const current_stock = product.stock
    const current_hpp = product.harga_beli
    const new_quantity = quantity
    const new_purchase_price = harga_beli_baru

    const current_value = current_stock * current_hpp
    const new_value = new_quantity * new_purchase_price
    const total_stock = current_stock + new_quantity
    const new_hpp = (current_value + new_value) / total_stock

    // Start transaction
    // 1. Insert stock_ins record
    const { error: stockInError } = await supabaseClient
      .from('stock_ins')
      .insert({
        user_id,
        product_id,
        quantity: new_quantity,
        harga_beli_baru: new_purchase_price,
      })

    if (stockInError) throw stockInError

    // 2. Update product with new stock and HPP
    const { error: updateError } = await supabaseClient
      .from('products')
      .update({
        stock: total_stock,
        harga_beli: new_hpp,
      })
      .eq('id', product_id)
      .eq('user_id', user_id)

    if (updateError) throw updateError

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Restock completed successfully',
        data: {
          old_stock: current_stock,
          new_stock: total_stock,
          old_hpp: current_hpp,
          new_hpp: new_hpp,
          hpp_change: new_hpp - current_hpp,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Restock error:', error)
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