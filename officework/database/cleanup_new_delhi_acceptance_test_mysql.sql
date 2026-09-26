-- Removes only records created by new_delhi_acceptance_test.sql.
-- Run this only after acceptance testing and after taking a database backup.

start transaction;

delete from delivery_route_snapshots where order_id = 9100;
delete from delivery_locations where order_id = 9100 or delivery_man_id = 9100;
delete from order_status_history where order_id = 9100;
delete from refund_requests where order_id = 9100;
delete from payment_transactions where order_id = 9100;
delete from medical_prescriptions where order_id = 9100;
delete from order_items where order_id = 9100 or product_id in (9100, 9101);
delete from orders where id = 9100 or order_number = 'TEST-DELHI-ORDER-9100';

delete from product_images where product_id in (9100, 9101);
delete from product_variants where product_id in (9100, 9101);
delete from products where id in (9100, 9101) and module_key = 'medical';

delete from device_tokens where owner_id = 9100 and owner_type in ('provider', 'worker');
delete from push_outbox where recipient_id = 9100;
delete from customer_addresses where id = 9100;
delete from medical_providers where id = 9100 and email = 'delhi.pharmacy.test@aimedixmeds.com';
delete from delivery_men where id = 9100 and phone = '9000001106';
delete from vendors where id = 9100 and module_key = 'medical';
delete from zones where id = 9100 and name = 'New Delhi Test Zone';

commit;
