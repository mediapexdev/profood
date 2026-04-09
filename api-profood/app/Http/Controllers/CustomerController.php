<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Services\CustomerSegmentService;
use Illuminate\Http\Request;

/**
 *
 */
class CustomerController extends Controller
{
    /**
     * @var CustomerSegmentService
     */
    protected $segmentService;

    /**
     * Create a new controller instance.
     *
     * @param CustomerSegmentService $segmentService
     */
    public function __construct(CustomerSegmentService $segmentService)
    {
        $this->segmentService = $segmentService;
    }
    /**
     * Get customer by a given id.
     *
     * @param  integer  $customer_id
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getCustomer($customer_id)
    {
        $customer = Customer::with('user')->find($customer_id);

        if (!isset($customer)) {
            return response()->json(['message' => 'Client introuvable !'], 404);
        }

        return response()->json($this->addSegmentData($customer), 200);
    }

    /**
     * Get customer by a given user id.
     *
     * @param  integer  $user_id
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getCustomerByUserId($user_id)
    {
        $customer = Customer::with('user')->where('user_id', $user_id)->first();

        if (!isset($customer)) {
            return response()->json(['message' => 'Client introuvable !'], 404);
        }

        return response()->json($this->addSegmentData($customer), 200);
    }

    /**
     * Get all customers.
     *
     * @param  \Illuminate\Http\Request  $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getCustomers(Request $request)
    {
        // Calculate per_page with a default of 20 and maximum of 100
        // This prevents performance issues when there are thousands of customers
        $perPage = min($request->input('per_page', 20), 100);

        // first_name is on the users table, not customers table
        // Join with users table to order by first_name and avoid N+1 queries
        $customers = Customer::with('user')
            ->join('users', 'customers.user_id', '=', 'users.id')
            ->orderBy('users.first_name')
            ->select('customers.*') // Select only customer columns to avoid conflict
            ->paginate($perPage);

        // Add segment data to each customer
        $customers->getCollection()->transform(function ($customer) {
            return $this->addSegmentData($customer);
        });

        return response()->json($customers, 200);
    }

    /**
     * get all customers with their linked users.
     *
     * @param  \Illuminate\Http\Request  $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getCustomersWithLinkedUsers(Request $request)
    {
        // Calculate per_page with a default of 20 and maximum of 100
        // This prevents performance issues when there are thousands of customers
        $perPage = min($request->input('per_page', 20), 100);

        $customers = Customer::with('user')->orderBy('created_at')->paginate($perPage);

        // Add segment data to each customer
        $customers->getCollection()->transform(function ($customer) {
            return $this->addSegmentData($customer);
        });

        return response()->json($customers, 200);
    }

    /**
     * Add segment and stats data to a customer.
     *
     * @param Customer $customer
     * @return array
     */
    private function addSegmentData(Customer $customer): array
    {
        $customerArray = $customer->toArray();
        $customerArray['segment'] = $this->segmentService->calculateSegment($customer);
        $customerArray['stats'] = $this->segmentService->getCustomerStats($customer);

        return $customerArray;
    }
}
