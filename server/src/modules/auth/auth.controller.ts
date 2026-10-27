import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../../models/User';
import { env } from '../../config/env';
import { AppError } from '../../middleware/error.middleware';
import { logAuditEvent } from '../../middleware/audit.middleware';
import { AuthenticatedRequest, AuthUserPayload } from '../../types';

function generateTokens(user: IUser) {
  const payload: AuthUserPayload = {
    userId: (user._id as any).toString(),
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    employeeId: user.employeeId,
    customerId: user.customerId,
    branchId: user.branchId?.toString(),
  };

  const accessToken = jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: '15m',
  });

  const refreshToken = jwt.sign(
    { userId: (user._id as any).toString() },
    env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken, payload };
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { identifier, password } = req.body;
    const cleanId = identifier.trim().toLowerCase();

    // Find by email or employeeId
    const user = await User.findOne({
      $or: [{ email: cleanId }, { employeeId: identifier.trim().toUpperCase() }],
    }).select('+passwordHash');

    if (!user) {
      throw new AppError('Invalid email/employee ID or password', 401);
    }

    if (!user.isActive) {
      throw new AppError('Account is deactivated. Please contact your administrator.', 403);
    }

    if (user.lockUntil && user.lockUntil > new Date()) {
      const waitMinutes = Math.ceil((user.lockUntil.getTime() - Date.now()) / 60000);
      throw new AppError(
        `Account is temporarily locked due to multiple failed login attempts. Please try again in ${waitMinutes} minutes.`,
        429
      );
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // lock 15 mins
      }
      await user.save();

      await logAuditEvent(req as AuthenticatedRequest, 'LOGIN_FAILED', 'User', user.id, {
        identifier,
        reason: 'Incorrect password',
      });

      throw new AppError('Invalid email/employee ID or password', 401);
    }

    // Reset failed login attempts on successful login
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLoginAt = new Date();

    const { accessToken, refreshToken, payload } = generateTokens(user);

    user.refreshTokens = [...(user.refreshTokens || []).slice(-4), refreshToken];
    await user.save();

    // Set refresh token in HttpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    await logAuditEvent(
      { ...req, user: payload } as AuthenticatedRequest,
      'LOGIN_SUCCESS',
      'User',
      user.id,
      { role: user.role }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        accessToken,
        refreshToken,
        user: payload,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!token) {
      throw new AppError('Refresh token required', 401);
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);
    } catch {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      throw new AppError('User not found or inactive', 401);
    }

    if (!user.refreshTokens.includes(token)) {
      // Possible token reuse attempt: invalidate all tokens
      user.refreshTokens = [];
      await user.save();
      throw new AppError('Session invalidated due to suspicious activity. Please login again.', 401);
    }

    // Rotate refresh token
    const { accessToken, refreshToken: newRefreshToken, payload } = generateTokens(user);
    user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
    user.refreshTokens.push(newRefreshToken);
    await user.save();

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      data: {
        accessToken,
        refreshToken: newRefreshToken,
        user: payload,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (token && req.user) {
      await User.findByIdAndUpdate(req.user.userId, {
        $pull: { refreshTokens: token },
      });
    }

    res.clearCookie('refreshToken');

    if (req.user) {
      await logAuditEvent(req, 'LOGOUT', 'User', req.user.userId);
    }

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
}

export async function getMe(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const user = await User.findById(req.user.userId).populate('branchId');
    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
          role: user.role,
          employeeId: user.employeeId,
          customerId: user.customerId,
          branch: user.branchId,
          isActive: user.isActive,
          lastLoginAt: user.lastLoginAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}
