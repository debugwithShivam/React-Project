<?php

declare(strict_types=1);

namespace App\Controllers\Api;
use App\Support\CustomerIdentity;

use App\Support\Database;
use App\Support\MedicalServiceSchema;
use App\Support\MedicalPaymentState;
use App\Support\NotificationLog;
use App\Support\NotificationSchema;
use App\Support\OrderStatusHistory;
use App\Support\PaymentMethodCatalog;
use App\Support\PaymentSchema;
use App\Support\ProductExtrasSchema;
use App\Support\Request;
use App\Support\Response;
use App\Support\Settings;
use App\Support\Upload;
use App\Support\ZoneSchema;


final class MedicalServicesController
{
    public function catalog(): void
    {
        MedicalServiceSchema::ensure();
        $db = Database::connection();
        $zoneId = max(0, (int) ($_GET['zone_id'] ?? 0));
        if ($zoneId < 1) {
            Response::json(['message' => 'Select a delivery location to view medical services.'], 422);
            return;
        }
        if ($zoneId > 0) {
            $activeZone = $db->prepare('select id from zones where id=:id and status=1 limit 1');
            $activeZone->execute(['id' => $zoneId]);
            if (!$activeZone->fetchColumn()) {
                Response::json(['message' => 'This service area is no longer available. Choose another address.'], 422);
                return;
            }
        }
        $labZoneWhere = $zoneId > 0 ? ' and t.zone_id=:zone' : '';
        $providerZoneWhere = $zoneId > 0 ? ' and p.zone_id=:zone' : '';
        $labs = $db->prepare("select t.*,p.business_name provider_name from medical_lab_tests t join medical_providers p on p.id=t.provider_id and p.provider_type='lab' and p.status='approved' join zones z on z.id=t.zone_id and z.status=1 where t.status='active'$labZoneWhere order by t.name");
        $doctors = $db->prepare("select p.id,p.name,p.business_name,p.speciality,p.qualification,p.experience_years,p.consultation_fee,p.service_modes,p.availability_text from medical_providers p join zones z on z.id=p.zone_id and z.status=1 where p.provider_type='doctor' and p.status='approved'$providerZoneWhere order by p.name");
        $params = $zoneId > 0 ? ['zone' => $zoneId] : [];
        $labs->execute($params);
        $doctors->execute($params);
        Response::json([
            'lab_tests' => $labs->fetchAll(),
            'doctors' => $doctors->fetchAll(),
        ]);
    }

    public function labBookings(): void
    {
        MedicalServiceSchema::ensure();
        $customer = CustomerIdentity::requireBearer();
        $guest = CustomerIdentity::guestId((int) $customer['id']);
        if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'GET') {
            $s=Database::connection()->prepare("select b.*,t.name test_name,p.business_name provider_name,pt.currency from medical_lab_bookings b join medical_lab_tests t on t.id=b.test_id left join medical_providers p on p.id=b.provider_id left join medical_payment_transactions pt on pt.entity_type='lab_booking' and pt.entity_id=b.id where b.guest_id=:guest order by b.id desc");$s->execute(['guest'=>$guest]);Response::json(['data'=>$s->fetchAll(),'payment_methods'=>$this->medicalPaymentMethods()]);
            return;
        }
        $body = Request::json(); $guestId=$guest; $body['guest_id']=$guestId;
        $required = $this->required($body, ['guest_id', 'customer_name', 'customer_phone', 'scheduled_at']);
        $testId = (int) ($body['test_id'] ?? 0);
        if ($required !== '' || $testId < 1) {
            Response::json(['message' => $required ?: 'Choose a lab test.'], 422); return;
        }
        $db = Database::connection();
        $test = $db->prepare("select * from medical_lab_tests where id = :id and status = 'active' limit 1");
        $test->execute(['id' => $testId]); $test = $test->fetch();
        if (!$test) { Response::json(['message' => 'Lab test is unavailable.'], 404); return; }
         $zoneId = $this->zoneId($body); if ($zoneId === null) { Response::json(['message' => 'A valid service zone is required.'], 422); return; }
         $payment = $this->medicalPayment($body); if ($payment === null) return;
         $db->beginTransaction();
         try {
              $stmt = $db->prepare("insert into medical_lab_bookings (test_id,provider_id,guest_id,customer_id,zone_id,customer_name,customer_phone,address,collection_mode,scheduled_at,amount,status,payment_status,payment_method,payment_reference,created_at,updated_at) values (:test_id,:provider_id,:guest_id,:customer_id,:zone_id,:name,:phone,:address,:mode,:scheduled_at,:amount,'requested',:payment_status,:payment_method,:payment_reference,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)");
              $stmt->execute(['test_id'=>$testId,'provider_id'=>$test['provider_id'] ?: null,'guest_id'=>$guestId,'customer_id'=>(int)$customer['id'],'zone_id'=>$zoneId,'name'=>trim((string)$body['customer_name']),'phone'=>trim((string)$body['customer_phone']),'address'=>trim((string)($body['address']??'')),'mode'=>($body['collection_mode']??'home') === 'centre' ? 'centre' : 'home','scheduled_at'=>trim((string)$body['scheduled_at']),'amount'=>$test['price'],'payment_status'=>$payment['status'],'payment_method'=>$payment['method'],'payment_reference'=>$payment['reference']]);
             $id = (int) $db->lastInsertId();
              $db->prepare("insert into medical_payment_transactions (entity_type,entity_id,guest_id,payment_method,amount,currency,reference,status,created_at,updated_at) values ('lab_booking',:id,:guest,:method,:amount,:currency,:reference,'pending',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)")->execute(['id'=>$id,'guest'=>$guestId,'method'=>$payment['method'],'amount'=>$test['price'],'currency'=>Settings::moduleGet('medical','currency','INR'),'reference'=>$payment['reference']]);
             $db->commit();
         } catch (\Throwable $error) { if ($db->inTransaction()) $db->rollBack(); throw $error; }
         if ((int) ($test['provider_id'] ?? 0) > 0) {
             NotificationLog::record('provider', (int) $test['provider_id'], null, 'New lab appointment', 'Lab booking #' . $id . ' is ready for review.', null, 'medical', ['route' => 'lab_booking', 'booking_id' => (string) $id]);
         }
         $this->one('medical_lab_bookings', $id, 201);
    }

    public function consultations(): void
    {
        MedicalServiceSchema::ensure();
        $customer = CustomerIdentity::requireBearer(); $guestId=CustomerIdentity::guestId((int)$customer['id']);
        if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'GET') {$s=Database::connection()->prepare("select c.*,p.name doctor_name,p.business_name clinic_name,p.speciality,pt.currency from medical_consultations c join medical_providers p on p.id=c.doctor_id left join medical_payment_transactions pt on pt.entity_type='consultation' and pt.entity_id=c.id where c.guest_id=:guest order by c.id desc");$s->execute(['guest'=>$guestId]);Response::json(['data'=>$s->fetchAll(),'payment_methods'=>$this->medicalPaymentMethods()]);return;}
        $body = Request::json(); $body['guest_id']=$guestId; $doctorId=(int)($body['doctor_id']??0);
        $required=$this->required($body,['guest_id','customer_name','customer_phone','scheduled_at']);
        if ($required !== '' || $doctorId < 1) { Response::json(['message'=>$required ?: 'Choose a doctor.'],422); return; }
        $db=Database::connection(); $q=$db->prepare("select * from medical_providers where id=:id and provider_type='doctor' and status='approved'"); $q->execute(['id'=>$doctorId]); $doctor=$q->fetch();
        if(!$doctor){Response::json(['message'=>'Doctor is unavailable.'],404);return;}
         $zoneId = $this->zoneId($body); if ($zoneId === null) { Response::json(['message' => 'A valid service zone is required.'], 422); return; }
         $payment = $this->medicalPayment($body); if ($payment === null) return;
         $db->beginTransaction();
         try {
              $stmt=$db->prepare("insert into medical_consultations (doctor_id,guest_id,customer_id,zone_id,customer_name,customer_phone,reason,consultation_mode,scheduled_at,amount,status,payment_status,payment_method,payment_reference,created_at,updated_at) values (:doctor,:guest,:customer_id,:zone_id,:name,:phone,:reason,:mode,:scheduled,:amount,'requested',:payment_status,:payment_method,:payment_reference,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)");
              $stmt->execute(['doctor'=>$doctorId,'guest'=>$guestId,'customer_id'=>(int)$customer['id'],'zone_id'=>$zoneId,'name'=>trim((string)$body['customer_name']),'phone'=>trim((string)$body['customer_phone']),'reason'=>trim((string)($body['reason']??'')),'mode'=>($body['consultation_mode']??'online')==='clinic'?'clinic':'online','scheduled'=>trim((string)$body['scheduled_at']),'amount'=>$doctor['consultation_fee'],'payment_status'=>$payment['status'],'payment_method'=>$payment['method'],'payment_reference'=>$payment['reference']]);
             $id = (int) $db->lastInsertId();
              $db->prepare("insert into medical_payment_transactions (entity_type,entity_id,guest_id,payment_method,amount,currency,reference,status,created_at,updated_at) values ('consultation',:id,:guest,:method,:amount,:currency,:reference,'pending',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)")->execute(['id'=>$id,'guest'=>$guestId,'method'=>$payment['method'],'amount'=>$doctor['consultation_fee'],'currency'=>Settings::moduleGet('medical','currency','INR'),'reference'=>$payment['reference']]);
             $db->commit();
         } catch (\Throwable $error) { if ($db->inTransaction()) $db->rollBack(); throw $error; }
         NotificationLog::record('provider', $doctorId, null, 'New consultation appointment', 'Consultation #' . $id . ' is ready for review.', null, 'medical', ['route' => 'consultation', 'consultation_id' => (string) $id]);
         $this->one('medical_consultations',$id,201);
     }

    public function cancel(string $entityType, int $id): void
    {
        MedicalServiceSchema::ensure();
        $customer = CustomerIdentity::requireBearer();
        $guestId = CustomerIdentity::guestId((int) $customer['id']);
        $map = [
            'lab_booking' => ['medical_lab_bookings', ['requested', 'accepted']],
            'consultation' => ['medical_consultations', ['requested', 'confirmed']],
        ];
        if (!isset($map[$entityType])) { Response::json(['message'=>'Invalid medical booking'],422); return; }
        [$table, $allowed] = $map[$entityType];
        $db = Database::connection();
        $stmt = $db->prepare("select * from $table where id=:id and guest_id=:guest limit 1");
        $stmt->execute(['id'=>$id,'guest'=>$guestId]); $booking=$stmt->fetch();
        if (!$booking) { Response::json(['message'=>'Medical booking not found'],404); return; }
        if ((string)$booking['status'] === 'cancelled') { Response::json(['message'=>'Medical booking is already cancelled','payment_status'=>$booking['payment_status']]); return; }
        if (!in_array((string)$booking['status'],$allowed,true)) { Response::json(['message'=>'This medical booking can no longer be cancelled'],409); return; }
        $paymentStatus = MedicalPaymentState::cancelledStatus((string)$booking['payment_status']);
        $refundDue = $paymentStatus === 'refund_pending';
        $db->beginTransaction();
        try {
            $update=$db->prepare("update $table set status='cancelled',payment_status=:payment_status,updated_at=CURRENT_TIMESTAMP where id=:id and status=:previous");
            $update->execute(['payment_status'=>$paymentStatus,'id'=>$id,'previous'=>$booking['status']]);
            if ($update->rowCount() !== 1) { throw new \RuntimeException('Medical booking status changed. Refresh before trying again.'); }
            $db->prepare('update medical_payment_transactions set status=:status,updated_at=CURRENT_TIMESTAMP where entity_type=:type and entity_id=:id')->execute(['status'=>$refundDue?'refund_pending':'cancelled','type'=>$entityType,'id'=>$id]);
            $db->commit();
        } catch (\Throwable $error) { if ($db->inTransaction()) $db->rollBack(); Response::json(['message'=>$error->getMessage()],409); return; }
        Response::json(['message'=>$refundDue?'Booking cancelled. Refund review is pending.':'Booking cancelled.','payment_status'=>$paymentStatus]);
    }

    public function prescriptionRequests(): void
    {
        MedicalServiceSchema::ensure();
        $customer = CustomerIdentity::requireBearer(); $canonicalGuest=CustomerIdentity::guestId((int)$customer['id']);
        if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'GET') {
            $guest=$canonicalGuest;
            $s=Database::connection()->prepare('select id from medical_prescription_requests where guest_id=:guest order by id desc');$s->execute(['guest'=>$guest]);
            $items=[];foreach($s->fetchAll() as $row){$items[]=$this->prescriptionData((int)$row['id']);}
            Response::json(['data'=>$items,'payment_methods'=>$this->prescriptionPaymentMethods()]);return;
        }
        $body=Request::json(); $guestId=$canonicalGuest; $body['guest_id']=$guestId; $required=$this->required($body,['guest_id','customer_name','customer_phone','prescription_base64']);
        if($required!==''){Response::json(['message'=>$required],422);return;}
        $path=Upload::base64PrivateDocument((string)$body['prescription_base64'],'medical/prescription-requests',(string)($body['file_name']??'prescription'));
        if($path===null){Response::json(['message'=>'Upload a JPG, PNG, WebP or PDF prescription up to 5 MB.'],422);return;}
         $zoneId = $this->zoneId($body); if ($zoneId === null) { Response::json(['message' => 'A valid service zone is required.'], 422); return; }
         $db=Database::connection();$stmt=$db->prepare("insert into medical_prescription_requests (guest_id,customer_id,zone_id,customer_name,customer_phone,file_path,note,substitution_preference,status,payment_status,created_at,updated_at) values (:guest,:customer_id,:zone_id,:name,:phone,:path,:note,:substitution,'pending_review','not_due',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)");
        $stmt->execute(['guest'=>$guestId,'customer_id'=>(int)$customer['id'],'zone_id'=>$zoneId,'name'=>trim((string)$body['customer_name']),'phone'=>trim((string)$body['customer_phone']),'path'=>$path,'note'=>trim((string)($body['note']??'')),'substitution'=>in_array(($body['substitution_preference']??''),['allow','no_substitution'],true)?$body['substitution_preference']:'contact_me']);
        $this->prescription((int)$db->lastInsertId(),201);
    }

    public function acceptQuote(int $requestId): void
    {
        MedicalServiceSchema::ensure(); $customer=CustomerIdentity::requireBearer(); $guest=CustomerIdentity::guestId((int)$customer['id']); $body=Request::json();$quoteId=(int)($body['quote_id']??0);$db=Database::connection();
        $q=$db->prepare("select q.* from medical_prescription_quotes q join medical_prescription_requests r on r.id=q.request_id where q.id=:quote and r.id=:request and r.guest_id=:guest and q.status='offered' limit 1");$q->execute(['quote'=>$quoteId,'request'=>$requestId,'guest'=>$guest]);$quote=$q->fetch();
        if(!$quote){Response::json(['message'=>'This quote is unavailable or no longer current.'],422);return;}
        $db->beginTransaction();
        try{$db->prepare("update medical_prescription_quotes set status='accepted',accepted_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP where id=:id")->execute(['id'=>$quoteId]);$db->prepare("update medical_prescription_quotes set status='superseded',updated_at=CURRENT_TIMESTAMP where request_id=:request and id<>:id and status='offered'")->execute(['request'=>$requestId,'id'=>$quoteId]);$db->prepare("update medical_prescription_requests set accepted_quote_id=:quote,status='payment_pending',payment_status='pending',updated_at=CURRENT_TIMESTAMP where id=:id")->execute(['quote'=>$quoteId,'id'=>$requestId]);$db->commit();}catch(\Throwable $e){$db->rollBack();throw $e;}
        Response::json(['message'=>'Quote accepted. Payment is now due for the exact approved total.','amount'=>(float)$quote['total'],'payment_status'=>'pending','request_id'=>$requestId]);
    }

    public function checkoutPrescriptionRequest(int $requestId): void
    {
        MedicalServiceSchema::ensure();
        ProductExtrasSchema::ensure();
        PaymentSchema::ensure();
        NotificationSchema::ensure();
        OrderStatusHistory::ensure();
        $body = Request::json();
        $customer = CustomerIdentity::requireBearer();
        $customerId = (int) $customer['id'];
        $guestId = CustomerIdentity::guestId($customerId);
        $addressId = (int) ($body['address_id'] ?? 0);
        $address = trim((string) ($body['address'] ?? ''));
        $customerName = trim((string) ($customer['name'] ?? ''));
        $customerPhone = trim((string) ($customer['phone'] ?? ''));
        $customerEmail = trim((string) ($body['customer_email'] ?? ($customer['email'] ?? '')));
        $deliveryLatitude = (float) ($body['delivery_latitude'] ?? 0);
        $deliveryLongitude = (float) ($body['delivery_longitude'] ?? 0);
        $paymentMethod = trim((string) ($body['payment_method'] ?? 'cash_on_delivery'));
        $paymentReference = trim((string) ($body['payment_reference'] ?? ''));
        $paymentNote = trim((string) ($body['payment_note'] ?? ''));
        $enabledMethods = array_column($this->prescriptionPaymentMethods(), 'id');
        if (!in_array($paymentMethod, $enabledMethods, true)) {
            Response::json(['message' => 'Selected payment method is not available.'], 422);
            return;
        }
        if (PaymentMethodCatalog::requiresReference($paymentMethod) && $paymentReference === '') {
            Response::json(['message' => 'Enter the payment or transaction reference.'], 422);
            return;
        }
        $db = Database::connection();
        if ($addressId > 0) {
            $saved = $db->prepare('select customer_addresses.*,customers.email from customer_addresses join customers on customers.id=customer_addresses.customer_id where customer_addresses.id=:address and customer_addresses.customer_id=:customer limit 1');
            $saved->execute(['address' => $addressId, 'customer' => $customerId]);
            $savedAddress = $saved->fetch();
            if (!$savedAddress) {
                Response::json(['message' => 'The selected delivery address is unavailable.'], 422);
                return;
            }
            $address = implode(', ', array_filter([
                $savedAddress['address'] ?? '',
                $savedAddress['city'] ?? '',
                $savedAddress['state'] ?? '',
                $savedAddress['pincode'] ?? '',
            ]));
            $customerName = trim((string) ($savedAddress['contact_name'] ?? '')) ?: $customerName;
            $customerPhone = trim((string) ($savedAddress['contact_phone'] ?? '')) ?: $customerPhone;
            $customerEmail = trim((string) ($savedAddress['email'] ?? '')) ?: $customerEmail;
            $deliveryLatitude = (float) ($savedAddress['latitude'] ?? $deliveryLatitude);
            $deliveryLongitude = (float) ($savedAddress['longitude'] ?? $deliveryLongitude);
        }
        if ($address === '') {
            Response::json(['message' => 'Delivery address is required to complete this prescription order.'], 422);
            return;
        }
        if (!$this->validCoordinate($deliveryLatitude, $deliveryLongitude)) {
            $deliveryLatitude = 0.0;
            $deliveryLongitude = 0.0;
        }
        $lookup = $db->prepare(
            "select r.*, q.subtotal, q.tax_total, q.delivery_fee, q.total, q.status quote_status,
                    p.vendor_id, p.business_name pharmacy_name, v.zone_id
             from medical_prescription_requests r
             join medical_prescription_quotes q on q.id = r.accepted_quote_id and q.request_id = r.id and q.pharmacy_id = r.pharmacy_id
             join medical_providers p on p.id = r.pharmacy_id and p.provider_type = 'pharmacy' and p.status = 'approved'
             join vendors v on v.id = p.vendor_id and v.module_key = 'medical' and v.status = 'approved'
             where r.id = :id and r.guest_id = :guest
             limit 1"
        );
        $lookup->execute(['id' => $requestId, 'guest' => $guestId]);
        $request = $lookup->fetch();
         if (!$request || (string) ($request['quote_status'] ?? '') !== 'accepted') {
             Response::json(['message' => 'Accept a valid pharmacy quote before checkout.'], 422);
             return;
         }
         if ((int) ($request['zone_id'] ?? 0) < 1) {
             Response::json(['message' => 'This prescription request has no valid service zone.'], 422);
             return;
         }
        if ((int) ($request['order_id'] ?? 0) > 0) {
            $existing = $db->prepare("select id, order_number, payment_status, order_status, order_amount from orders where id = :id and module_key = 'medical' limit 1");
            $existing->execute(['id' => (int) $request['order_id']]);
            Response::json(['message' => 'This prescription order has already been created.', 'data' => $existing->fetch() ?: []]);
            return;
        }
        if ((string) ($request['status'] ?? '') !== 'payment_pending') {
            Response::json(['message' => 'This prescription request is not ready for checkout.'], 422);
            return;
        }
        $items = $db->prepare('select * from medical_prescription_quote_items where quote_id = :quote order by id');
        $items->execute(['quote' => (int) $request['accepted_quote_id']]);
        $items = $items->fetchAll();
        if (!$items) {
            Response::json(['message' => 'The accepted quote has no medicine items.'], 422);
            return;
        }
        $orderNumber = 'MEDRX' . date('ymdHis') . random_int(10, 99);
        $paymentStatus = PaymentMethodCatalog::paymentStatus($paymentMethod);
        try {
            $db->beginTransaction();
            $order = $db->prepare(
                "insert into orders
                  (module_key, zone_id, vendor_id, order_number, guest_id, customer_id, customer_name, customer_phone, customer_email,
                  address, delivery_latitude, delivery_longitude, order_amount, coupon_code, coupon_discount, tax_total, shipping_method_id, shipping_method_name,
                  shipping_cost, expected_delivery, payment_method, payment_status, order_status, order_note,
                  substitution_preference, created_at, updated_at)
                 values
                  ('medical', :zone, :vendor, :number, :guest, :customer_id, :name, :phone, :email,
                  :address, :delivery_latitude, :delivery_longitude, :amount, null, 0, :tax, null, 'Pharmacy delivery', :shipping, null,
                  :payment_method, :payment_status, 'pending', :note, :substitution, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)"
            );
            $order->execute([
                'zone' => (int) ($request['zone_id'] ?? 0) ?: null,
                'vendor' => (int) $request['vendor_id'],
                'number' => $orderNumber,
                'guest' => $guestId,
                'customer_id' => $customerId,
                'name' => $customerName ?: (string) $request['customer_name'],
                'phone' => $customerPhone ?: (string) $request['customer_phone'],
                'email' => $customerEmail ?: null,
                'address' => $address,
                'delivery_latitude' => $deliveryLatitude ?: null,
                'delivery_longitude' => $deliveryLongitude ?: null,
                'amount' => (float) $request['total'],
                'tax' => (float) $request['tax_total'],
                'shipping' => (float) $request['delivery_fee'],
                'payment_method' => $paymentMethod,
                'payment_status' => $paymentStatus,
                'note' => 'Created from prescription quote request #' . $requestId,
                'substitution' => (string) ($request['substitution_preference'] ?? 'contact_me'),
            ]);
            $orderId = (int) $db->lastInsertId();
            $itemInsert = $db->prepare(
                "insert into order_items
                 (order_id, vendor_id, product_id, variant_id, variant_name, product_name, quantity, price, total, status, created_at, updated_at)
                 values (:order, :vendor, 0, null, :pack, :name, :quantity, :price, :total, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)"
            );
            foreach ($items as $item) {
                $itemInsert->execute([
                    'order' => $orderId,
                    'vendor' => (int) $request['vendor_id'],
                    'pack' => trim((string) ($item['pack'] ?? '')) ?: null,
                    'name' => (string) $item['medicine_name'],
                    'quantity' => max(1, (int) $item['quantity']),
                    'price' => (float) $item['unit_price'],
                    'total' => (float) $item['line_total'],
                ]);
                OrderStatusHistory::record($orderId, (int) $db->lastInsertId(), 'pending', 'customer', (string) $request['customer_name'], 'Prescription quote item ordered');
            }
            $payment = $db->prepare(
                "insert into payment_transactions
                 (module_key, order_id, guest_id, customer_name, customer_phone, payment_method, amount, reference, note, status, created_at, updated_at)
                 values ('medical', :order, :guest, :name, :phone, :method, :amount, :reference, :note, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)"
            );
            $payment->execute([
                'order' => $orderId,
                'guest' => $guestId,
                'name' => (string) $request['customer_name'],
                'phone' => (string) $request['customer_phone'],
                'method' => $paymentMethod,
                'amount' => (float) $request['total'],
                'reference' => $paymentReference ?: null,
                'note' => $paymentNote ?: null,
            ]);
            $updated = $db->prepare(
                "update medical_prescription_requests
                 set order_id = :order, status = 'order_created', payment_status = :payment_status, updated_at = CURRENT_TIMESTAMP
                 where id = :id and order_id is null"
            );
            $updated->execute(['order' => $orderId, 'payment_status' => $paymentStatus, 'id' => $requestId]);
            if ($updated->rowCount() !== 1) {
                throw new \RuntimeException('Prescription order was already created.');
            }
            OrderStatusHistory::record($orderId, null, 'pending', 'customer', (string) $request['customer_name'], 'Order created from accepted prescription quote');
            NotificationLog::record('admin', null, null, 'Prescription order created', $orderNumber . ' was created from prescription request #' . $requestId, $orderId, 'medical');
            NotificationLog::record('provider', (int) $request['pharmacy_id'], null, 'New prescription order', $orderNumber . ' is ready for pharmacy review.', $orderId, 'medical', ['route' => 'order', 'request_id' => (string) $requestId]);
            NotificationLog::record('customer', null, $guestId, 'Prescription order created', 'Your order ' . $orderNumber . ' has been created.', $orderId, 'medical');
            $db->commit();
        } catch (\Throwable $error) {
            if ($db->inTransaction()) {
                $db->rollBack();
            }
            Response::json(['message' => $error instanceof \RuntimeException ? $error->getMessage() : 'Prescription checkout could not be completed.'], 422);
            return;
        }
        Response::json([
            'message' => $paymentMethod === 'cash_on_delivery' ? 'Prescription order placed. Pay when it arrives.' : 'Payment details submitted for verification.',
            'order_id' => $orderId,
            'order_number' => $orderNumber,
            'amount' => (float) $request['total'],
            'payment_status' => $paymentStatus,
            'order_status' => 'pending',
        ], 201);
    }

    public function providerRegister(): void
    {
        MedicalServiceSchema::ensure();$b=Request::json();$type=(string)($b['provider_type']??'');$required=$this->required($b,['name','phone','password','license_number']);
        if(!in_array($type,['pharmacy','lab','doctor'],true)||$required!==''){Response::json(['message'=>$required?:'Provider type must be pharmacy, lab or doctor.'],422);return;}
        if(strlen((string)$b['password'])<8){Response::json(['message'=>'Password must contain at least 8 characters.'],422);return;}
        $email=trim((string)($b['email']??''));if($email!==''&&filter_var($email,FILTER_VALIDATE_EMAIL)===false){Response::json(['message'=>'Enter a valid email address.'],422);return;}
        $latitude=(float)($b['latitude']??0);$longitude=(float)($b['longitude']??0);
        if(!$this->validCoordinate($latitude,$longitude)){Response::json(['message'=>'Select your pharmacy, laboratory or clinic location on the map.'],422);return;}
        $zone=ZoneSchema::resolve($latitude,$longitude,trim((string)($b['pincode']??'')),trim((string)($b['city']??'')));
        if(!$zone){Response::json(['message'=>'This premises is outside our active service areas. Choose a serviceable location or contact support.'],422);return;}
        $requestedZone=(int)($b['zone_id']??0);$zoneId=(int)$zone['id'];
        if($requestedZone>0&&$requestedZone!==$zoneId){Response::json(['message'=>'The selected service area changed. Reopen the map and confirm the location again.'],409);return;}
        $addressLine=trim((string)($b['address_line']??''));if($addressLine===''){Response::json(['message'=>'Enter the shop, clinic or building details.'],422);return;}
        $db=Database::connection();try{$s=$db->prepare("insert into medical_providers (provider_type,zone_id,name,business_name,phone,email,password_hash,license_number,speciality,qualification,consultation_fee,service_modes,address,address_line,floor,landmark,city,state,pincode,latitude,longitude,location_verified_at,status,created_at,updated_at) values (:type,:zone,:name,:business,:phone,:email,:password,:license,:speciality,:qualification,:fee,:modes,:address,:address_line,:floor,:landmark,:city,:state,:pincode,:latitude,:longitude,CURRENT_TIMESTAMP,'pending',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)");$s->execute(['type'=>$type,'zone'=>$zoneId,'name'=>trim((string)$b['name']),'business'=>trim((string)($b['business_name']??'')),'phone'=>trim((string)$b['phone']),'email'=>$email,'password'=>password_hash((string)$b['password'],PASSWORD_DEFAULT),'license'=>trim((string)$b['license_number']),'speciality'=>trim((string)($b['speciality']??'')),'qualification'=>trim((string)($b['qualification']??'')),'fee'=>max(0,(float)($b['consultation_fee']??0)),'modes'=>trim((string)($b['service_modes']??'')),'address'=>trim((string)($b['address']??'')),'address_line'=>$addressLine,'floor'=>trim((string)($b['floor']??'')),'landmark'=>trim((string)($b['landmark']??'')),'city'=>trim((string)($b['city']??($zone['city']??''))),'state'=>trim((string)($b['state']??($zone['state']??''))),'pincode'=>trim((string)($b['pincode']??($zone['pincode']??''))),'latitude'=>$latitude,'longitude'=>$longitude]);}catch(\PDOException){Response::json(['message'=>'A provider with this phone and role already exists. Sign in or contact support.'],409);return;}
        Response::json(['message'=>'Registration submitted for administrator verification.'],201);
    }

    public function providerLogin(): void
    {
        MedicalServiceSchema::ensure();$b=Request::json();$db=Database::connection();$s=$db->prepare('select * from medical_providers where provider_type=:type and phone=:phone limit 1');$s->execute(['type'=>(string)($b['provider_type']??''),'phone'=>trim((string)($b['phone']??''))]);$provider=$s->fetch();
        if(!$provider||!password_verify((string)($b['password']??''),(string)$provider['password_hash'])){Response::json(['message'=>'Invalid provider credentials.'],401);return;}
        if($provider['status']!=='approved'){Response::json(['message'=>'Your provider account is awaiting administrator approval.'],403);return;}
        $token=bin2hex(random_bytes(32));$db->prepare('update medical_providers set auth_token=:token,updated_at=CURRENT_TIMESTAMP where id=:id')->execute(['token'=>hash('sha256',$token),'id'=>$provider['id']]);unset($provider['password_hash'],$provider['auth_token']);Response::json(['token'=>$token,'data'=>$provider]);
    }

    public function providerTasks(): void
    {
        MedicalServiceSchema::ensure();$p=$this->provider();if(!$p)return;$db=Database::connection();$type=$p['provider_type'];
        if($type==='pharmacy'){$s=$db->prepare("select r.*,q.id quote_id,q.total quote_total,q.status quote_status from medical_prescription_requests r left join medical_prescription_quotes q on q.request_id=r.id and q.pharmacy_id=:id and q.status in ('offered','accepted') where r.pharmacy_id=:id order by r.id desc");}
        elseif($type==='lab'){$s=$db->prepare('select b.*,t.name test_name from medical_lab_bookings b join medical_lab_tests t on t.id=b.test_id where b.zone_id=:zone and (b.provider_id is null or b.provider_id=:id) order by b.id desc');}
        else{$s=$db->prepare('select * from medical_consultations where doctor_id=:id order by id desc');}
        $params=['id'=>$p['id']];if($type==='lab')$params['zone']=$p['zone_id'];$s->execute($params);Response::json(['provider'=>$p,'data'=>$s->fetchAll(),'analytics'=>$this->analytics($p),'patients'=>$this->patients($p),'lab_tests'=>$type==='lab'?$this->providerLabTests((int)$p['id']):[],'products'=>$type==='pharmacy'?$this->pharmacyProducts((int)($p['vendor_id']??0)):[],'orders'=>$type==='pharmacy'?$this->pharmacyOrders((int)($p['vendor_id']??0)):[]]);
    }

    public function providerProfile(): void
    {
        MedicalServiceSchema::ensure();$p=$this->provider();if(!$p)return;
        if(($_SERVER['REQUEST_METHOD']??'GET')==='GET'){Response::json(['data'=>$p]);return;}
        $b=Request::json();$fields=['name','business_name','email','address','city','description','opening_hours','speciality','qualification','service_modes','availability_text'];$values=[];$sets=[];
        foreach($fields as $field){if(array_key_exists($field,$b)){$sets[]="$field=:$field";$values[$field]=trim((string)$b[$field]);}}
        foreach(['experience_years','consultation_fee','service_radius_km','home_collection_fee','default_delivery_fee'] as $field){if(array_key_exists($field,$b)){$sets[]="$field=:$field";$values[$field]=max(0,(float)$b[$field]);}}
        if(isset($b['password'])&&strlen((string)$b['password'])>=8){$sets[]='password_hash=:password_hash';$values['password_hash']=password_hash((string)$b['password'],PASSWORD_DEFAULT);}
        if(!$sets){Response::json(['message'=>'No profile changes supplied.'],422);return;}$values['id']=$p['id'];Database::connection()->prepare('update medical_providers set '.implode(',',$sets).',updated_at=CURRENT_TIMESTAMP where id=:id')->execute($values);Response::json(['message'=>'Partner profile updated.','data'=>$this->providerById((int)$p['id'])]);
    }

    public function providerLabTests(?int $providerId=null): array
    {
        $respond=$providerId===null;if($respond){MedicalServiceSchema::ensure();$p=$this->provider('lab');if(!$p)return[];$providerId=(int)$p['id'];}
        $s=Database::connection()->prepare('select * from medical_lab_tests where provider_id=:id order by id desc');$s->execute(['id'=>$providerId]);$tests=$s->fetchAll();if($respond)Response::json(['data'=>$tests]);return $tests;
    }

    public function providerLabTestStore(): void
    {
        MedicalServiceSchema::ensure();$p=$this->provider('lab');if(!$p)return;$b=Request::json();$name=trim((string)($b['name']??''));if($name===''){Response::json(['message'=>'Test name is required.'],422);return;}$db=Database::connection();$s=$db->prepare("insert into medical_lab_tests (provider_id,zone_id,name,code,description,price,preparation,report_hours,home_collection,status,created_at,updated_at) values (:provider,:zone,:name,:code,:description,:price,:preparation,:hours,:home,'active',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)");$s->execute(['provider'=>$p['id'],'zone'=>$p['zone_id'],'name'=>$name,'code'=>trim((string)($b['code']??'')),'description'=>trim((string)($b['description']??'')),'price'=>max(0,(float)($b['price']??0)),'preparation'=>trim((string)($b['preparation']??'')),'hours'=>max(1,(int)($b['report_hours']??24)),'home'=>!empty($b['home_collection'])?1:0]);Response::json(['message'=>'Lab test added.','data'=>$this->providerLabTests((int)$p['id'])],201);
    }

    public function providerLabTestUpdate(int $id): void
    {
        MedicalServiceSchema::ensure();$p=$this->provider('lab');if(!$p)return;$b=Request::json();$name=trim((string)($b['name']??''));if($name===''){Response::json(['message'=>'Test name is required.'],422);return;}$status=in_array(($b['status']??'active'),['active','inactive','archived'],true)?$b['status']:'active';$s=Database::connection()->prepare('update medical_lab_tests set zone_id=:zone,name=:name,code=:code,description=:description,price=:price,preparation=:preparation,report_hours=:hours,home_collection=:home,status=:status,updated_at=CURRENT_TIMESTAMP where id=:id and provider_id=:provider');$s->execute(['zone'=>$p['zone_id'],'name'=>$name,'code'=>trim((string)($b['code']??'')),'description'=>trim((string)($b['description']??'')),'price'=>max(0,(float)($b['price']??0)),'preparation'=>trim((string)($b['preparation']??'')),'hours'=>max(1,(int)($b['report_hours']??24)),'home'=>!empty($b['home_collection'])?1:0,'status'=>$status,'id'=>$id,'provider'=>$p['id']]);if($s->rowCount()!==1){Response::json(['message'=>'Lab test not found.'],404);return;}Response::json(['message'=>'Lab test updated.','data'=>$this->providerLabTests((int)$p['id'])]);
    }

    public function providerLabTestDelete(int $id): void
    {
        MedicalServiceSchema::ensure();$p=$this->provider('lab');if(!$p)return;$s=Database::connection()->prepare("update medical_lab_tests set status='archived',updated_at=CURRENT_TIMESTAMP where id=:id and provider_id=:provider");$s->execute(['id'=>$id,'provider'=>$p['id']]);if($s->rowCount()!==1){Response::json(['message'=>'Lab test not found.'],404);return;}Response::json(['message'=>'Lab test archived.']);
    }

    public function providerLabBooking(int $id): void
    {
        MedicalServiceSchema::ensure();$p=$this->provider('lab');if(!$p)return;$s=Database::connection()->prepare('select b.*,t.name test_name,t.code test_code from medical_lab_bookings b join medical_lab_tests t on t.id=b.test_id where b.id=:id and b.zone_id=:zone and (b.provider_id=:provider or b.provider_id is null) limit 1');$s->execute(['id'=>$id,'zone'=>$p['zone_id'],'provider'=>$p['id']]);$row=$s->fetch();if(!$row){Response::json(['message'=>'Lab appointment not found.'],404);return;}Response::json(['data'=>$row]);
    }

    public function providerConsultation(int $id): void
    {
        MedicalServiceSchema::ensure();$p=$this->provider('doctor');if(!$p)return;$s=Database::connection()->prepare('select * from medical_consultations where id=:id and doctor_id=:doctor limit 1');$s->execute(['id'=>$id,'doctor'=>$p['id']]);$row=$s->fetch();if(!$row){Response::json(['message'=>'Appointment not found.'],404);return;}Response::json(['data'=>$row]);
    }

    public function providerProductUpdate(int $id): void
    {
        MedicalServiceSchema::ensure();ProductExtrasSchema::ensure();$p=$this->provider('pharmacy');if(!$p)return;$vendorId=$this->pharmacyVendor($p);if($vendorId===null)return;$b=Request::json();$current=$this->ownedProduct($id,$vendorId);if(!$current){Response::json(['message'=>'Medicine not found for this pharmacy.'],404);return;}$name=trim((string)($b['name']??$current['name']));if($name===''){Response::json(['message'=>'Medicine name is required.'],422);return;}$type=(string)($b['medicine_type']??$current['medicine_type']??'otc');if(!in_array($type,['otc','prescription_required','restricted'],true)){Response::json(['message'=>'Invalid medicine type.'],422);return;}$s=Database::connection()->prepare("update products set name=:name,description=:description,unit=:unit,price=:price,discount_price=:discount,stock=:stock,sku=:sku,medicine_type=:type,schedule_tag=:schedule,max_qty_per_order=:max_order,max_qty_per_month=:max_month,requires_pharmacist_review=:review,requires_age_confirmation=:age,provider_visibility=:visibility,allows_substitution=:substitution,updated_at=CURRENT_TIMESTAMP where id=:id and vendor_id=:vendor and module_key='medical'");$s->execute(['name'=>$name,'description'=>trim((string)($b['description']??$current['description'])),'unit'=>trim((string)($b['unit']??$current['unit']))?:'strip','price'=>max(0,(float)($b['price']??$current['price'])),'discount'=>(float)($b['discount_price']??$current['discount_price'])>0?(float)($b['discount_price']??$current['discount_price']):null,'stock'=>max(0,(int)($b['stock']??$current['stock'])),'sku'=>trim((string)($b['sku']??$current['sku'])),'type'=>$type,'schedule'=>trim((string)($b['schedule_tag']??$current['schedule_tag'])),'max_order'=>max(0,(int)($b['max_qty_per_order']??$current['max_qty_per_order']))?:null,'max_month'=>max(0,(int)($b['max_qty_per_month']??$current['max_qty_per_month']))?:null,'review'=>array_key_exists('requires_pharmacist_review',$b)?(!empty($b['requires_pharmacist_review'])?1:0):(int)$current['requires_pharmacist_review'],'age'=>array_key_exists('requires_age_confirmation',$b)?(!empty($b['requires_age_confirmation'])?1:0):(int)$current['requires_age_confirmation'],'visibility'=>array_key_exists('visible',$b)?(!empty($b['visible'])?1:0):(int)$current['provider_visibility'],'substitution'=>array_key_exists('allows_substitution',$b)?(!empty($b['allows_substitution'])?1:0):(int)$current['allows_substitution'],'id'=>$id,'vendor'=>$vendorId]);Response::json(['message'=>'Medicine updated.','data'=>$this->pharmacyProducts($vendorId)]);
    }

    public function providerProductStore(): void
    {
        MedicalServiceSchema::ensure();ProductExtrasSchema::ensure();$p=$this->provider('pharmacy');if(!$p)return;$vendorId=$this->pharmacyVendor($p);if($vendorId===null)return;
        $b=Request::json();$name=trim((string)($b['name']??''));if($name===''){Response::json(['message'=>'Medicine name is required.'],422);return;}
        $category=(int)($b['category_id']??0);if($category>0){$c=Database::connection()->prepare("select id from categories where id=:id and module_key='medical' and status=1");$c->execute(['id'=>$category]);if(!$c->fetch())$category=0;}
        $thumbnail=null;if(trim((string)($b['image_base64']??''))!==''){$thumbnail=Upload::base64Image((string)$b['image_base64'],'products',$name);}
        $type=in_array(($b['medicine_type']??'otc'),['otc','prescription_required','restricted'],true)?$b['medicine_type']:'otc';
        $slug=trim(preg_replace('/[^a-z0-9]+/','-',strtolower($name)),'-').'-'.$vendorId.'-'.date('ymdHis').'-'.random_int(100,999);
        $s=Database::connection()->prepare("insert into products (module_key,vendor_id,category_id,name,slug,description,unit,price,discount_price,stock,sku,thumbnail,medicine_type,schedule_tag,max_qty_per_order,max_qty_per_month,requires_pharmacist_review,requires_age_confirmation,provider_visibility,allows_substitution,status,is_featured,created_at,updated_at) values ('medical',:vendor,:category,:name,:slug,:description,:unit,:price,:discount,:stock,:sku,:thumbnail,:type,:schedule,:max_order,:max_month,:review,:age,:visibility,:substitution,0,0,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)");
        $s->execute(['vendor'=>$vendorId,'category'=>$category?:null,'name'=>$name,'slug'=>$slug,'description'=>trim((string)($b['description']??'')),'unit'=>trim((string)($b['unit']??'strip'))?:'strip','price'=>max(0,(float)($b['price']??0)),'discount'=>(float)($b['discount_price']??0)>0?(float)$b['discount_price']:null,'stock'=>max(0,(int)($b['stock']??0)),'sku'=>trim((string)($b['sku']??''))?:'MED-'.$vendorId.'-'.date('ymdHis'),'thumbnail'=>$thumbnail,'type'=>$type,'schedule'=>trim((string)($b['schedule_tag']??'')),'max_order'=>max(0,(int)($b['max_qty_per_order']??0))?:null,'max_month'=>max(0,(int)($b['max_qty_per_month']??0))?:null,'review'=>!empty($b['requires_pharmacist_review'])?1:0,'age'=>!empty($b['requires_age_confirmation'])?1:0,'visibility'=>array_key_exists('visible',$b)?(!empty($b['visible'])?1:0):1,'substitution'=>array_key_exists('allows_substitution',$b)?(!empty($b['allows_substitution'])?1:0):1]);
        Response::json(['message'=>'Medicine added and sent for administrator approval.','data'=>$this->pharmacyProducts($vendorId)],201);
    }

    public function providerProducts(): void
    {
        MedicalServiceSchema::ensure();ProductExtrasSchema::ensure();$p=$this->provider('pharmacy');if(!$p)return;$vendorId=$this->pharmacyVendor($p);if($vendorId===null)return;Response::json(['data'=>$this->pharmacyProducts($vendorId)]);
    }

    public function providerProductDelete(int $id): void
    {
        MedicalServiceSchema::ensure();ProductExtrasSchema::ensure();$p=$this->provider('pharmacy');if(!$p)return;$vendorId=$this->pharmacyVendor($p);if($vendorId===null)return;$s=Database::connection()->prepare("update products set provider_visibility=0,status=0,updated_at=CURRENT_TIMESTAMP where id=:id and vendor_id=:vendor and module_key='medical'");$s->execute(['id'=>$id,'vendor'=>$vendorId]);if($s->rowCount()!==1){Response::json(['message'=>'Medicine not found for this pharmacy.'],404);return;}Response::json(['message'=>'Medicine archived.']);
    }

    public function providerOrders(): void
    {
        MedicalServiceSchema::ensure();$p=$this->provider('pharmacy');if(!$p)return;$vendorId=$this->pharmacyVendor($p);if($vendorId===null)return;Response::json(['data'=>$this->pharmacyOrders($vendorId)]);
    }

    public function providerOrder(int $id): void
    {
        MedicalServiceSchema::ensure();$p=$this->provider('pharmacy');if(!$p)return;$vendorId=$this->pharmacyVendor($p);if($vendorId===null)return;$orders=$this->pharmacyOrders($vendorId,$id);if(!$orders){Response::json(['message'=>'Order not found for this pharmacy.'],404);return;}Response::json(['data'=>$orders[0]]);
    }

    public function providerOrderStatus(int $orderId): void
    {
        MedicalServiceSchema::ensure();$p=$this->provider('pharmacy');if(!$p)return;$vendorId=$this->pharmacyVendor($p);if($vendorId===null)return;$b=Request::json();$status=(string)($b['status']??'');$db=Database::connection();$owned=$db->prepare("select o.* from orders o join order_items i on i.order_id=o.id where o.id=:order and i.vendor_id=:vendor and o.module_key='medical' limit 1");$owned->execute(['order'=>$orderId,'vendor'=>$vendorId]);$order=$owned->fetch();if(!$order){Response::json(['message'=>'Order not found for this pharmacy.'],404);return;}$next=['pending'=>['confirmed','cancelled'],'confirmed'=>['processing','cancelled'],'processing'=>['ready_for_pickup','cancelled'],'ready_for_pickup'=>['out_for_delivery','cancelled'],'out_for_delivery'=>['delivered']];$current=(string)$order['order_status'];if($status===$current){Response::json(['message'=>'Order already has this status.']);return;}if(!in_array($status,$next[$current]??[],true)){Response::json(['message'=>'Invalid order transition from '.$current.' to '.$status],409);return;}$db->beginTransaction();try{$s=$db->prepare('update order_items set status=:status,updated_at=CURRENT_TIMESTAMP where order_id=:order and vendor_id=:vendor and status=:previous');$s->execute(['status'=>$status,'order'=>$orderId,'vendor'=>$vendorId,'previous'=>$current]);$u=$db->prepare("update orders set order_status=:status,updated_at=CURRENT_TIMESTAMP where id=:order and module_key='medical' and vendor_id=:vendor and order_status=:previous");$u->execute(['status'=>$status,'order'=>$orderId,'vendor'=>$vendorId,'previous'=>$current]);if($u->rowCount()!==1)throw new \RuntimeException('Order status changed. Refresh before trying again.');OrderStatusHistory::record($orderId,null,$status,'provider',(string)$p['business_name'],'Pharmacy updated order status');$db->commit();}catch(\Throwable $e){if($db->inTransaction())$db->rollBack();Response::json(['message'=>$e->getMessage()],409);return;}NotificationLog::record('customer',null,(string)$order['guest_id'],'Order status updated','Your order '.$order['order_number'].' is now '.str_replace('_',' ',$status).'.',$orderId,'medical');Response::json(['message'=>'Order status updated.','orders'=>$this->pharmacyOrders($vendorId)]);
    }

    public function providerLabReport(int $bookingId): void
    {
        MedicalServiceSchema::ensure();$p=$this->provider('lab');if(!$p)return;$b=Request::json();$report=trim((string)($b['report_url']??''));
        if(trim((string)($b['report_base64']??''))!==''){$report=Upload::base64PrivateDocument((string)$b['report_base64'],'medical/lab-reports',(string)($b['file_name']??'lab-report'))??'';}
        if($report===''||(!str_starts_with($report,'private://')&&filter_var($report,FILTER_VALIDATE_URL)===false)){Response::json(['message'=>'Upload a report image/PDF or enter a valid secure report URL.'],422);return;}
        $db=Database::connection();$owned=$db->prepare("select guest_id,status from medical_lab_bookings where id=:id and zone_id=:zone and (provider_id=:provider or provider_id is null)");$owned->execute(['id'=>$bookingId,'zone'=>$p['zone_id'],'provider'=>$p['id']]);$booking=$owned->fetch();if(!$booking){Response::json(['message'=>'Lab appointment not found.'],404);return;}if((string)$booking['status']!=='processing'){Response::json(['message'=>'A report can only complete a booking that is processing.'],409);return;}$s=$db->prepare("update medical_lab_bookings set provider_id=coalesce(provider_id,:provider),report_url=:report,provider_note=:note,status='completed',updated_at=CURRENT_TIMESTAMP where id=:id and zone_id=:zone and (provider_id=:provider or provider_id is null) and status='processing'");$s->execute(['provider'=>$p['id'],'zone'=>$p['zone_id'],'report'=>$report,'note'=>trim((string)($b['provider_note']??'')),'id'=>$bookingId]);if($s->rowCount()!==1){Response::json(['message'=>'Appointment status changed. Refresh before trying again.'],409);return;}NotificationLog::record('customer',null,(string)$booking['guest_id'],'Lab report ready','Your lab report is ready to view.',null,'medical',['route'=>'lab_booking','booking_id'=>(string)$bookingId]);Response::json(['message'=>'Report uploaded. The patient can now open it from the booking result.']);
    }

    public function providerConsultationConnect(int $consultationId): void
    {
        MedicalServiceSchema::ensure();$p=$this->provider('doctor');if(!$p)return;$b=Request::json();$meeting=trim((string)($b['meeting_url']??''));if($meeting!==''&&filter_var($meeting,FILTER_VALIDATE_URL)===false){Response::json(['message'=>'Enter a valid online consultation link.'],422);return;}
        $db=Database::connection();$owned=$db->prepare('select id from medical_consultations where id=:id and doctor_id=:doctor');$owned->execute(['id'=>$consultationId,'doctor'=>$p['id']]);if(!$owned->fetch()){Response::json(['message'=>'Appointment not found.'],404);return;}$s=$db->prepare('update medical_consultations set meeting_url=:meeting,clinical_note=:note,updated_at=CURRENT_TIMESTAMP where id=:id');$s->execute(['meeting'=>$meeting?:null,'note'=>trim((string)($b['clinical_note']??'')),'id'=>$consultationId]);Response::json(['message'=>'Consultation details updated.']);
    }

    public function providerQuote(int $requestId): void
    {
        MedicalServiceSchema::ensure();$p=$this->provider('pharmacy');if(!$p)return;$b=Request::json();$items=is_array($b['items']??null)?$b['items']:[];if(!$items){Response::json(['message'=>'Add at least one quoted medicine.'],422);return;}
        $subtotal=0.0;$tax=0.0;$clean=[];foreach($items as $item){$name=trim((string)($item['medicine_name']??''));$qty=max(1,(int)($item['quantity']??1));$price=max(0,(float)($item['unit_price']??0));$itemTax=max(0,(float)($item['tax_amount']??0));if($name==='')continue;$line=round($qty*$price+$itemTax,2);$subtotal+=round($qty*$price,2);$tax+=$itemTax;$clean[]=[$name,trim((string)($item['pack']??'')),$qty,$price,$itemTax,$line,trim((string)($item['substitution_for']??''))];}
        if(!$clean){Response::json(['message'=>'Medicine names and prices are required.'],422);return;}$delivery=max(0,(float)($b['delivery_fee']??0));$total=round($subtotal+$tax+$delivery,2);$db=Database::connection();
        $assigned=$db->prepare("select id,guest_id from medical_prescription_requests where id=:id and pharmacy_id=:pharmacy and status in ('assigned','quoted') limit 1");$assigned->execute(['id'=>$requestId,'pharmacy'=>$p['id']]);$assignedRequest=$assigned->fetch();if(!$assignedRequest){Response::json(['message'=>'This prescription is not assigned to your pharmacy or can no longer be quoted.'],403);return;}
        $db->beginTransaction();try{$db->prepare("update medical_prescription_quotes set status='superseded',updated_at=CURRENT_TIMESTAMP where request_id=:request and status='offered'")->execute(['request'=>$requestId]);$q=$db->prepare("insert into medical_prescription_quotes (request_id,pharmacy_id,subtotal,tax_total,delivery_fee,total,status,note,expires_at,created_at,updated_at) values (:request,:pharmacy,:subtotal,:tax,:delivery,:total,'offered',:note,:expires,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)");$q->execute(['request'=>$requestId,'pharmacy'=>$p['id'],'subtotal'=>$subtotal,'tax'=>$tax,'delivery'=>$delivery,'total'=>$total,'note'=>trim((string)($b['note']??'')),'expires'=>trim((string)($b['expires_at']??''))]);$quote=(int)$db->lastInsertId();$line=$db->prepare('insert into medical_prescription_quote_items (quote_id,medicine_name,pack,quantity,unit_price,tax_amount,line_total,substitution_for,created_at) values (?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP)');foreach($clean as $i){$line->execute([$quote,...$i]);}$db->prepare("update medical_prescription_requests set status='quoted',payment_status='not_due',updated_at=CURRENT_TIMESTAMP where id=:id and pharmacy_id=:pharmacy")->execute(['id'=>$requestId,'pharmacy'=>$p['id']]);$db->commit();}catch(\Throwable $e){$db->rollBack();throw $e;}NotificationLog::record('customer',null,(string)$assignedRequest['guest_id'],'Prescription quote ready','Your pharmacy quote is ready to review.',null,'medical',['route'=>'prescription_request','request_id'=>(string)$requestId]);Response::json(['message'=>'Itemised quote sent for customer approval.','quote_id'=>$quote,'total'=>$total],201);
    }

    public function providerStatusWithCustomer(string $kind, int $id): void
    {
        MedicalServiceSchema::ensure();
        $table = $kind === 'lab' ? 'medical_lab_bookings' : 'medical_consultations';
        $q = Database::connection()->prepare("select customer_id,guest_id from $table where id=:id limit 1");
        $q->execute(['id' => $id]);
        $customer = $q->fetch();
        if ($customer) {
            NotificationLog::useCustomerRecipient((int) ($customer['customer_id'] ?? 0) ?: null, (string) ($customer['guest_id'] ?? ''));
        }
        $this->providerStatus($kind, $id);
    }

    public function providerStatus(string $kind, int $id): void
    {
        MedicalServiceSchema::ensure();$p=$this->provider();if(!$p)return;$map=['lab'=>['lab','medical_lab_bookings','provider_id',['requested'=>['accepted','cancelled'],'accepted'=>['sample_collected','cancelled'],'sample_collected'=>['processing','cancelled'],'processing'=>['completed','cancelled']]],'consultation'=>['doctor','medical_consultations','doctor_id',['requested'=>['confirmed','cancelled'],'confirmed'=>['in_progress','cancelled'],'in_progress'=>['completed','cancelled']]]];$config=$map[$kind]??null;if(!$config||$p['provider_type']!==$config[0]){Response::json(['message'=>'This action is not available for your role.'],403);return;}$db=Database::connection();$zone=$kind==='lab'?' and zone_id=:zone':'';$owner=$kind==='lab'?' and (provider_id=:provider or provider_id is null)':' and doctor_id=:provider';$params=['id'=>$id,'provider'=>$p['id']];if($kind==='lab')$params['zone']=$p['zone_id'];$q=$db->prepare("select status from {$config[1]} where id=:id$zone$owner limit 1");$q->execute($params);$current=$q->fetchColumn();if($current===false){Response::json(['message'=>'Appointment not found.'],404);return;}$status=(string)(Request::json()['status']??'');if($status===$current){Response::json(['message'=>'Appointment already has this status.']);return;}if(!in_array($status,$config[3][(string)$current]??[],true)){Response::json(['message'=>'Invalid status transition from '.$current.' to '.$status],409);return;}$claim=$kind==='lab'?',provider_id=coalesce(provider_id,:provider)':'';$params['status']=$status;$params['previous']=$current;$s=$db->prepare("update {$config[1]} set status=:status$claim,updated_at=CURRENT_TIMESTAMP where id=:id$zone$owner and status=:previous");$s->execute($params);if($s->rowCount()!==1){Response::json(['message'=>'Appointment status changed. Refresh before trying again.'],409);return;}NotificationLog::record('customer',null,null,'Appointment status updated','Your medical appointment is now '.str_replace('_',' ',$status).'.',$id,'medical');Response::json(['message'=>'Status updated.']);
    }

    private function customerList(string $table): void { $guest=trim((string)($_GET['guest_id']??''));if($guest===''){Response::json(['data'=>[]]);return;}$s=Database::connection()->prepare("select * from $table where guest_id=:guest order by id desc");$s->execute(['guest'=>$guest]);Response::json(['data'=>$s->fetchAll()]); }
    private function one(string $table,int $id,int $status=200):void{$type=$table==='medical_lab_bookings'?'lab_booking':'consultation';$s=Database::connection()->prepare("select $table.*,medical_payment_transactions.currency from $table left join medical_payment_transactions on medical_payment_transactions.entity_type=:type and medical_payment_transactions.entity_id=$table.id where $table.id=:id");$s->execute(['id'=>$id,'type'=>$type]);Response::json(['data'=>$s->fetch()],$status);}
    private function prescription(int $id,int $status=200):void{Response::json(['data'=>$this->prescriptionData($id)],$status);}
    private function prescriptionData(int $id):array{$db=Database::connection();$s=$db->prepare('select * from medical_prescription_requests where id=:id');$s->execute(['id'=>$id]);$r=$s->fetch()?:[];$q=$db->prepare("select * from medical_prescription_quotes where request_id=:id and status in ('offered','accepted') order by id desc limit 1");$q->execute(['id'=>$id]);$quote=$q->fetch();if($quote){$i=$db->prepare('select * from medical_prescription_quote_items where quote_id=:id order by id');$i->execute(['id'=>$quote['id']]);$quote['items']=$i->fetchAll();}$r['quote']=$quote?:null;$r['order']=null;if((int)($r['order_id']??0)>0){$o=$db->prepare("select id,order_number,order_amount,payment_method,payment_status,order_status,created_at from orders where id=:id and module_key='medical' limit 1");$o->execute(['id'=>(int)$r['order_id']]);$r['order']=$o->fetch()?:null;}return $r;}
    private function prescriptionPaymentMethods():array{return array_values(array_filter(PaymentMethodCatalog::enabled('medical'),static fn(array $method):bool=>(string)($method['id']??'')!=='wallet'));}
    private function medicalPaymentMethods():array{return PaymentMethodCatalog::enabledForServices('medical');}
    private function medicalPayment(array $body):?array
    {
        $methods=$this->medicalPaymentMethods();
        if(!$methods){Response::json(['message'=>'No medical payment method is configured.'],503);return null;}
        $enabled=array_column($methods,'id');$method=trim((string)($body['payment_method']??''));
        if($method==='')$method=in_array('cash_on_service',$enabled,true)?'cash_on_service':(string)$enabled[0];
        if(!in_array($method,$enabled,true)){Response::json(['message'=>'Selected payment method is not available.'],422);return null;}
        $reference=trim((string)($body['payment_reference']??''));
        if(PaymentMethodCatalog::requiresReference($method)&&$reference===''){Response::json(['message'=>'Enter the payment or transaction reference.'],422);return null;}
        return ['method'=>$method,'reference'=>$reference?:null,'status'=>PaymentMethodCatalog::paymentStatus($method)];
    }
    private function provider(?string $role=null):?array{$header=$_SERVER['HTTP_AUTHORIZATION']??$_SERVER['REDIRECT_HTTP_AUTHORIZATION']??'';if(preg_match('/Bearer\s+(.+)/i',$header,$m)!==1){Response::json(['message'=>'Provider authentication required.'],401);return null;}$s=Database::connection()->prepare("select p.id,p.provider_type,p.vendor_id,p.zone_id,p.name,p.business_name,p.phone,p.email,p.license_number,p.speciality,p.qualification,p.experience_years,p.consultation_fee,p.service_modes,p.status,p.address,p.address_line,p.floor,p.landmark,p.city,p.state,p.pincode,p.latitude,p.longitude,p.location_verified_at,p.description,p.opening_hours,p.profile_image,p.service_radius_km,p.home_collection_fee,p.default_delivery_fee,p.availability_text from medical_providers p join zones z on z.id=p.zone_id and z.status=1 where p.auth_token=:token and p.status='approved' limit 1");$s->execute(['token'=>hash('sha256',trim($m[1]))]);$p=$s->fetch();if(!$p||($role!==null&&$p['provider_type']!==$role)){Response::json(['message'=>'Provider authentication, role or service zone is invalid.'],403);return null;}return $p;}
    private function providerById(int $id):array{$s=Database::connection()->prepare('select id,provider_type,vendor_id,zone_id,name,business_name,phone,email,license_number,speciality,qualification,experience_years,consultation_fee,service_modes,status,address,address_line,floor,landmark,city,state,pincode,latitude,longitude,location_verified_at,description,opening_hours,profile_image,service_radius_km,home_collection_fee,default_delivery_fee,availability_text from medical_providers where id=:id');$s->execute(['id'=>$id]);return $s->fetch()?:[];}
    private function pharmacyProducts(int $vendorId):array{if($vendorId<1)return[];$s=Database::connection()->prepare("select id,name,description,unit,price,discount_price,stock,sku,thumbnail,status,provider_visibility,allows_substitution,medicine_type,schedule_tag,max_qty_per_order,max_qty_per_month,requires_pharmacist_review,requires_age_confirmation from products where module_key='medical' and vendor_id=:vendor order by id desc");$s->execute(['vendor'=>$vendorId]);return $s->fetchAll();}
    private function ownedProduct(int $id,int $vendorId):?array{$s=Database::connection()->prepare("select * from products where id=:id and vendor_id=:vendor and module_key='medical' limit 1");$s->execute(['id'=>$id,'vendor'=>$vendorId]);return $s->fetch()?:null;}
    private function pharmacyVendor(array $p):?int{$vendorId=(int)($p['vendor_id']??0);$s=Database::connection()->prepare("select id from vendors where id=:id and module_key='medical' and status='approved' and zone_id=:zone limit 1");$s->execute(['id'=>$vendorId,'zone'=>$p['zone_id']]);if(!$s->fetchColumn()){Response::json(['message'=>'Your pharmacy store setup is incomplete. Ask an administrator to approve or resave your pharmacy profile.'],422);return null;}return $vendorId;}
    private function pharmacyOrders(int $vendorId,?int $orderId=null):array{if($vendorId<1)return[];$db=Database::connection();$where=$orderId===null?'':' and o.id=:order';$s=$db->prepare("select distinct o.* from orders o join order_items i on i.order_id=o.id where o.module_key='medical' and i.vendor_id=:vendor$where order by o.id desc limit 100");$params=['vendor'=>$vendorId];if($orderId!==null)$params['order']=$orderId;$s->execute($params);$orders=$s->fetchAll();$items=$db->prepare('select id,product_id,product_name,variant_name,quantity,price,total,status from order_items where order_id=:order and vendor_id=:vendor order by id');foreach($orders as &$order){$items->execute(['order'=>$order['id'],'vendor'=>$vendorId]);$order['items']=$items->fetchAll();}unset($order);return $orders;}
    private function analytics(array $p):array{$db=Database::connection();$role=$p['provider_type'];if($role==='pharmacy'){$s=$db->prepare("select count(*) total_tasks,sum(case when status in ('pending_review','quoted','payment_pending') then 1 else 0 end) pending_tasks,sum(case when status in ('completed','fulfilled') then 1 else 0 end) completed_tasks from medical_prescription_requests where pharmacy_id=:id");$s->execute(['id'=>$p['id']]);$a=$s->fetch()?:[];$o=$db->prepare("select count(*) total_orders,sum(case when order_status in ('pending','confirmed','processing','out_for_delivery') then 1 else 0 end) pending_orders,sum(case when order_status='delivered' then 1 else 0 end) completed_orders,sum(case when payment_status='paid' then order_amount else 0 end) revenue from (select distinct o.id,o.order_status,o.payment_status,o.order_amount from orders o join order_items i on i.order_id=o.id where o.module_key='medical' and i.vendor_id=:vendor) x");$o->execute(['vendor'=>(int)($p['vendor_id']??0)]);$orders=$o->fetch()?:[];return ['total_tasks'=>(int)($a['total_tasks']??0)+(int)($orders['total_orders']??0),'pending_tasks'=>(int)($a['pending_tasks']??0)+(int)($orders['pending_orders']??0),'completed_tasks'=>(int)($a['completed_tasks']??0)+(int)($orders['completed_orders']??0),'revenue'=>(float)($orders['revenue']??0)];}if($role==='lab'){$where='provider_id=:id';$table='medical_lab_bookings';$amount='amount';$pending="status in ('requested','accepted','sample_collected','processing')";$complete="status='completed'";}else{$where='doctor_id=:id';$table='medical_consultations';$amount='amount';$pending="status in ('requested','confirmed','in_progress')";$complete="status='completed'";}$s=$db->prepare("select count(*) total_tasks,sum(case when $pending then 1 else 0 end) pending_tasks,sum(case when $complete then 1 else 0 end) completed_tasks,sum(case when payment_status='paid' then $amount else 0 end) revenue from $table where $where");$s->execute(['id'=>$p['id']]);$a=$s->fetch()?:[];return ['total_tasks'=>(int)($a['total_tasks']??0),'pending_tasks'=>(int)($a['pending_tasks']??0),'completed_tasks'=>(int)($a['completed_tasks']??0),'revenue'=>(float)($a['revenue']??0)];}
    private function patients(array $p):array{$role=$p['provider_type'];if($role==='pharmacy'){$s=Database::connection()->prepare("select customer_name,customer_phone,count(*) visits,max(created_at) last_visit from (select customer_name,customer_phone,created_at from medical_prescription_requests where pharmacy_id=:provider union all select distinct o.customer_name,o.customer_phone,o.created_at from orders o join order_items i on i.order_id=o.id where o.module_key='medical' and i.vendor_id=:vendor) x group by customer_name,customer_phone order by last_visit desc limit 100");$s->execute(['provider'=>$p['id'],'vendor'=>(int)($p['vendor_id']??0)]);return $s->fetchAll();}$table=$role==='lab'?'medical_lab_bookings':'medical_consultations';$field=$role==='doctor'?'doctor_id':'provider_id';$s=Database::connection()->prepare("select customer_name,customer_phone,count(*) visits,max(created_at) last_visit from $table where $field=:id group by customer_name,customer_phone order by last_visit desc limit 100");$s->execute(['id'=>$p['id']]);return $s->fetchAll();}
     private function zoneId(array $body): ?int
     {
         ZoneSchema::ensure();
         $requested = (int) ($body['zone_id'] ?? 0);
         if ($requested > 0) {
             $stmt = Database::connection()->prepare('select id from zones where id = :id and status = 1 limit 1');
             $stmt->execute(['id' => $requested]);
             return $stmt->fetchColumn() ? $requested : null;
         }
         $latitude = (float) ($body['latitude'] ?? 0);
         $longitude = (float) ($body['longitude'] ?? 0);
         if ($latitude < -90 || $latitude > 90 || $longitude < -180 || $longitude > 180 || ($latitude === 0.0 && $longitude === 0.0)) {
             return null;
         }
         $zone = ZoneSchema::resolve($latitude, $longitude, trim((string) ($body['pincode'] ?? '')), trim((string) ($body['city'] ?? '')));
         return $zone ? (int) $zone['id'] : null;
     }

     private function validCoordinate(float $latitude, float $longitude): bool
     {
         return $latitude >= -90 && $latitude <= 90
             && $longitude >= -180 && $longitude <= 180
             && !($latitude === 0.0 && $longitude === 0.0);
     }

     private function required(array $body,array $fields):string{foreach($fields as $field){if(trim((string)($body[$field]??''))==='')return ucfirst(str_replace('_',' ',$field)).' is required.';}return '';}
}
