<?php

namespace App\Models;

use App\Services\CategoryService;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transaction extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'type',
        'category',
        'is_operational',
        'amount',
        'description',
        'transaction_date',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_operational'   => 'boolean',
            'amount'           => 'integer',
            'transaction_date' => 'date:Y-m-d',
        ];
    }

    /**
     * Automatically resolve & set is_operational whenever category is set.
     */
    public function setCategoryAttribute(string $value): void
    {
        $this->attributes['category']       = $value;
        $this->attributes['is_operational'] = CategoryService::isOperational($value);
    }

    /**
     * Get the user that owns this transaction.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

