<?php

namespace Database\Seeders;

use App\Models\BusinessProfile;
use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoBusinessSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Create or Update Demo User
        $user = User::updateOrCreate(
            ['email' => 'budi@warungberkah.test'],
            [
                'name'     => 'Budi Santoso',
                'password' => Hash::make('password123'),
            ]
        );

        // 2. Create or Update Business Profile
        BusinessProfile::updateOrCreate(
            ['user_id' => $user->id],
            [
                'business_name'   => 'Warung Makan Berkah',
                'business_type'   => 'Kuliner / F&B',
                'opening_balance' => 2_000_000,
            ]
        );

        // 3. Clear existing transactions for idempotent seeding
        $user->transactions()->delete();

        // 4. Generate 30 days of realistic transactions (29 days ago until today)
        $startDate = Carbon::today()->subDays(29);
        $transactions = [];

        for ($day = 0; $day < 30; $day++) {
            $currentDate = $startDate->copy()->addDays($day);
            $dateStr     = $currentDate->toDateString();
            $dayOfWeek   = $currentDate->dayOfWeek; // 0 = Sunday, 6 = Saturday

            // A. Daily Sales (Income - Operational)
            if ($dayOfWeek === Carbon::SATURDAY || $dayOfWeek === Carbon::SUNDAY) {
                $salesAmount = 920_000 + (($day % 3) * 30_000); // 920k - 980k
            } elseif ($dayOfWeek === Carbon::FRIDAY) {
                $salesAmount = 850_000 + (($day % 2) * 20_000); // 850k - 870k
            } else {
                $salesAmount = 720_000 + (($day % 4) * 25_000); // 720k - 795k
            }

            $transactions[] = [
                'type'             => 'income',
                'category'         => 'sales',
                'amount'           => $salesAmount,
                'description'      => "Penjualan menu makan siang & katering ({$currentDate->format('d/m/Y')})",
                'transaction_date' => $dateStr,
            ];

            // B. Raw Materials (Expense - Operational)
            // Belanja bahan baku segar 6 dari 7 hari
            if ($day % 7 !== 1) {
                $rawAmount = 280_000 + (($day % 5) * 25_000); // 280k - 380k
                $transactions[] = [
                    'type'             => 'expense',
                    'category'         => 'raw_materials',
                    'amount'           => $rawAmount,
                    'description'      => 'Belanja bahan segar: ayam, telur, beras, sayur, & bumbu dapur',
                    'transaction_date' => $dateStr,
                ];
            }

            // C. Rent (Expense - Operational) - Day 5 (25 days ago)
            if ($day === 4) {
                $transactions[] = [
                    'type'             => 'expense',
                    'category'         => 'rent',
                    'amount'           => 1_500_000,
                    'description'      => 'Pembayaran sewa kios & tempat usaha bulanan',
                    'transaction_date' => $dateStr,
                ];
            }

            // D. Utilities (Expense - Operational)
            // Listrik PLN & PDAM - Day 10
            if ($day === 9) {
                $transactions[] = [
                    'type'             => 'expense',
                    'category'         => 'utilities',
                    'amount'           => 450_000,
                    'description'      => 'Pembayaran tagihan listrik PLN & PDAM',
                    'transaction_date' => $dateStr,
                ];
            }
            // Gas LPG - Day 20
            if ($day === 19) {
                $transactions[] = [
                    'type'             => 'expense',
                    'category'         => 'utilities',
                    'amount'           => 180_000,
                    'description'      => 'Pembelian isi ulang tabung gas LPG operasional dapur',
                    'transaction_date' => $dateStr,
                ];
            }

            // E. Salaries (Expense - Operational) - Day 25 (Gaji staf)
            if ($day === 24) {
                $transactions[] = [
                    'type'             => 'expense',
                    'category'         => 'salaries',
                    'amount'           => 1_800_000,
                    'description'      => 'Gaji bulanan staf dapur & pramusaji',
                    'transaction_date' => $dateStr,
                ];
            }
        }

        // Insert using Eloquent to trigger category mutators (is_operational)
        foreach ($transactions as $data) {
            $user->transactions()->create($data);
        }
    }
}

