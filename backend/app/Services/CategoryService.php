<?php

namespace App\Services;

class CategoryService
{
    /**
     * Master map: category slug -> is_operational flag.
     * Single source of truth for the entire backend.
     */
    private const CATEGORY_MAP = [
        // ----- Income -----
        'sales'                  => true,
        'service_income'         => true,
        'other_income'           => false,

        // ----- Expense - Operational -----
        'raw_materials'          => true,
        'rent'                   => true,
        'utilities'              => true,
        'operational_transport'  => true,
        'salaries'               => true,
        'marketing'              => true,

        // ----- Expense - Non-Operational -----
        'asset_purchase'         => false,
        'loan_principal'         => false,
        'owner_withdrawal'       => false,
        'other_expense'          => false,
    ];

    /**
     * Resolve the is_operational flag for a given category slug.
     * Unknown categories default to false (non-operational).
     */
    public static function isOperational(string $category): bool
    {
        return self::CATEGORY_MAP[$category] ?? false;
    }

    /**
     * Return all valid category slugs (for validation).
     */
    public static function allCategories(): array
    {
        return array_keys(self::CATEGORY_MAP);
    }

    /**
     * Return valid income category slugs.
     */
    public static function incomeCategories(): array
    {
        return ['sales', 'service_income', 'other_income'];
    }

    /**
     * Return valid expense category slugs.
     */
    public static function expenseCategories(): array
    {
        return [
            'raw_materials', 'rent', 'utilities',
            'operational_transport', 'salaries', 'marketing',
            'asset_purchase', 'loan_principal', 'owner_withdrawal', 'other_expense',
        ];
    }
}

