import express from 'express';
import { supabase } from '../config/supabase';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

const router = express.Router();

router.get('/profile', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, full_name, phone, role, created_at')
      .eq('id', userId)
      .single();

    if (error || !user) {
      throw createError('User not found', 404);
    }

    const { data: balance } = await supabase
      .from('user_balances')
      .select('balance')
      .eq('user_id', userId)
      .single();

    res.json({
      ...user,
      balance: balance?.balance || 0
    });
  } catch (error) {
    next(error);
  }
});

router.put('/profile', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { full_name, phone } = req.body;

    const { data: user, error } = await supabase
      .from('users')
      .update({ full_name, phone })
      .eq('id', userId)
      .select('id, email, full_name, phone, role')
      .single();

    if (error || !user) {
      throw createError('Profile update failed', 500);
    }

    res.json({
      message: 'Profile updated successfully',
      user
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

router.post('/balance/add', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      throw createError('Invalid amount', 400);
    }

    const { data: balance, error } = await supabase
      .from('user_balances')
      .upsert({
        user_id: userId,
        balance: amount
      })
      .select('balance')
      .single();

    if (error) {
      throw createError('Failed to add balance', 500);
    }

    res.json({
      message: 'Balance added successfully',
      balance: balance.balance
    });
  } catch (error) {
    next(error);
  }
});

export default router;
