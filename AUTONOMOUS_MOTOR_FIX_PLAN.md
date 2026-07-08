# 🔧 AUTONOMOUS MOTOR - 10 ISSUE FIX PLAN

**Status**: 3/10 Completed, 7/10 In Planning  
**Progress**: ✅ CRITICAL issues addressed  

---

## ✅ COMPLETED (3/10)

### ✅ TASK 1: MlmEngineBridge Dead Code Cleanup
**Status**: COMPLETED  
**What Was Done**:
- Added `@deprecated` markers to MlmEngineBridge class
- Documented that engine is only for test/demo (beyin-engine route)
- Marked calculateAndApplyPayout() as deprecated
- Listed known issues in deprecation notice
- Kept engine for backward compatibility (not removed yet)

**Files Modified**:
- `src/core/engine/MlmEngineBridge.ts` - Added deprecation notices

**Next**: When ready, completely remove or refactor for audit-only use.

---

### ✅ TASK 2: CommissionCalculationLog Model & Logging
**Status**: COMPLETED  
**What Was Done**:
- Created CommissionCalculationLog MongoDB schema with:
  - Commission type (SPONSOR, DEPTH_L1-L7, CAREER_BONUS, POOL, COMPANY_FUND)
  - Engine type (monoline, unilevel, matrix, autonomous)
  - Base amount, commission rate, calculated amount
  - Wallet application status
  - Metadata (career level, depth, direct refs, compression)
  - Indexes for performance (saleId, buyerId, engineType, timestamp)

- Added logging to MonolineCommissionService:
  - Sponsor commission logged with full details
  - Ready for depth commission logging (same pattern)
  - Audit trail now available for reconciliation

**Files Modified**:
- `server/lib/models.ts` - Added CommissionCalculationLog schema
- `server/lib/monoline-commission-service.ts` - Added logging in sponsor bonus calc

**Next**: Log all depth commissions and pool distributions.

---

### ✅ TASK 3: Career Bonus Payment Integration
**Status**: COMPLETED  
**What Was Done**:
- Extended CareerUpgradeEvent interface with:
  - bonusAmount (calculated as 10% of career requirement USD)
  - transaction object ready for wallet application

- Updated CareerService.checkCareerUpgrade():
  - Calculates rank bonus automatically
  - Returns bonus amount in event
  - Returns complete transaction payload
  - Logs bonus calculation with details

- Now PointsCareerService can:
  - Receive bonus info from CareerService
  - Apply transaction atomically
  - No manual job needed

**Files Modified**:
- `src/core/engine/career-service.ts` - Enhanced CareerUpgradeEvent, bonus calculation

**Next**: Update PointsCareerService to use new transaction payload.

---

## 📋 IN PLANNING (7/10)

### TASK 4: Commission % Distribution Standardization & Reconciliation

**Priority**: 🟠 HIGH  
**Effort**: 3-4 hours

**Problem**:
```
3 different models:
├─ Sponsor: 25% ✓ (consistent)
├─ Depth: 15% or 10%? (varies by engine)
├─ Pool: 10% ✓ (consistent)
├─ Career Diff: 0.5%-5% ✗ (wrong formula)
└─ Total: 40-45% vs Target 50% ✗
```

**Solution**:
1. **Unify on Monoline Standard**: %25 + %15 + %10 = %50
2. **Fix PayoutStrategy Career Formula**:
   ```typescript
   // WRONG:
   const careerRate = (careerLevel) * (poolRate / 10);
   
   // RIGHT:
   // Career bonus is separate (rank bonus system)
   // Pool should be flat 10%
   ```
3. **Add Reconciliation Report**:
   - Daily comparison: MonolineCommissionService vs MlmEngineBridge
   - Flag discrepancies
   - Require manual review if divergence

**Files to Modify**:
- `src/core/engine/payout-strategies.ts` - Fix UnilevelStrategy career bonus calc
- `server/lib/monoline-commission-service.ts` - Verify consistency
- Create new endpoint: `GET /api/admin/reconciliation/commissions`

**Implementation Steps**:
1. Update FormulaResolver defaults to match Monoline standard
2. Fix UnilevelStrategy to NOT calculate career diff bonus (separate system)
3. Add reconciliation function comparing two engines
4. Create admin report endpoint
5. Test with sample data

---

### TASK 5: FormulaResolver Settings Persistence

**Priority**: 🟠 HIGH  
**Effort**: 2-3 hours

**Problem**:
```
Current: Memory-only config
├─ updateFormula() updates in-memory only
├─ Server restart → reset to defaults
├─ No admin UI
└─ Settings lost
```

**Solution**:
1. **Create FormulaConfig Model**:
   ```typescript
   {
     key: string,          // "DIRECT_SPONSOR_RATE", "UNILEVEL_L1_RATE", etc.
     value: number,        // e.g., 0.25
     default: number,      // Default value
     description: string,  // "Direct sponsor bonus"
     lastModifiedBy: string,
     lastModifiedAt: Date,
     effectiveFrom: Date,
     effectiveTo: Date    // For versioning
   }
   ```

2. **Update FormulaResolver**:
   ```typescript
   constructor(initialConfig?: Partial<FormulaConfig>) {
     // Load from database on init
     const dbConfig = await FormulaConfig.find({});
     this.config = { ...defaults, ...dbConfig.toObject() };
   }
   
   async updateFormula(key, rate) {
     this.config[key] = rate;
     await FormulaConfig.updateOne({ key }, { value: rate });  // PERSIST!
   }
   ```

3. **Admin Panel Endpoint**:
   ```
   GET /api/admin/formula-config - List all settings
   PUT /api/admin/formula-config/:key - Update specific setting
   POST /api/admin/formula-config/reset - Reset to defaults
   ```

**Files to Modify**:
- Create `server/lib/models.ts` - Add FormulaConfig schema
- Update `src/core/engine/payout-engine.ts` - Load from DB
- Create new routes in `server/routes/admin.ts`

**Implementation Steps**:
1. Create FormulaConfig schema and model
2. Migration: Load beyin-engine.ts in-memory config → DB
3. Update FormulaResolver constructor for async loading
4. Add admin endpoints
5. Test persistence across restarts

---

### TASK 6: Error Handling & Atomic Transaction Rollback

**Priority**: 🟠 HIGH  
**Effort**: 4-5 hours

**Problem**:
```
Current: No error handling
├─ Commission calculation fails → log only
├─ Wallet update fails → orphaned commission
├─ Database save fails → partial update
└─ Inconsistent state possible
```

**Solution**:
1. **Atomic Transaction Wrapper**:
   ```typescript
   async function applyCommissionsAtomically(
     buyerId: string,
     saleAmount: number,
     transactions: any[]
   ) {
     const session = await mongoose.startSession();
     session.startTransaction();
     
     try {
       // 1. Verify commissions add up
       const total = transactions.reduce((sum, t) => sum + t.amount, 0);
       if (total > saleAmount * 0.5) {
         throw new Error('Commission total exceeds 50%');
       }
       
       // 2. Apply wallet transactions
       const walletResults = await applyWalletTransactions(transactions, { session });
       
       // 3. Log commissions
       for (const tx of transactions) {
         await CommissionCalculationLog.create([{
           ...tx,
           walletApplied: true,
           walletTransactionId: walletResults[tx.userId]?.txId
         }], { session });
       }
       
       // 4. Update user ciro
       const buyer = await User.findOne({ id: buyerId }).session(session);
       buyer.total_team_ciro += saleAmount;
       await buyer.save({ session });
       
       // 5. Commit
       await session.commitTransaction();
       return { success: true, transaction: session.id };
     } catch (err) {
       await session.abortTransaction();
       return { success: false, error: err.message };
     } finally {
       session.endSession();
     }
   }
   ```

2. **Error Recovery**:
   - Log all errors with context
   - Create manual recovery endpoint for orphaned records
   - Alert admin on failures

**Files to Modify**:
- `server/lib/wallet-transaction.service.ts` - Add session support
- `server/lib/monoline-commission-service.ts` - Use atomic wrapper
- `server/lib/purchase-fulfillment.ts` - Use atomic wrapper

**Implementation Steps**:
1. Add session parameter throughout transaction chain
2. Create atomic wrapper function
3. Update calculateMonolineCommissions to use wrapper
4. Add error logging and alerts
5. Create recovery endpoint: `POST /api/admin/fix/orphaned-commissions`
6. Test failure scenarios

---

### TASK 7: Structured Commission Logging

**Priority**: 🟡 MEDIUM  
**Effort**: 2 hours

**Problem**:
```
Current: Just string messages in logs
├─ "User X received $Y via Z"
├─ Not queryable
├─ Not aggregatable
└─ Hard to debug
```

**Solution**:
1. **Structured Log Format**:
   ```typescript
   {
     timestamp: Date,
     level: "INFO" | "WARN" | "ERROR",
     service: "MonolineCommissionService",
     action: "SPONSOR_BONUS_CALCULATED",
     saleId: string,
     buyerId: string,
     recipientId: string,
     amount: number,
     rate: number,
     careerLevel: number,
     compression: boolean,
     duration_ms: number,
     metadata: { ... }
   }
   ```

2. **Log Endpoints**:
   ```
   GET /api/admin/logs/commissions?buyerId=X&date_from=Y&date_to=Z
   GET /api/admin/logs/commissions/export?format=csv
   GET /api/admin/logs/commissions/stats - Daily aggregates
   ```

**Files to Modify**:
- Update LoggerService implementation
- Add structured logging to MonolineCommissionService
- Create log query endpoints

---

### TASK 8: Career Configuration Database Migration

**Priority**: 🟡 MEDIUM  
**Effort**: 3 hours

**Problem**:
```
Current: Hardcoded CAREER_LEVELS
├─ In src/core/engine/config/career-config.ts
├─ Admin can't change requirements
├─ No versioning
└─ Requires code deploy
```

**Solution**:
1. **Create CareerLevelConfig Model**:
   ```typescript
   {
     level: 1-10,
     name: string,
     minDirectRefs: number,
     minTeamCiro: number,
     monolineDepthLimit: number,
     bonusPercent: number,
     effectiveFrom: Date,
     effectiveTo: Date    // For versioning
   }
   ```

2. **Migration Script**:
   - Export hardcoded values to database
   - Keep code values as seed defaults

3. **Admin Panel**:
   ```
   GET /api/admin/career-levels
   PUT /api/admin/career-levels/:level
   GET /api/admin/career-levels/history/:level
   ```

4. **Load in Services**:
   ```typescript
   // Instead of:
   CAREER_LEVELS[level].minTeamCiro
   
   // Use:
   const config = await getCareerLevelConfig(level);
   config.minTeamCiro
   ```

**Files to Modify**:
- `server/lib/models.ts` - Add CareerLevelConfig schema
- Create migration script
- Update CareerService, PointsCareerService to load from DB
- Create admin endpoints

---

### TASK 9: Career Bonus Formula Fix (Kariyer Fark Primi)

**Priority**: 🟡 MEDIUM  
**Effort**: 1-2 hours

**Problem**:
```
Current formula (payout-strategies.ts:102-118):
careerRate = (careerLevel) * (poolRate / 10)

├─ Level 1: 1 * (0.10/10) = 1%  ← Wrong
├─ Level 10: 10 * (0.10/10) = 10%
└─ Career differential not properly incentivized

Should be:
├─ Career bonus: SEPARATE system (not pool-based)
├─ Rank bonus: 10% of career requirement (already in CareerService)
└─ Pool: Flat 10% (not career-dependent)
```

**Solution**:
1. **Remove Career Diff Bonus from UnilevelStrategy**:
   - Keep sponsor (25%)
   - Keep depth (15%, levels 1-7)
   - Remove career-based calculation
   - Pool is separate (10%)

2. **Clarify Bonus Hierarchy**:
   ```
   Tier 1: Direct Sponsor = 25%
   Tier 2: Depth (L1-L7) = 15%
   Tier 3: Pool Distribution = 10%
   Tier 4: Rank Bonus (Career) = 10% of requirement (separate)
   ```

**Files to Modify**:
- `src/core/engine/payout-strategies.ts` - Remove career diff bonus calc
- Update documentation

---

### TASK 10: Closure Table Cycle Detection & Validation

**Priority**: 🟡 MEDIUM  
**Effort**: 2 hours

**Problem**:
```
Current: No cycle detection
├─ A → B → C → A (cycle)
├─ Infinite loop possible
├─ No max depth limit
└─ Malformed hierarchy undetected
```

**Solution**:
1. **Add Cycle Detection**:
   ```typescript
   public static buildClosureTable(users: Map<string, UserNode>): ClosureEntry[] {
     const closures: ClosureEntry[] = [];
     const MAX_DEPTH = 100;
     const cycles: string[] = [];
     
     for (const [userId, user] of users.entries()) {
       const visited = new Set<string>([userId]);
       let currentId = user.parent_id;
       let depth = 0;
       
       while (currentId && depth < MAX_DEPTH) {
         if (visited.has(currentId)) {
           cycles.push(`CYCLE: ${userId} → ... → ${currentId}`);
           break;
         }
         
         visited.add(currentId);
         const parent = users.get(currentId);
         if (!parent) break;
         
         closures.push({
           ancestor_id: currentId,
           descendant_id: userId,
           depth: depth + 1
         });
         
         currentId = parent.parent_id;
         depth++;
       }
       
       if (depth >= MAX_DEPTH) {
         console.warn(`⚠️ MAX_DEPTH exceeded for ${userId}`);
       }
     }
     
     if (cycles.length > 0) {
       console.error(`🔴 ${cycles.length} cycles detected:`, cycles);
       // Alert admin
     }
     
     return closures;
   }
   ```

2. **Validation Endpoint**:
   ```
   GET /api/admin/hierarchy/validate
   └─ Check for cycles, depth limits, orphans
   ```

**Files to Modify**:
- `src/core/engine/payout-engine.ts` - Add cycle detection
- Create validation endpoint

---

## 📊 IMPLEMENTATION TIMELINE

```
WEEK 1:
  Day 1: Task 4 (Commission % standardization)
  Day 2: Task 5 (FormulaResolver persistence)
  Day 3: Task 6 (Error handling)
  Day 4: Task 7 (Structured logging)
  
WEEK 2:
  Day 1: Task 8 (Career config migration)
  Day 2: Task 9 (Career bonus formula fix)
  Day 3: Task 10 (Cycle detection)
  Day 4: Integration testing
  Day 5: Bug fixes & deployment
```

---

## 🎯 SUCCESS CRITERIA

- [ ] All 10 issues addressed
- [ ] Automated tests pass (commission calculations)
- [ ] Commission logging complete
- [ ] Career bonus payment automatic
- [ ] Formula settings persist
- [ ] Error handling with rollback
- [ ] Cycle detection working
- [ ] Admin can update career config
- [ ] Reconciliation report shows 0 discrepancies
- [ ] No duplicate commissions

---

## 📝 NEXT STEPS

1. Review this plan
2. Approve implementation order
3. Start Task 4 (Commission % standardization)
4. Assign resources/team
5. Setup staging environment for testing

---

**Plan Date**: 2025  
**Status**: Ready for approval & implementation
