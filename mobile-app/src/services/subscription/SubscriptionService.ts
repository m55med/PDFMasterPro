/**
 * Subscription Service
 * Manages RevenueCat integration and subscription logic
 */

// Note: This is a placeholder for RevenueCat integration
// In production, you would install: npm install react-native-purchases

export interface SubscriptionPlan {
  id: 'free' | 'monthly' | 'yearly' | 'lifetime';
  name: string;
  price: number;
  currency: string;
  features: string[];
  limits?: {
    filesPerDay?: number;
    maxFileSize?: number; // MB
    cloudStorage?: number; // GB
  };
}

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'USD',
    features: [
      'Basic PDF tools',
      '5 files per day',
      'Max 10MB per file',
      'Ads supported',
    ],
    limits: {
      filesPerDay: 5,
      maxFileSize: 10,
    },
  },
  {
    id: 'monthly',
    name: 'Pro Monthly',
    price: 4.99,
    currency: 'USD',
    features: [
      'All PDF tools',
      'Unlimited files',
      'Max 100MB per file',
      'No ads',
      'Priority support',
      'Cloud sync (5GB)',
      'OCR & Advanced tools',
    ],
    limits: {
      maxFileSize: 100,
      cloudStorage: 5,
    },
  },
  {
    id: 'yearly',
    name: 'Pro Yearly',
    price: 39.99,
    currency: 'USD',
    features: [
      'All Pro features',
      'Save 33%',
      'Cloud sync (20GB)',
      '1 year support',
    ],
    limits: {
      maxFileSize: 100,
      cloudStorage: 20,
    },
  },
];

export class SubscriptionService {
  private static isInitialized = false;

  /**
   * Initialize RevenueCat SDK
   */
  static async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // TODO: Implement RevenueCat initialization
      // const apiKey = Platform.OS === 'ios' ? IOS_API_KEY : ANDROID_API_KEY;
      // await Purchases.configure({ apiKey });
      
      this.isInitialized = true;
      console.log('RevenueCat initialized');
    } catch (error) {
      console.error('Failed to initialize RevenueCat:', error);
      throw error;
    }
  }

  /**
   * Get current subscription status
   */
  static async getSubscriptionStatus(): Promise<{
    isPro: boolean;
    plan: string;
    expiresAt?: Date;
  }> {
    try {
      // TODO: Implement with RevenueCat
      // const { customerInfo } = await Purchases.getCustomerInfo();
      // const isPro = customerInfo.entitlements.active['pro'] !== undefined;
      
      return {
        isPro: false,
        plan: 'free',
      };
    } catch (error) {
      console.error('Failed to get subscription status:', error);
      throw error;
    }
  }

  /**
   * Purchase a subscription
   */
  static async purchaseSubscription(productId: string): Promise<boolean> {
    try {
      // TODO: Implement with RevenueCat
      // const { customerInfo } = await Purchases.purchaseProduct(productId);
      // return customerInfo.entitlements.active['pro'] !== undefined;
      
      console.log('Purchase subscription:', productId);
      return false;
    } catch (error: any) {
      if (error.userCancelled) {
        return false;
      }
      console.error('Purchase failed:', error);
      throw error;
    }
  }

  /**
   * Restore purchases
   */
  static async restorePurchases(): Promise<boolean> {
    try {
      // TODO: Implement with RevenueCat
      // const { customerInfo } = await Purchases.restorePurchases();
      // return customerInfo.entitlements.active['pro'] !== undefined;
      
      console.log('Restore purchases');
      return false;
    } catch (error) {
      console.error('Failed to restore purchases:', error);
      throw error;
    }
  }

  /**
   * Get available products
   */
  static async getProducts(): Promise<any[]> {
    try {
      // TODO: Implement with RevenueCat
      // const offerings = await Purchases.getOfferings();
      // return offerings.current?.availablePackages || [];
      
      return [];
    } catch (error) {
      console.error('Failed to get products:', error);
      throw error;
    }
  }

  /**
   * Check if user can perform action based on limits
   */
  static async checkLimit(
    action: 'filesPerDay' | 'maxFileSize' | 'cloudStorage',
    value: number
  ): Promise<{ allowed: boolean; message?: string }> {
    const status = await this.getSubscriptionStatus();
    const plan = subscriptionPlans.find(p => p.id === status.plan) || subscriptionPlans[0];
    
    if (!plan.limits) {
      return { allowed: true };
    }

    const limit = plan.limits[action];
    if (!limit) {
      return { allowed: true };
    }

    if (value > limit) {
      return {
        allowed: false,
        message: `This action requires ${action} limit of ${limit}. Upgrade to Pro!`,
      };
    }

    return { allowed: true };
  }
}
