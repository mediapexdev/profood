<?php

use App\Http\Controllers\BoxTypeController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\LivreurController;
use App\Http\Controllers\LocaliteController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PromotionController;
use App\Http\Controllers\SliceController;
use App\Http\Controllers\UserController;
use App\Models\Admin;
use App\Models\Customer;
use App\Models\Manager;
use App\Models\Role;
use App\Models\SuperAdmin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by bootstrap/app.php via withRouting() and assigned
| the "api" middleware group.
|
*/

// Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
//     return $request->user();
// });

Route::get('get-box-types', [BoxTypeController::class, 'getBoxTypes']);
Route::get('get-box-type/{id}', [BoxTypeController::class, 'getBoxType']);
Route::get('get-slices-by-box/{id}', [BoxTypeController::class, 'getSlicesByBoxType']);

Route::get('get-categories', [CategoryController::class, 'getCategories']);
Route::get('get-categories-with-slices-count', [CategoryController::class, 'getCategoriesWithSlicesCount']);
Route::get('get-category/{id}', [CategoryController::class, 'getCategory']);
Route::get('get-category-with-slices-count/{id}', [CategoryController::class, 'getCategoryWithSlicesCount']);

Route::get('get-slices', [SliceController::class, 'getSlices']);
Route::get('get-slice/{id}', [SliceController::class, 'getSlice']);
Route::get('get-slices-available-in-box', [SliceController::class, 'getSlicesAvailableInBox']);
Route::get('get-slices-by-category/{id}', [SliceController::class, 'getSlicesByCategory']);

Route::get('get-localites', [LocaliteController::class, 'getLocalites']);
Route::get('get-localites-with-full-info', [LocaliteController::class, 'getLocalitesWithFullInfo']);

Route::post('guest-order', [OrderController::class, 'addGuestOrder']);
Route::post('guest-order-with-payment', [OrderController::class, 'addGuestOrderWithPayment']);
Route::post('redirect-payment', [OrderController::class, 'redirectPayment']);

// Public promotion endpoints
Route::post('validate-promo-code', [PromotionController::class, 'validatePromoCode']);
Route::get('active-promotions', [PromotionController::class, 'getActivePromotions']);
Route::post('promotions-for-products', [PromotionController::class, 'getActivePromotionsForProducts']);

Route::get('receipt/{string_id}', [OrderController::class, 'getPublicReceipt']);

Route::post('signup', [UserController::class, 'signup']);
Route::post('signin', [UserController::class, 'signin']);
// Route::post('logout', [UserController::class, 'logout']);
Route::post('check-user-data-requesting-registration', [UserController::class, 'checkUserDataRequestingRegistration']);
Route::post('password-reset', [UserController::class, 'resetPassword']);
Route::post('user-phonenumber-exists', [UserController::class, 'userPhoneNumberExists']);

/**
 * Test/Debug routes - Only accessible in local and testing environments
 * These routes are used for email template preview and testing purposes
 */
if (app()->environment('local', 'testing')) {
    Route::get('/mailable', function () {
        $order = App\Models\Order::find(1);

        return new App\Mail\OrderNotificationEmail($order);
    });

    Route::get('/mailable2', function () {
        $order = App\Models\Order::find(1);

        return new App\Mail\CustomerOrderStatusNotificationEmail($order, "Votre commande est en cours de traitement.");
    });

    Route::get('/mailable3', function () {
        $order = App\Models\Order::find(1);

        return new App\Mail\OrderAcknowledgmentEmail($order);
    });

    Route::get('get-orders-statistics-details-test', [OrderController::class, 'getOrdersStatisticsDetails']);
}

/**
 * Protected Routes - Require authentication via API token
 * Added check.token.expiration middleware to validate token hasn't expired
 */
Route::middleware(['auth:api', 'check.token.expiration'])->group(function () {

    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::post('add-user', [UserController::class, 'addUser']);
    Route::post('delete-user-by-admin', [UserController::class, 'deleteUser']);
    Route::post('update-user-password-by-admin', [UserController::class, 'updateUserPassword']);
    Route::post('update-user-profile-details-by-admin', [UserController::class, 'updateUserProfileDetails']);

    Route::get('get-users', [UserController::class, 'getUsers']);
    Route::get('get-roles', [UserController::class, 'getRoles']);
    Route::get('get-users-without-customers', [UserController::class, 'getUsersWithoutCustomers']);

    /**
     * 
     */
    Route::get('/admin', function () {
        if (null !== ($user = Auth::user())) {
            switch ($user->role->code) {
                case Role::ADMIN:
                    $admin = Admin::where('user_id', $user->id)->with('user')->first();
                    return response()->json($admin, 200);
                default:
                    return response()->json(['message' => 'Demande rejetée !'], 403);
                    break;
            }
        }
        else {
            return response()->json(['message' => 'Demande rejetée ! Accès non autorisé.'], 401);
        }
    });

    /**
     * 
     */
    Route::get('/super_admin', function () {
        if (null !== ($user = Auth::user())) {
            switch ($user->role->code) {
                case Role::SUPER_ADMIN:
                    $super_admin = SuperAdmin::where('user_id', $user->id)->with('user')->first();
                    return response()->json($super_admin, 200);
                default:
                    return response()->json(['message' => 'Demande rejetée !'], 403);
                    break;
            }
        }
        else {
            return response()->json(['message' => 'Demande rejetée ! Accès non autorisé.'], 401);
        }
    });

    /**
     * 
     */
    Route::get('/customer', function () {
        if (null !== ($user = Auth::user())) {
            switch ($user->role->code) {
                case Role::CUSTOMER:
                    $customer = Customer::where('user_id', $user->id)->with('user')->first();
                    return response()->json($customer, 200);
                default:
                    return response()->json(['message' => 'Demande rejetée !'], 403);
                    break;
            }
        }
        else {
            return response()->json(['message' => 'Demande rejetée ! Accès non autorisé.'], 401);
        }
    });

    /**
     * 
     */
    Route::get('/livreur', [LivreurController::class, 'show']);
    Route::get('get-livreur-deliveries', [LivreurController::class, 'getDeliveries']);
    Route::get('get-livreur-delivery/{id}', [LivreurController::class, 'getDelivery']);
    Route::post('livreur-update-order-status', [LivreurController::class, 'updateDeliveryStatus']);

    Route::get('get-livreurs', [LivreurController::class, 'index']);
    Route::post('assign-livreur-to-order', [LivreurController::class, 'assignToOrder']);

    Route::get('/manager', function () {
        if (null !== ($user = Auth::user())) {
            switch ($user->role->code) {
                case Role::MANAGER:
                    $manager = Manager::where('user_id', $user->id)->with('user')->first();
                    return response()->json($manager, 200);
                default:
                    return response()->json(['message' => 'Demande rejetée !'], 403);
                    break;
            }
        }
        else {
            return response()->json(['message' => 'Demande rejetée ! Accès non autorisé.'], 401);
        }
    });

    /**
     * 
     */
    Route::get('/app-manager', function () {
        if (null !== ($user = Auth::user())) {
            switch ($user->role->code) {
                case Role::ADMIN:
                    $admin = Admin::where('user_id', $user->id)->with('user')->first();
                    return response()->json($admin, 200);
                case Role::SUPER_ADMIN:
                    $super_admin = SuperAdmin::where('user_id', $user->id)->with('user')->first();
                    return response()->json($super_admin, 200);
                case Role::MANAGER:
                    $manager = Manager::where('user_id', $user->id)->with('user')->first();
                    return response()->json($manager, 200);
                default:
                    return response()->json(['message' => 'Demande rejetée !'], 403);
                    break;
            }
        }
        else {
            return response()->json(['message' => 'Demande rejetée ! Accès non autorisé.'], 401);
        }
    });
    Route::post('check-user-data-requesting-change-of-phone-number', [UserController::class, 'checkUserDataRequestingChangeOfPhoneNumber']);

    Route::post('signout', [UserController::class, 'signout']);

    Route::post('change-password', [UserController::class, 'changePassword']);
    Route::post('update-profile-details', [UserController::class, 'updateProfileDetails']);
    Route::post('update-phone-number', [UserController::class, 'updatePhoneNumber']);

    Route::post('add-box-to-cart', [CartController::class, 'addBoxToCart']);
    Route::post('add-slices-to-cart', [CartController::class, 'addSlicesToCart']);
    
    Route::post('delete-box-from-cart', [CartController::class, 'deleteBoxFromCart']);
    Route::post('delete-slice-from-cart', [CartController::class, 'deleteSliceFromCart']);

    Route::post('increment-cart-slice', [CartController::class, 'incrementCartSlice']);
    Route::post('decrement-cart-slice', [CartController::class, 'decrementCartSlice']);

    Route::get('get-cart', [CartController::class, 'getCart']);
    Route::get('get-cart-boxes', [CartController::class, 'getCartBoxes']);
    Route::get('get-cart-slices', [CartController::class, 'getCartSlices']);

    Route::get('get-customer-orders/{id}', [OrderController::class, 'getCustomerOrders']);
    Route::get('get-customer-orders-by-user/{id}', [OrderController::class, 'getCustomerOrdersByUser']);
    Route::post('add-order-with-payment', [OrderController::class, 'addOrderWithPayment']);
    Route::post('add-order-without-payment', [OrderController::class, 'addOrderWithoutPayment']);
    Route::post('cancel-order', [OrderController::class, 'cancelOrder']);
    
    // Route::get('get-customers', [CustomerController::class, 'getCustomers']);

    // Route::get('get-customers', function () {
    //     if (null !== ($user = Auth::user())) {
    //         switch ($user->role_id) {
    //             case Role::MANAGER:
    //                 $customers = Customer::all();
    //                 return response()->json($customers, 200);
    //             default:
    //                 return response()->json(['message' => 'Demande rejetée !'], 403);
    //                 break;
    //         }
    //     }
    //     else {
    //         return response()->json(['message' => 'Demande rejetée ! Accès non autorisé.'], 401);
    //     }
    // });

    Route::post('add-customer', [UserController::class, 'addCustomer']);
    Route::post('delete-customer', [UserController::class, 'deleteCustomer']);
    Route::post('update-customer-password', [UserController::class, 'updateCustomerPassword']);
    Route::post('update-customer-profile-details', [UserController::class, 'updateCustomerProfileDetails']);

    Route::get('get-customers', [CustomerController::class, 'getCustomers']);
    Route::get('get-customers-with-linked-users', [CustomerController::class, 'getCustomersWithLinkedUsers']);

    Route::get('get-recent-orders', [OrderController::class, 'getRecentOrders']);
    Route::get('get-orders', [OrderController::class, 'getOrders']);
    Route::get('get-order-payment-statuses', [OrderController::class, 'getOrderPaymentStatuses']);
    Route::get('get-order-statuses', [OrderController::class, 'getOrderStatuses']);
    Route::get('get-order-statuses-details', [OrderController::class, 'getOrderStatusesDetails']);
    Route::get('get-orders-statistics-details', [OrderController::class, 'getOrdersStatisticsDetails']);

    Route::post('approve-order/{id}', [OrderController::class, 'approveOrder']);
    Route::post('update-order-status', [OrderController::class, 'updateOrderStatus']);
    Route::post('update-order-payment-status', [OrderController::class, 'updateOrderPaymentStatus']);
    
    Route::post('add-boxType', [BoxTypeController::class, 'addBoxType']);
    Route::post('update-boxType', [BoxTypeController::class, 'updateBoxType']);
    Route::post('delete-boxType', [BoxTypeController::class, 'deleteBoxType']);

    Route::post('add-category', [CategoryController::class, 'addCategory']);
    Route::post('update-category', [CategoryController::class, 'updateCategory']);
    Route::post('delete-category', [CategoryController::class, 'deleteCategory']);

    Route::post('add-slice', [SliceController::class, 'addSlice']);
    Route::post('update-slice', [SliceController::class, 'updateSlice']);
    Route::post('delete-slice', [SliceController::class, 'deleteSlice']);

    // Promotion management routes (Admin/Manager only)
    Route::get('promotions', [PromotionController::class, 'index']);
    Route::post('promotions', [PromotionController::class, 'store']);
    Route::get('promotions/{id}', [PromotionController::class, 'show']);
    Route::put('promotions/{id}', [PromotionController::class, 'update']);
    Route::delete('promotions/{id}', [PromotionController::class, 'destroy']);
    Route::get('promotions/{id}/usages', [PromotionController::class, 'usages']);

    // Route::get('get-statistics', function() {
    //     if (null !== ($user = Auth::user())) {
    //         switch ($user->role->code) {
    //             case Role::ADMIN:
    //             case Role::MANAGER:
    //                 $manager = Manager::where('user_id', $user->id)->with('user')->first();
    //                 return response()->json($manager, 200);
    //             default:
    //                 return response()->json(['message' => 'Demande rejetée !'], 403);
    //                 break;
    //         }
    //     }
    //     else {
    //         return response()->json(['message' => 'Demande rejetée ! Accès non autorisé.'], 401);
    //     }
    // });
});

// Route::middleware('auth:api')->get('/user', function (Request $request) {
//     return $request->user();
// });
