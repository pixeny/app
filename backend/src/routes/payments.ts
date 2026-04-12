import express from 'express';
import { supabase } from '../config/supabase';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

router.get('/history', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { limit = 10, offset = 0 } = req.query;

    const { data: payments, error } = await supabase
      .from('payments')
      .select(`
        *,
        rides!payments_ride_id_fkey (
          origin,
          destination,
          status,
          created_at
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit as string))
      .range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1);

    if (error) {
      throw createError('Failed to fetch payment history', 500);
    }

    res.json({ payments: payments || [] });
  } catch (error) {
    next(error);
  }
});

router.post('/add-balance', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { amount, method = 'card' } = req.body;

    if (!amount || amount <= 0) {
      throw createError('Invalid amount', 400);
    }

    const { data: currentBalance, error: balanceError } = await supabase
      .from('user_balances')
      .select('balance')
      .eq('user_id', userId)
      .single();

    if (balanceError && balanceError.code !== 'PGRST116') {
      throw createError('Failed to fetch current balance', 500);
    }

    const newBalance = (currentBalance?.balance || 0) + amount;

    const { data: balance, error } = await supabase
      .from('user_balances')
      .upsert({
        user_id: userId,
        balance: newBalance
      })
      .select('balance')
      .single();

    if (error) {
      throw createError('Failed to add balance', 500);
    }

    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        id: uuidv4(),
        ride_id: null,
        user_id: userId,
        amount,
        method,
        status: 'completed',
        transaction_id: uuidv4()
      });

    if (paymentError) {
      console.error('Failed to record payment transaction:', paymentError);
    }

    res.json({
      message: 'Balance added successfully',
      balance: balance.balance
    });
  } catch (error) {
    next(error);
  }
});

router.get('/balance', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;

    const { data: balance, error } = await supabase
      .from('user_balances')
      .select('balance')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw createError('Failed to fetch balance', 500);
    }

    res.json({
      balance: balance?.balance || 0
    });
  } catch (error) {
    next(error);
  }
});

router.post('/withdraw', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      throw createError('Invalid amount', 400);
    }

    const { data: balance, error: balanceError } = await supabase
      .from('user_balances')
      .select('balance')
      .eq('user_id', userId)
      .single();

    if (balanceError || !balance) {
      throw createError('Balance not found', 404);
    }

    if (balance.balance < amount) {
      throw createError('Insufficient balance', 400);
    }

    const { error: updateError } = await supabase
      .from('user_balances')
      .update({ balance: balance.balance - amount })
      .eq('user_id', userId);

    if (updateError) {
      throw createError('Failed to withdraw balance', 500);
    }

    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        id: uuidv4(),
        ride_id: null,
        user_id: userId,
        amount: -amount,
        method: 'balance',
        status: 'completed',
        transaction_id: uuidv4()
      });

    if (paymentError) {
      console.error('Failed to record withdrawal transaction:', paymentError);
    }

    res.json({
      message: 'Withdrawal successful',
      amount,
      remainingBalance: balance.balance - amount
    });
  } catch (error) {
    next(error);
  }
});

export default router;
