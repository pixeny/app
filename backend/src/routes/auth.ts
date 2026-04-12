import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase, supabaseAdmin } from '../config/supabase';
import { createError } from '../middleware/errorHandler';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

router.post('/register', async (req, res, next) => {
  try {
    const { email, password, full_name, phone, role } = req.body;

    if (!email || !password || !full_name || !phone || !role) {
      throw createError('All fields are required', 400);
    }

    if (!['rider', 'driver'].includes(role)) {
      throw createError('Invalid role', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .insert({
        id: uuidv4(),
        email,
        password: hashedPassword,
        full_name,
        phone,
        role
      })
      .select()
      .single();

    if (error) {
      console.log('Supabase error during user creation:', error);
      if (error.code === '23505') {
        throw createError('Email already exists', 409);
      }
      console.log('Error details:', JSON.stringify(error, null, 2));
      throw createError('Registration failed: ' + (error.message || 'Unknown error'), 500);
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    // Try to create balance record, but don't fail if it exists
    try {
      await supabaseAdmin
        .from('user_balances')
        .insert({
          id: uuidv4(),
          user_id: user.id,
          balance: 0
        });
    } catch (balanceError) {
      // Ignore balance creation errors
      console.log('Balance creation failed, but continuing:', balanceError);
    }

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw createError('Email and password are required', 400);
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      throw createError('Invalid credentials', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw createError('Invalid credentials', 401);
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    const { data: balance } = await supabase
      .from('user_balances')
      .select('balance')
      .eq('user_id', user.id)
      .single();

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        role: user.role,
        balance: balance?.balance || 0
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
