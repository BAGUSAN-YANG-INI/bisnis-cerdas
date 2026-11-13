<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTransactionRequest;
use App\Http\Requests\UpdateTransactionRequest;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TransactionController extends Controller
{
    /**
     * Format a Transaction model into a consistent API response array.
     */
    private function formatTransaction(Transaction $transaction): array
    {
        return [
            'id'               => $transaction->id,
            'type'             => $transaction->type,
            'category'         => $transaction->category,
            'is_operational'   => (bool) $transaction->is_operational,
            'amount'           => (int) $transaction->amount,
            'description'      => $transaction->description,
            'transaction_date' => $transaction->transaction_date->format('Y-m-d'),
            'created_at'       => $transaction->created_at->toIso8601String(),
        ];
    }

    /**
     * GET /api/transactions
     * Return paginated transactions for the authenticated user.
     * Supports optional query filters: type, category, from, to, per_page.
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = max(1, min((int) $request->query('per_page', 15), 100));

        $query = $request->user()
            ->transactions()
            ->orderByDesc('transaction_date')
            ->orderByDesc('id');

        if ($request->filled('type')) {
            $query->where('type', $request->query('type'));
        }

        if ($request->filled('category')) {
            $query->where('category', $request->query('category'));
        }

        if ($request->filled('from')) {
            $query->whereDate('transaction_date', '>=', $request->query('from'));
        }

        if ($request->filled('to')) {
            $query->whereDate('transaction_date', '<=', $request->query('to'));
        }

        $paginated = $query->paginate($perPage);

        return response()->json([
            'success'    => true,
            'message'    => 'Daftar transaksi berhasil dimuat.',
            'data'       => array_map([$this, 'formatTransaction'], $paginated->items()),
            'pagination' => [
                'current_page' => $paginated->currentPage(),
                'per_page'     => $paginated->perPage(),
                'total'        => $paginated->total(),
                'last_page'    => $paginated->lastPage(),
            ],
        ]);
    }

    /**
     * POST /api/transactions
     * Record a new cash transaction for the authenticated user.
     * Returns HTTP 201 Created.
     */
    public function store(StoreTransactionRequest $request): JsonResponse
    {
        $transaction = $request->user()->transactions()->create($request->validated());

        return $this->success(
            $this->formatTransaction($transaction->fresh()),
            'Transaksi berhasil disimpan.',
            Response::HTTP_CREATED
        );
    }

    /**
     * GET /api/transactions/{id}
     * Return detail of a single transaction.
     * Strict user isolation: returns 404 for transactions owned by other users.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $transaction = $request->user()->transactions()->find($id);

        if (! $transaction) {
            return $this->error(
                'Data tidak ditemukan atau bukan milik akun Anda.',
                null,
                Response::HTTP_NOT_FOUND
            );
        }

        return $this->success(
            $this->formatTransaction($transaction),
            'Detail transaksi berhasil dimuat.'
        );
    }

    /**
     * PUT /api/transactions/{id}
     * Update a transaction.
     * Strict user isolation: returns 404 for transactions owned by other users.
     */
    public function update(UpdateTransactionRequest $request, int $id): JsonResponse
    {
        $transaction = $request->user()->transactions()->find($id);

        if (! $transaction) {
            return $this->error(
                'Data tidak ditemukan atau bukan milik akun Anda.',
                null,
                Response::HTTP_NOT_FOUND
            );
        }

        $transaction->update($request->validated());

        return $this->success(
            $this->formatTransaction($transaction->fresh()),
            'Transaksi berhasil diperbarui.'
        );
    }

    /**
     * DELETE /api/transactions/{id}
     * Delete a transaction.
     * Strict user isolation: returns 404 for transactions owned by other users.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $transaction = $request->user()->transactions()->find($id);

        if (! $transaction) {
            return $this->error(
                'Data tidak ditemukan atau bukan milik akun Anda.',
                null,
                Response::HTTP_NOT_FOUND
            );
        }

        $transaction->delete();

        return $this->success(null, 'Transaksi berhasil dihapus.');
    }
}
