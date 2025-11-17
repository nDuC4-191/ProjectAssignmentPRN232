ALTER TABLE dbo.Orders
DROP CONSTRAINT CK__Orders__PaymentM__71D1E811;

ALTER TABLE dbo.Orders
ADD CONSTRAINT CK_Orders_PaymentMethod
CHECK (PaymentMethod IN ('COD', 'VNPAY'));

thêm 2 query này để update Database cho việc sử dụng phương thức thanh toán bằng VNPAY
