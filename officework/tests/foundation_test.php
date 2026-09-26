<?php

declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

use App\Support\CustomerIdentity;
use App\Support\MedicalDocumentAccess;
use App\Support\MedicalPaymentState;
use App\Support\MigrationRunner;
use App\Support\PaymentWebhookVerifier;
use App\Support\RefundState;
use App\Support\Security;
use App\Support\Upload;

expect(CustomerIdentity::guestId(42) === 'customer-42', 'Customer guest id must be server-derived.');
expect(CustomerIdentity::owns('customer-42', 'customer-42', true), 'Authenticated owner should match its canonical guest id.');
expect(!CustomerIdentity::owns('victim', 'victim', true), 'Authenticated access must not trust an arbitrary supplied guest id.');
$guestKey = str_repeat('k', 32);
$issuedGuest = CustomerIdentity::issueGuestCredential($guestKey);
expect($issuedGuest['guest_id'] !== 'chosen-by-client', 'Guest identity must be server-issued.');
expect(CustomerIdentity::guestIdFromCredential($issuedGuest['guest_credential'], $guestKey) === $issuedGuest['guest_id'], 'Issued guest credential must resolve its server identity.');
expect(CustomerIdentity::guestIdFromCredential($issuedGuest['guest_credential'] . '0', $guestKey) === null, 'Tampered guest credential must be rejected.');

expect(
    PaymentWebhookVerifier::configurationError(true, 'live', '') !== null,
    'A live enabled payment module must reject a missing webhook secret.'
);
expect(PaymentWebhookVerifier::configurationError(false, 'live', '', 'local') !== null, 'Live webhooks must require a secret even when online payment is disabled.');
expect(PaymentWebhookVerifier::configurationError(true, 'test', '', 'local') !== null, 'Enabled online payment must always require a webhook secret.');
expect(PaymentWebhookVerifier::configurationError(false, 'test', '', 'production') !== null, 'Production must never accept unsigned webhooks.');
expect(PaymentWebhookVerifier::configurationError(false, 'test', '', 'local') === null, 'Explicit local test mode may accept an unsigned webhook only while online payment is disabled.');
expect(PaymentWebhookVerifier::validTransaction(['amount' => '100', 'currency' => 'INR', 'order_id' => '7'], ['amount' => 100], '7'), 'Matching webhook transaction should verify.');
expect(!PaymentWebhookVerifier::validTransaction(['amount' => '100', 'currency' => 'INR'], ['amount' => 100], '7'), 'Webhook without an entity must be rejected.');
expect(PaymentWebhookVerifier::legalTransition('paid', 'refunded'), 'Paid webhook state must allow a refund.');
expect(!PaymentWebhookVerifier::legalTransition('paid', 'payment_rejected'), 'Paid webhook state must not regress to rejected.');
expect(!PaymentWebhookVerifier::legalTransition('refunded', 'paid'), 'Refunded webhook state must be terminal.');

expect(RefundState::canRequest('pending', 'approved'), 'Pending refund should be approvable.');
expect(RefundState::canRequest('approved', 'refunded'), 'Approved refund should be completable.');
expect(RefundState::canRequest('refund_failed', 'refunded'), 'Failed refund should be retryable.');
expect(!RefundState::canRequest('processing', 'refunded'), 'Concurrent refund completion must not be reservable twice.');
expect(!RefundState::canRequest('refunded', 'approved'), 'Completed refund must be terminal.');
expect(RefundState::creditsWallet('wallet'), 'Wallet payments must refund to the customer wallet.');
expect(!RefundState::creditsWallet('online_payment'), 'Gateway refunds must not also credit the customer wallet.');

expect(MedicalPaymentState::reconciledStatus('pending_verification', 'verified', 'confirmed') === 'paid', 'Verified medical payment should become paid.');
expect(MedicalPaymentState::reconciledStatus('pending_verification', 'verified', 'cancelled') === 'refund_pending', 'Cancelled verified payment must go directly to refund review.');
expect(MedicalPaymentState::reconciledStatus('unpaid', 'verified', 'confirmed') === null, 'Cash service must not be marked paid before completion.');
expect(MedicalPaymentState::reconciledStatus('unpaid', 'verified', 'completed') === 'paid', 'Completed cash service may be reconciled as paid.');
expect(MedicalPaymentState::reconciledStatus('paid', 'refunded', 'cancelled') === null, 'Paid medical booking must reserve a refund before completion.');
expect(MedicalPaymentState::cancelledStatus('paid') === 'refund_pending', 'Cancelling a paid medical booking must request a refund.');
expect(MedicalPaymentState::cancelledStatus('unpaid') === 'unpaid', 'Cancelling an unpaid medical booking must not claim a refund.');

expect(MedicalDocumentAccess::customerOwns(['customer_id' => 7, 'guest_id' => 'legacy'], 7), 'Customer id must authorize a private medical document.');
expect(MedicalDocumentAccess::customerOwns(['customer_id' => null, 'guest_id' => 'customer-7'], 7), 'Canonical guest id must authorize a legacy private medical document.');
expect(!MedicalDocumentAccess::customerOwns(['customer_id' => null, 'guest_id' => 'customer-8'], 7), 'Another customer must not access a legacy private medical document.');
expect(MedicalDocumentAccess::adminOwns('super_admin', null, null), 'Full admin should retain private document access.');
expect(!MedicalDocumentAccess::adminOwns('zone_manager', null, 2), 'Zone manager without a zone must fail closed.');
expect(!MedicalDocumentAccess::adminOwns('zone_manager', 1, 2), 'Zone manager must not access another zone document.');
expect(MedicalDocumentAccess::adminOwns('zone_manager', 2, 2), 'Zone manager should access an owned-zone document.');

expect(Security::tokenExpired('', time()), 'Missing worker expiry must fail closed.');
expect(Security::tokenExpired('2020-01-01 00:00:00', time()), 'Past worker expiry must be rejected.');
expect(!Security::tokenExpired('2999-01-01 00:00:00', time()), 'Future worker expiry must remain valid.');

expect(Upload::privateRelativePath('medical/lab-reports/report.pdf') === 'medical/lab-reports/report.pdf', 'Valid private path rejected.');
expect(Upload::privateRelativePath('../public/secret.pdf') === null, 'Traversal path accepted.');
expect(Upload::privateRelativePath('/uploads/medical/lab-reports/report.pdf') === null, 'Public path accepted as private storage path.');

$directory = sys_get_temp_dir() . '/aimedix-migrations-' . bin2hex(random_bytes(4));
mkdir($directory);
file_put_contents($directory . '/001_test.sql', 'create table test_items (id integer primary key);');
expect(array_map('basename', MigrationRunner::pendingFiles($directory, [])) === ['001_test.sql'], 'Pending migration was not discovered.');
expect(MigrationRunner::pendingFiles($directory, ['001_test.sql']) === [], 'Recorded migration was not skipped on replay.');
unlink($directory . '/001_test.sql');
rmdir($directory);

echo "foundation checks passed\n";
