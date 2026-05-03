import { describe, it, expect, beforeEach, vi } from 'vitest';
import useGameStore from '../store/useGameStore';
import { INGREDIENTS, CANTEEN_MENU } from '../game/constants';

describe('Financial Logic', () => {
    beforeEach(() => {
        useGameStore.getState().resetGame();
    });

    // --- 1. KIỂM THỬ MUA NGUYÊN LIỆU (INGREDIENTS) ---
    describe('Giao dịch tại Siêu thị (Ingredients)', () => {
        it('không được thêm vật phẩm vào inventory nếu tiền không đủ', () => {
            const { buyIngredient } = useGameStore.getState();

            useGameStore.setState({
                stats: { ...useGameStore.getState().stats, money: 10000 },
                playerStats: {
                ...useGameStore.getState().playerStats,
                inventory: []
                }
            });

            const meat = INGREDIENTS.find(i => i.id === 'meat');

            buyIngredient(meat);

            const state = useGameStore.getState();

            expect(state.playerStats.inventory.length).toBe(0);
            expect(state.stats.money).toBe(10000);
        });

        it('mua thành công khi đủ tiền', () => {
            const { buyIngredient } = useGameStore.getState();

            useGameStore.setState({
                stats: { ...useGameStore.getState().stats, money: 100000 },
                playerStats: {
                ...useGameStore.getState().playerStats,
                inventory: []
                }
            });

            const meat = INGREDIENTS.find(i => i.id === 'meat');

            buyIngredient(meat);

            const state = useGameStore.getState();

            expect(state.playerStats.inventory.length).toBe(1);
            expect(state.stats.money).toBe(50000);
        });
    });

    // --- 2. KIỂM THỬ ĂN TẠI CĂNG TIN (CANTEEN MENU) ---
    describe('Giao dịch tại Căng tin (Canteen)', () => {
        it('không trừ tiền và không hồi energy nếu không đủ tiền', () => {
            const { eatCanteenFood } = useGameStore.getState();

            useGameStore.setState({
                stats: { energy: 20, money: 5000 }
            });

            const meal = CANTEEN_MENU.find(m => m.id === 'com_ga');

            eatCanteenFood(meal);

            const state = useGameStore.getState();

            expect(state.stats.energy).toBe(20);
            expect(state.stats.money).toBe(5000);
        });

        it('ăn thành công khi đủ tiền', () => {
            const { eatCanteenFood } = useGameStore.getState();

            useGameStore.setState({
                stats: { energy: 20, money: 50000 }
            });

            const meal = CANTEEN_MENU.find(m => m.id === 'com_ga');

            eatCanteenFood(meal);

            const state = useGameStore.getState();

            expect(state.stats.energy).toBe(20 + meal.energy); // hoặc 100 nếu cap
            expect(state.stats.money).toBe(10000);
        });
    });

    // --- 3. KIỂM THỬ GIAO DỊCH CHUỖI (ATOMICITY) ---
    describe('Tính toàn vẹn của giao dịch chuỗi', () => {
        it('phải dừng việc mua ngay khi món hàng thứ n trong danh sách không đủ tiền', () => {
            const { buyIngredient } = useGameStore.getState();

            // Giả lập có 7,000đ và muốn mua 2 quả trứng (mỗi quả 5,000đ)
            useGameStore.setState({
                stats: { ...useGameStore.getState().stats, money: 7000 },
                playerStats: {
                ...useGameStore.getState().playerStats,
                inventory: []
                }
            });

            const egg = INGREDIENTS.find(i => i.id === 'egg'); // 5,000đ
        
            buyIngredient(egg);
            buyIngredient(egg);


            const finalState = useGameStore.getState();
            expect(finalState.playerStats.inventory.length).toBe(1); // Chỉ mua được 1 quả
            expect(finalState.stats.money).toBe(2000); // Còn dư 2,000đ
        });
    });
});
