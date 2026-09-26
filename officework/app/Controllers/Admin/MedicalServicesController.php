<?php

declare(strict_types=1);

namespace App\Controllers\Admin;

use App\Support\Auth;
use App\Support\Database;
use App\Support\MedicalServiceSchema;
use App\Support\MedicalPaymentState;
use App\Support\NotificationLog;
use App\Support\PaymentGatewayClient;
use App\Support\Response;
use App\Support\VendorSchema;
use App\Support\View;
use App\Support\ZoneSchema;

final class MedicalServicesController
{
    public function index(): void
    {
        Auth::requireAdmin(); MedicalServiceSchema::ensure(); ZoneSchema::ensure(); $db=Database::connection();
        $providers=$db->prepare('select * from medical_providers where 1=1'.Auth::zoneWhere('medical_providers').' order by id desc');$providers->execute(Auth::zoneParams());
        $labs=$db->prepare('select t.*,p.business_name provider_name from medical_lab_tests t left join medical_providers p on p.id=t.provider_id where 1=1'.Auth::zoneWhere('t').' order by t.id desc');$labs->execute(Auth::zoneParams());
        View::render('admin/medical-services',[
            'title'=>'Medical Service Partners',
            'providers'=>$providers->fetchAll(),
            'labTests'=>$labs->fetchAll(),
            'zones'=>Auth::isZoneScoped()?array_values(array_filter(ZoneSchema::active(),fn(array $zone):bool=>(int)$zone['id']===Auth::zoneId())):ZoneSchema::active(),
        ]);
    }

    public function prescriptionRequests(): void
    {
        Auth::requireAdmin();
        MedicalServiceSchema::ensure();
        VendorSchema::ensure();
        $db = Database::connection();
        $requests = $db->prepare(
            "select r.*, p.business_name pharmacy_business_name, p.name pharmacy_name,
                    q.id quote_id, q.total quote_total, q.status quote_status, q.created_at quote_created_at
             from medical_prescription_requests r
             left join medical_providers p on p.id = r.pharmacy_id and p.provider_type = 'pharmacy'
             left join medical_prescription_quotes q on q.id = (
                 select q2.id from medical_prescription_quotes q2
                 where q2.request_id = r.id and q2.status in ('offered','accepted')
                 order by q2.id desc limit 1
             ) where 1=1" . Auth::zoneWhere('r') . "
             order by case when r.status = 'pending_review' then 0 when r.status = 'assigned' then 1 else 2 end,
                      r.id desc"
        );
        $requests->execute(Auth::zoneParams());
        $requests = $requests->fetchAll();
        $pharmacies = $db->prepare(
            "select p.id, p.name, p.business_name, p.city, p.vendor_id, v.shop_name
             from medical_providers p
             left join vendors v on v.id = p.vendor_id and v.module_key = 'medical'
             where p.provider_type = 'pharmacy' and p.status = 'approved'" . Auth::zoneWhere('p') . "
             order by coalesce(p.business_name, p.name), p.id"
        );
        $pharmacies->execute(Auth::zoneParams());
        $pharmacies = $pharmacies->fetchAll();
        View::render('admin/medical-prescription-requests', [
            'title' => 'Prescription Requests',
            'requests' => $requests,
            'pharmacies' => $pharmacies,
        ]);
    }

    public function assignPrescriptionRequest(int $id): void
    {
        Auth::requireAdmin();
        MedicalServiceSchema::ensure();
        VendorSchema::ensure();
        $pharmacyId = (int) ($_POST['pharmacy_id'] ?? 0);
        if ($pharmacyId < 1) {
            Response::redirect('/admin/medical/prescription-requests');
            return;
        }
        $db = Database::connection();
        $request = $db->prepare('select id, status, accepted_quote_id from medical_prescription_requests where id = :id'.Auth::zoneWhere('medical_prescription_requests').' limit 1');
        $request->execute(Auth::zoneParams(['id' => $id]));
        $request = $request->fetch();
        if (!$request || !empty($request['accepted_quote_id']) || in_array((string) $request['status'], ['payment_pending', 'paid', 'fulfilled', 'completed', 'cancelled', 'rejected'], true)) {
            Response::redirect('/admin/medical/prescription-requests');
            return;
        }
        $pharmacy = $db->prepare(
            "select id from medical_providers
             where id = :id and provider_type = 'pharmacy' and status = 'approved'" . Auth::zoneWhere('medical_providers') . "
             limit 1"
        );
        $pharmacy->execute(Auth::zoneParams(['id' => $pharmacyId]));
        if (!$pharmacy->fetch()) {
            Response::redirect('/admin/medical/prescription-requests');
            return;
        }
        if ($this->ensurePharmacyStore($pharmacyId) < 1) {
            Response::redirect('/admin/medical/providers/' . $pharmacyId);
            return;
        }
        try {
            $db->beginTransaction();
            $db->prepare(
                "update medical_prescription_quotes
                 set status = 'superseded', updated_at = CURRENT_TIMESTAMP
                 where request_id = :request and status = 'offered'"
            )->execute(['request' => $id]);
            $db->prepare(
                "update medical_prescription_requests
                 set pharmacy_id = :pharmacy, status = 'assigned', payment_status = 'not_due',
                     accepted_quote_id = null, updated_at = CURRENT_TIMESTAMP
                 where id = :id"
            )->execute(['pharmacy' => $pharmacyId, 'id' => $id]);
            $db->commit();
        } catch (\Throwable $error) {
            if ($db->inTransaction()) {
                $db->rollBack();
            }
            throw $error;
        }
        NotificationLog::record(
            'provider',
            $pharmacyId,
            null,
            'New prescription assigned',
            'Prescription request #' . $id . ' is ready for pharmacist review.',
            null,
            'medical',
            ['route' => 'prescription_request', 'request_id' => (string) $id]
        );
        Response::redirect('/admin/medical/prescription-requests');
    }

    private function ensurePharmacyStore(int $providerId): int
    {
        $db = Database::connection();
        $providerQuery = $db->prepare(
            "select * from medical_providers
             where id = :id and provider_type = 'pharmacy' and status = 'approved'" . Auth::zoneWhere('medical_providers') . "
             limit 1"
        );
        $providerQuery->execute(Auth::zoneParams(['id' => $providerId]));
        $provider = $providerQuery->fetch();
        if (!$provider) {
            return 0;
        }
        $linkedId = (int) ($provider['vendor_id'] ?? 0);
        if ($linkedId > 0) {
            $linked = $db->prepare(
                "select v.id from vendors v
                 where v.id = :id and v.module_key = 'medical'
                   and not exists (
                       select 1 from medical_providers other
                       where other.vendor_id = v.id and other.provider_type = 'pharmacy' and other.id <> :provider
                   )" . Auth::zoneWhere('v') . ' limit 1'
            );
            $linked->execute(Auth::zoneParams([
                'id' => $linkedId,
                'provider' => $providerId,
            ]));
            if ($linked->fetch()) {
                $this->syncPharmacyStore($provider, $linkedId);
                return $linkedId;
            }
        }
        $phone = trim((string) ($provider['phone'] ?? ''));
        if ($phone !== '') {
            $matching = $db->prepare(
                "select v.id, v.status from vendors v
                 where v.module_key = 'medical' and v.phone = :phone
                   and not exists (
                       select 1 from medical_providers other
                       where other.vendor_id = v.id and other.provider_type = 'pharmacy' and other.id <> :provider
                   )" . Auth::zoneWhere('v') . ' limit 1'
            );
            $matching->execute(Auth::zoneParams([
                'phone' => $phone,
                'provider' => $providerId,
            ]));
            $vendor = $matching->fetch();
            if ($vendor) {
                $vendorId = (int) $vendor['id'];
                $db->prepare('update medical_providers set vendor_id = :vendor, updated_at = CURRENT_TIMESTAMP where id = :id'.Auth::zoneWhere('medical_providers'))
                    ->execute(Auth::zoneParams(['vendor' => $vendorId, 'id' => $providerId]));
                $this->syncPharmacyStore($provider, $vendorId);
                return $vendorId;
            }
        }
        $storeName = trim((string) ($provider['business_name'] ?? '')) ?: trim((string) ($provider['name'] ?? ''));
        if ($storeName === '' || $phone === '') {
            return 0;
        }
        $create = $db->prepare(
            "insert into vendors
             (module_key, zone_id, shop_name, owner_name, phone, email, password, address, city, status, admin_note, created_at, updated_at)
             values ('medical', :zone, :shop, :owner, :phone, :email, :password, :address, :city, 'approved',
                     'Automatically linked to approved AIMEDIX pharmacy partner', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)"
        );
        $create->execute([
            'zone' => $provider['zone_id'],
            'shop' => $storeName,
            'owner' => trim((string) ($provider['name'] ?? '')) ?: $storeName,
            'phone' => $phone,
            'email' => trim((string) ($provider['email'] ?? '')) ?: null,
            'password' => password_hash(bin2hex(random_bytes(24)), PASSWORD_DEFAULT),
            'address' => trim((string) ($provider['address'] ?? '')) ?: null,
            'city' => trim((string) ($provider['city'] ?? '')) ?: null,
        ]);
        $vendorId = (int) $db->lastInsertId();
        $db->prepare('update medical_providers set vendor_id = :vendor, updated_at = CURRENT_TIMESTAMP where id = :id'.Auth::zoneWhere('medical_providers'))
            ->execute(Auth::zoneParams(['vendor' => $vendorId, 'id' => $providerId]));
        return $vendorId;
    }

    private function syncPharmacyStore(array $provider, int $vendorId): void
    {
        $storeName = trim((string) ($provider['business_name'] ?? '')) ?: trim((string) ($provider['name'] ?? ''));
        Database::connection()->prepare(
            "update vendors
             set zone_id = :zone, shop_name = :shop, owner_name = :owner, phone = :phone,
                 email = :email, address = :address, city = :city, status = 'approved',
                 admin_note = 'Automatically managed for AIMEDIX pharmacy partner', updated_at = CURRENT_TIMESTAMP
             where id = :id and module_key = 'medical'"
        )->execute([
            'zone' => $provider['zone_id'],
            'shop' => $storeName,
            'owner' => trim((string) ($provider['name'] ?? '')) ?: $storeName,
            'phone' => trim((string) ($provider['phone'] ?? '')),
            'email' => trim((string) ($provider['email'] ?? '')) ?: null,
            'address' => trim((string) ($provider['address'] ?? '')) ?: null,
            'city' => trim((string) ($provider['city'] ?? '')) ?: null,
            'id' => $vendorId,
        ]);
    }

    public function storeProvider(): void
    {
        Auth::requireAdmin();
        MedicalServiceSchema::ensure();
        ZoneSchema::ensure();
        $type = in_array(($_POST['provider_type'] ?? ''), ['pharmacy', 'lab', 'doctor'], true)
            ? (string) $_POST['provider_type'] : 'pharmacy';
        $name = trim((string) ($_POST['name'] ?? ''));
        $phone = trim((string) ($_POST['phone'] ?? ''));
        $password = (string) ($_POST['password'] ?? '');
        if ($name === '' || $phone === '' || strlen($password) < 8) {
            Response::redirect('/admin/medical/providers');
            return;
        }
        try {
            $zoneId = $this->zoneId();
            if ($zoneId === null) { Response::redirect('/admin/medical/providers'); return; }
            VendorSchema::ensure();
            $db = Database::connection();
            $db->beginTransaction();
            $s = $db->prepare("insert into medical_providers (provider_type,vendor_id,zone_id,name,business_name,phone,email,password_hash,license_number,speciality,qualification,consultation_fee,service_modes,status,created_at,updated_at) values (:type,null,:zone,:name,:business,:phone,:email,:password,:license,:speciality,:qualification,:fee,:modes,'approved',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)");
            $s->execute([
                'type' => $type,
                'zone' => $zoneId,
                'name' => $name,
                'business' => trim((string) ($_POST['business_name'] ?? '')),
                'phone' => $phone,
                'email' => trim((string) ($_POST['email'] ?? '')),
                'password' => password_hash($password, PASSWORD_DEFAULT),
                'license' => trim((string) ($_POST['license_number'] ?? '')),
                'speciality' => trim((string) ($_POST['speciality'] ?? '')),
                'qualification' => trim((string) ($_POST['qualification'] ?? '')),
                'fee' => max(0, (float) ($_POST['consultation_fee'] ?? 0)),
                'modes' => trim((string) ($_POST['service_modes'] ?? '')),
            ]);
            $providerId = (int) $db->lastInsertId();
            if ($type === 'pharmacy' && $this->ensurePharmacyStore($providerId) < 1) {
                throw new \RuntimeException('The pharmacy store account could not be created.');
            }
            $db->commit();
            Response::redirect('/admin/medical/providers/' . $providerId);
        } catch (\Throwable) {
            if (isset($db) && $db->inTransaction()) {
                $db->rollBack();
            }
            Response::redirect('/admin/medical/providers');
        }
    }

    public function status(int $id): void
    {
        Auth::requireAdmin();MedicalServiceSchema::ensure();VendorSchema::ensure();$status=(string)($_POST['status']??'pending');
        if(!in_array($status,['pending','approved','suspended','rejected'],true))$status='pending';
        $db=Database::connection();$db->beginTransaction();
        try{
            $provider=$db->prepare('select provider_type from medical_providers where id=:id'.Auth::zoneWhere('medical_providers').' limit 1');$provider->execute(Auth::zoneParams(['id'=>$id]));$type=(string)($provider->fetchColumn()?:'');
            $db->prepare('update medical_providers set status=:status,updated_at=CURRENT_TIMESTAMP where id=:id'.Auth::zoneWhere('medical_providers'))->execute(Auth::zoneParams(['status'=>$status,'id'=>$id]));
            if($type==='pharmacy'&&$status==='approved'&&$this->ensurePharmacyStore($id)<1){throw new \RuntimeException('The pharmacy store account could not be created.');}
            $db->commit();
        }catch(\Throwable){if($db->inTransaction()){$db->rollBack();}}
        Response::redirect('/admin/medical/providers');
    }

    public function show(int $id): void
    {
        Auth::requireAdmin();MedicalServiceSchema::ensure();$db=Database::connection();$s=$db->prepare('select * from medical_providers where id=:id'.Auth::zoneWhere('medical_providers'));$s->execute(Auth::zoneParams(['id'=>$id]));$provider=$s->fetch();if(!$provider){http_response_code(404);echo 'Partner not found';return;}
        $labTests=[];$activity=[];$products=[];
        if($provider['provider_type']==='lab'){$q=$db->prepare('select * from medical_lab_tests where provider_id=:id'.Auth::zoneWhere('medical_lab_tests').' order by id desc');$q->execute(Auth::zoneParams(['id'=>$id]));$labTests=$q->fetchAll();$q=$db->prepare('select b.*,t.name test_name from medical_lab_bookings b join medical_lab_tests t on t.id=b.test_id where b.provider_id=:id'.Auth::zoneWhere('b').' order by b.id desc limit 50');}
        elseif($provider['provider_type']==='doctor'){$q=$db->prepare('select c.* from medical_consultations c where c.doctor_id=:id'.Auth::zoneWhere('c').' order by c.id desc limit 50');}
        else{$q=$db->prepare('select r.* from medical_prescription_requests r where r.pharmacy_id=:id'.Auth::zoneWhere('r').' order by r.id desc limit 50');}
        $q->execute(Auth::zoneParams(['id'=>$id]));$activity=$q->fetchAll();
        $store=null;if($provider['provider_type']==='pharmacy'&&(int)($provider['vendor_id']??0)>0){$storeQuery=$db->prepare("select id,shop_name,owner_name,status from vendors where id=:id and module_key='medical'".Auth::zoneWhere('vendors').' limit 1');$storeQuery->execute(Auth::zoneParams(['id'=>(int)$provider['vendor_id']]));$store=$storeQuery->fetch()?:null;}
        if($provider['provider_type']==='pharmacy'&&(int)($provider['vendor_id']??0)>0){$q=$db->prepare("select id,name,unit,price,discount_price,stock,status from products where module_key='medical' and vendor_id=:vendor".Auth::zoneWhere('products').' order by id desc');$q->execute(Auth::zoneParams(['vendor'=>(int)$provider['vendor_id']]));$products=$q->fetchAll();}
        View::render('admin/medical-provider-profile',['title'=>'Partner Profile','provider'=>$provider,'labTests'=>$labTests,'activity'=>$activity,'store'=>$store,'products'=>$products]);
    }

    public function update(int $id): void
    {
        Auth::requireAdmin();MedicalServiceSchema::ensure();VendorSchema::ensure();$status=in_array(($_POST['status']??'pending'),['pending','approved','suspended','rejected'],true)?$_POST['status']:'pending';$type=in_array(($_POST['provider_type']??''),['pharmacy','lab','doctor'],true)?$_POST['provider_type']:'pharmacy';
        $zoneId=$this->zoneId();if($zoneId===null){Response::redirect('/admin/medical/providers/'.$id);return;}
        $db=Database::connection();$db->beginTransaction();
        try{
            $s=$db->prepare('update medical_providers set provider_type=:type,zone_id=:zone,name=:name,business_name=:business,phone=:phone,email=:email,license_number=:license,speciality=:speciality,qualification=:qualification,experience_years=:experience,consultation_fee=:fee,service_modes=:modes,address=:address,address_line=:address_line,floor=:floor,landmark=:landmark,city=:city,state=:state,pincode=:pincode,description=:description,opening_hours=:hours,service_radius_km=:radius,home_collection_fee=:collection,default_delivery_fee=:delivery,availability_text=:availability,status=:status,updated_at=CURRENT_TIMESTAMP where id=:id'.Auth::zoneWhere('medical_providers'));
            $s->execute(Auth::zoneParams(['type'=>$type,'zone'=>$zoneId,'name'=>trim((string)($_POST['name']??'')),'business'=>trim((string)($_POST['business_name']??'')),'phone'=>trim((string)($_POST['phone']??'')),'email'=>trim((string)($_POST['email']??'')),'license'=>trim((string)($_POST['license_number']??'')),'speciality'=>trim((string)($_POST['speciality']??'')),'qualification'=>trim((string)($_POST['qualification']??'')),'experience'=>max(0,(int)($_POST['experience_years']??0)),'fee'=>max(0,(float)($_POST['consultation_fee']??0)),'modes'=>trim((string)($_POST['service_modes']??'')),'address'=>trim((string)($_POST['address']??'')),'address_line'=>trim((string)($_POST['address_line']??'')),'floor'=>trim((string)($_POST['floor']??'')),'landmark'=>trim((string)($_POST['landmark']??'')),'city'=>trim((string)($_POST['city']??'')),'state'=>trim((string)($_POST['state']??'')),'pincode'=>trim((string)($_POST['pincode']??'')),'description'=>trim((string)($_POST['description']??'')),'hours'=>trim((string)($_POST['opening_hours']??'')),'radius'=>max(0,(float)($_POST['service_radius_km']??0)),'collection'=>max(0,(float)($_POST['home_collection_fee']??0)),'delivery'=>max(0,(float)($_POST['default_delivery_fee']??0)),'availability'=>trim((string)($_POST['availability_text']??'')),'status'=>$status,'id'=>$id]));
            if($type!=='pharmacy'){$db->prepare('update medical_providers set vendor_id=null where id=:id'.Auth::zoneWhere('medical_providers'))->execute(Auth::zoneParams(['id'=>$id]));}
            if($type==='pharmacy'&&$status==='approved'&&$this->ensurePharmacyStore($id)<1){throw new \RuntimeException('The pharmacy store account could not be created.');}
            $db->commit();
        }catch(\Throwable){if($db->inTransaction()){$db->rollBack();}}
        Response::redirect('/admin/medical/providers/'.$id);
    }

    public function storeLabTest(): void
    {
        Auth::requireAdmin();MedicalServiceSchema::ensure();$name=trim((string)($_POST['name']??''));
        $providerId=(int)($_POST['provider_id']??0);$zoneId=$this->labZoneId($providerId);
        if($name!==''&&$zoneId!==null)Database::connection()->prepare("insert into medical_lab_tests (provider_id,zone_id,name,code,description,price,preparation,report_hours,home_collection,status,created_at,updated_at) values (:provider,:zone,:name,:code,:description,:price,:preparation,:hours,:home,'active',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)")->execute(['provider'=>$providerId?:null,'zone'=>$zoneId,'name'=>$name,'code'=>trim((string)($_POST['code']??'')),'description'=>trim((string)($_POST['description']??'')),'price'=>max(0,(float)($_POST['price']??0)),'preparation'=>trim((string)($_POST['preparation']??'')),'hours'=>max(1,(int)($_POST['report_hours']??24)),'home'=>isset($_POST['home_collection'])?1:0]);
        Response::redirect('/admin/medical/providers');
    }

    public function updateLabTest(int $id): void
    {
        Auth::requireAdmin();MedicalServiceSchema::ensure();$providerId=(int)($_POST['provider_id']??0);$zoneId=$this->labZoneId($providerId);if($zoneId===null){Response::redirect('/admin/medical/providers/'.$providerId);return;}$status=in_array(($_POST['status']??'active'),['active','inactive'],true)?$_POST['status']:'active';Database::connection()->prepare('update medical_lab_tests set provider_id=:provider,zone_id=:zone,name=:name,code=:code,description=:description,price=:price,preparation=:preparation,report_hours=:hours,home_collection=:home,status=:status,updated_at=CURRENT_TIMESTAMP where id=:id'.Auth::zoneWhere('medical_lab_tests'))->execute(Auth::zoneParams(['provider'=>$providerId?:null,'zone'=>$zoneId,'name'=>trim((string)($_POST['name']??'')),'code'=>trim((string)($_POST['code']??'')),'description'=>trim((string)($_POST['description']??'')),'price'=>max(0,(float)($_POST['price']??0)),'preparation'=>trim((string)($_POST['preparation']??'')),'hours'=>max(1,(int)($_POST['report_hours']??24)),'home'=>isset($_POST['home_collection'])?1:0,'status'=>$status,'id'=>$id]));Response::redirect('/admin/medical/providers/'.$providerId);
    }

    public function paymentStatus(string $entityType, int $id): void
    {
        Auth::requireAdmin(); MedicalServiceSchema::ensure();
        if (!in_array($entityType, ['lab_booking', 'consultation'], true)) { Response::json(['message'=>'Invalid payment entity'],422); return; }
        $status=(string)($_POST['payment_status']??'');
        if(!in_array($status,['pending','verified','rejected','refunded'],true)){Response::json(['message'=>'Invalid payment status'],422);return;}
        $table=$entityType==='lab_booking'?'medical_lab_bookings':'medical_consultations';
        $db=Database::connection();
        $lookup=$db->prepare("select $table.*, medical_payment_transactions.id transaction_id, medical_payment_transactions.currency, medical_payment_transactions.gateway_response from $table left join medical_payment_transactions on medical_payment_transactions.entity_type=:type and medical_payment_transactions.entity_id=$table.id where $table.id=:id".Auth::zoneWhere($table).' limit 1');
        $lookup->execute(Auth::zoneParams(['id'=>$id,'type'=>$entityType]));$current=$lookup->fetch();
        if(!$current){Response::json(['message'=>'Payment entity not found'],404);return;}
        if ($status === 'refunded') {
            $this->refundMedicalPayment($entityType,$table,$current);
            return;
        }
        $mapped = MedicalPaymentState::reconciledStatus((string) $current['payment_status'], $status, (string) $current['status']);
        if ($mapped === null) { Response::json(['message'=>'Invalid medical payment transition.'],409); return; }
        $db->beginTransaction();
        try{
            $update=$db->prepare("update $table set payment_status=:status,updated_at=CURRENT_TIMESTAMP where id=:id and payment_status=:previous");$update->execute(['status'=>$mapped,'id'=>$id,'previous'=>$current['payment_status']]);
            if($update->rowCount()!==1)throw new \RuntimeException('Payment status changed. Refresh before trying again.');
            $transactionStatus=$mapped==='refund_pending'?'refund_pending':($status==='verified'?'verified':($status==='rejected'?'rejected':'pending'));
            $db->prepare('update medical_payment_transactions set status=:status,reconciled_at=CURRENT_TIMESTAMP,reconciled_by=:admin,updated_at=CURRENT_TIMESTAMP where entity_type=:type and entity_id=:id')->execute(['status'=>$transactionStatus,'admin'=>$_SESSION['admin_name']??'Admin','type'=>$entityType,'id'=>$id]);
            $db->commit();
        }catch(\Throwable $e){if($db->inTransaction())$db->rollBack();Response::json(['message'=>$e->getMessage()],409);return;}
        Response::redirect('/admin/medical/providers');
    }

    private function refundMedicalPayment(string $entityType,string $table,array $current): void
    {
        if((string)$current['status']!=='cancelled'||!in_array((string)$current['payment_status'],['refund_pending','refund_failed'],true)){Response::json(['message'=>'Only a cancelled paid booking awaiting refund can be refunded.'],409);return;}
        $db=Database::connection();$id=(int)$current['id'];
        $reserve=$db->prepare("update $table set payment_status='refund_processing',updated_at=CURRENT_TIMESTAMP where id=:id and status='cancelled' and payment_status in ('refund_pending','refund_failed')");$reserve->execute(['id'=>$id]);
        if($reserve->rowCount()!==1){Response::json(['message'=>'Refund is already being processed or completed.'],409);return;}
        $db->prepare("update medical_payment_transactions set status='refund_processing',updated_at=CURRENT_TIMESTAMP where entity_type=:type and entity_id=:id")->execute(['type'=>$entityType,'id'=>$id]);
        $gatewayResult=(string)($current['payment_method']??'')==='online_payment'?PaymentGatewayClient::refund('medical',['entity_id'=>$id,'amount'=>(float)$current['amount'],'currency'=>(string)$current['currency'],'reason'=>'Medical booking cancellation','idempotency_key'=>'medical:'.$entityType.':'.$id],$current):null;
        $gatewayJson=$gatewayResult===null?null:(json_encode($gatewayResult,JSON_UNESCAPED_SLASHES)?:'{}');
        if($gatewayResult!==null&&($gatewayResult['ok']??false)!==true){$db->prepare("update $table set payment_status='refund_failed',updated_at=CURRENT_TIMESTAMP where id=:id and payment_status='refund_processing'")->execute(['id'=>$id]);$db->prepare("update medical_payment_transactions set status='refund_failed',gateway_response=:response,reconciled_at=CURRENT_TIMESTAMP,reconciled_by=:admin,updated_at=CURRENT_TIMESTAMP where entity_type=:type and entity_id=:id")->execute(['response'=>$gatewayJson,'admin'=>$_SESSION['admin_name']??'Admin','type'=>$entityType,'id'=>$id]);Response::redirect('/admin/medical/providers');return;}
        $db->beginTransaction();
        try{$finish=$db->prepare("update $table set payment_status='refunded',updated_at=CURRENT_TIMESTAMP where id=:id and payment_status='refund_processing'");$finish->execute(['id'=>$id]);if($finish->rowCount()!==1)throw new \RuntimeException('Refund status changed.');$db->prepare("update medical_payment_transactions set status='refunded',gateway_response=:response,reconciled_at=CURRENT_TIMESTAMP,reconciled_by=:admin,updated_at=CURRENT_TIMESTAMP where entity_type=:type and entity_id=:id")->execute(['response'=>$gatewayJson,'admin'=>$_SESSION['admin_name']??'Admin','type'=>$entityType,'id'=>$id]);$db->commit();}catch(\Throwable $e){if($db->inTransaction())$db->rollBack();$db->prepare("update $table set payment_status='refund_failed',updated_at=CURRENT_TIMESTAMP where id=:id and payment_status='refund_processing'")->execute(['id'=>$id]);Response::json(['message'=>'Refund could not be completed and is ready to retry.'],500);return;}
        Response::redirect('/admin/medical/providers');
    }

    private function zoneId(): ?int
    {
        $id = Auth::isZoneScoped() ? Auth::zoneId() : ((int) ($_POST['zone_id'] ?? 0) ?: null);
        if ($id === null) return null;
        $stmt = Database::connection()->prepare('select id from zones where id=:id and status=1 limit 1');
        $stmt->execute(['id'=>$id]);
        return $stmt->fetchColumn() ? $id : null;
    }

    private function labZoneId(int $providerId): ?int
    {
        if ($providerId < 1) return $this->zoneId();
        $stmt = Database::connection()->prepare("select zone_id from medical_providers where id=:id and provider_type='lab'".Auth::zoneWhere('medical_providers').' limit 1');
        $stmt->execute(Auth::zoneParams(['id'=>$providerId]));
        $zoneId = (int) $stmt->fetchColumn();
        return $zoneId > 0 ? $zoneId : null;
    }
}
